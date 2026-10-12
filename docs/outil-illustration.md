# Outil d'illustration de la BD (Gemini) — guide pas à pas

Cet outil génère ou retouche les illustrations du Mode Histoire **directement depuis ton PC**, sans
copier-coller dans AI Studio. Il construit le prompt tout seul (règles de `methode-illustration.md`),
joint les bonnes références, et ne remplace **jamais** une image sans ton accord.

Toutes les commandes se tapent dans **PowerShell**, dans le dossier du projet :

```powershell
cd "$HOME\Desktop\Nouveau dossier\revision-ia"
git pull
```

---

## 1. Une seule fois : la clé API

1. Va sur **aistudio.google.com** → *Get API key* → crée ou copie ta clé.
2. Crée le fichier `.env.local` à la racine du projet (il est dans `.gitignore` : il ne part jamais
   sur GitHub) :

   ```powershell
   notepad .env.local
   ```

   Écris une seule ligne, enregistre, ferme :

   ```
   GEMINI_API_KEY=ta_clé
   ```

   (Si tu as déjà un fichier `.env` avec `GEMINI_API_KEY` pour `npm run traduire`, l'outil le lit
   aussi : rien à refaire.)
3. Vérifie quels modèles d'images ta clé peut utiliser :

   ```powershell
   npm run modeles-images
   ```

   Si la liste est vide ou que l'outil dit « aucun modèle ouvert à ta clé », les modèles d'images
   demandent peut-être la **facturation** activée sur ton projet Google (voir §8).
   Pour imposer un modèle de la liste, ajoute dans `.env.local` :
   `GEMINI_IMAGE_MODEL=nom-du-modèle`.

> 🔒 La clé n'est jamais affichée, jamais écrite dans un fichier du projet, jamais envoyée ailleurs
> qu'à Google (dans un en-tête, pas dans l'adresse).

---

## 2. Une seule fois : les références

Dépose les fiches des personnages et les décors vides dans `references/` (voir
`references/README.md` : noms exacts des fichiers). Au minimum : `kai.png`, `kai-bande.png`,
`mory.png`, `nia.png`, `binta.png`, et un décor par lieu (`bibliotheque.jpg`…).
Sans fiche, l'outil marche quand même, mais il t'avertit (⚠️) et Gemini se fie au texte seul.

---

## 3. Essayer SANS rien envoyer (mode essai)

Ajoute `--essai` à n'importe quelle commande : l'outil montre le prompt et la liste des images
qu'il enverrait, sans appeler Gemini (pas besoin de clé, aucun quota utilisé).

```powershell
npm run retoucher -- 3 4 2 "Enlève le bandage de la main gauche de Kaï" --essai
```

Le prompt complet est aussi écrit dans `public/story/chapitre-3/_propositions/essai-page-4-case-2.txt`.

---

## 4. Retoucher une case

```powershell
npm run retoucher -- 3 4 2 "Seule la main DROITE de Kaï est bandée : enlève le bandage de sa main gauche"
```

= chapitre 3, page 4, case 2, puis la consigne **entre guillemets**. Gemini reçoit l'image actuelle
et doit changer **uniquement** ce qui est demandé (composition, cadrage, style, couleurs, taille gardés).
Conseils : une seule correction à la fois ; une consigne en anglais est souvent mieux suivie.

---

## 5. Générer des cases

```powershell
npm run generer -- 3 5 2      # la case 2 de la page 5
npm run generer -- 3 5        # toutes les cases de la page 5
npm run generer -- 3          # les cases du chapitre 3 qui n'ont PAS encore d'image
npm run generer -- 3 --toutes # toutes les cases du chapitre (attention au quota !)
```

Le prompt est construit à partir de la description de la case (`src/data/comic/chapitres/ch03.js`),
traduite en anglais, avec les blocs STYLE, REALISM LOCK, SCENE LOCK, CHARACTER LOCK, EYE-LINE,
HEIGHT/AGE LOCK (adultes d'environ 20 ans), PHYSICAL LOGIC et DO NOT (aucun texte, aucune lettre,
aucune bulle, aucune forme blanche). Les cases `[ÉCRAN APPLI]` et `[DESSIN APPLI]` sont ignorées.

---

## 6. Plusieurs retouches d'un coup (lot)

1. Ouvre (ou crée en copiant `docs/retouches/exemple.json`) le fichier du chapitre :

   ```powershell
   notepad docs\retouches\chapitre-3.json
   ```

2. Chaque tâche :

   ```json
   { "type": "retouche", "page": 4, "case": 2, "consigne": "…" }
   { "type": "generation", "page": 3, "case": 5, "consigne": "précision facultative" }
   ```

   Options : `"personnages": ["nia", "kai", "kai-bande", "mory"]` (impose la liste des personnages
   visibles), `"decor": "bibliotheque"`, `"references": ["references/autre.png"]`,
   `"ignorer": true` (tâche mise de côté).
3. Lance :

   ```powershell
   npm run illustrer-lot -- 3 --essai    # vérifier d'abord
   npm run illustrer-lot -- 3
   ```

Les tâches déjà faites sont **sautées** au lancement suivant (`--refaire` pour les refaire).

---

## 7. Comparer, puis accepter

```powershell
npm run comparer -- 3
```

La page avant / après s'ouvre dans ton navigateur
(`public/story/chapitre-3/_propositions/comparer.html`). Sous chaque proposition, la commande à copier :

```powershell
npm run accepter -- 3 4 2
```

→ l'ancienne image part dans `public/story/chapitre-3/_sauvegardes/`, la proposition (la plus
récente, ou celle dont tu donnes le nom de fichier en 4ᵉ argument) devient `page-4-case-2.png`,
recadrée en 16:9 si besoin. Ensuite :

```powershell
npm run verifier-bulles -- 3
git add public/story/chapitre-3
git commit -m "Chapitre 3 : retouche page 4 case 2"
git push
```

Les dossiers `_propositions/` et `_sauvegardes/` ne sont ni publiés dans l'appli, ni envoyés sur GitHub.

---

## 8. Quota, limites et erreurs

- **Quota du jour épuisé / trop de demandes (429)** : l'outil s'arrête proprement et te dit
  **quand réessayer** (les quotas Google repartent à minuit, heure du Pacifique ≈ 7 h ou 8 h à Conakry).
  Relance la même commande à cette heure : il reprend là où il s'était arrêté.
  Pour essayer plus tôt quand même : ajoute `--forcer`.
- **Gemini surchargé (503)** : 3 nouveaux essais automatiques (15 s, 30 s, 60 s), puis arrêt propre.
- **Pas d'image renvoyée** (contenu refusé) : la case est notée en échec, l'outil passe à la suivante ;
  reformule la consigne.
- **Clé refusée** : vérifie la ligne `GEMINI_API_KEY=` dans `.env.local`.
- **Coût** : selon Google et la date, les modèles d'images de l'API peuvent ne **pas** avoir de quota
  gratuit (il faut alors activer la facturation : une image coûte quelques centimes). Fais toujours un
  `--essai` avant un lot, et préfère les commandes case par case.

## 9. Réglages facultatifs (`.env.local`)

| Ligne | Effet |
|---|---|
| `GEMINI_IMAGE_MODEL=…` | impose le modèle d'images (voir `npm run modeles-images`) |
| `ILLUS_MAX_REFS=6` | nombre maximal d'images jointes (2 à 14) |
| `ILLUS_STYLE_REFS=2` | nombre de cases de style jointes pour une génération |
| `ILLUS_TRADUIRE=non` | envoie la description en français, sans traduction |
| `ILLUS_FOURNISSEUR=gemini` | service d'images (seul Gemini existe pour l'instant) |

## 10. Pour le développeur

`scripts/illustrer.mjs` (commandes), `scripts/illustration/config.mjs` (clé, personnages, décors),
`scripts/illustration/prompt.mjs` (détection des personnages, références, prompts),
`scripts/illustration/fournisseurs/` (un fichier par service : `gemini.mjs` ; pour en ajouter un,
copier son interface et l'inscrire dans `index.mjs`).
