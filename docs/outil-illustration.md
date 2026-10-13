# Outil d'illustration de la BD (Gemini) — guide pas à pas

Cet outil génère ou retouche les illustrations du Mode Histoire **directement depuis ton PC**, sans
copier-coller dans AI Studio. Il construit le prompt tout seul (règles de `methode-illustration.md`),
joint les bonnes références, et ne remplace **jamais** une image sans ton accord.

Deux façons de s'en servir :

| | Mode API (automatique) | **Mode gratuit à la main** (semi-automatique) |
|---|---|---|
| Qui génère l'image ? | l'outil, en appelant Gemini | **toi, dans AI Studio** (gratuit) |
| Clé API | obligatoire | inutile |
| Prérequis | un modèle d'images ouvert à ta clé (souvent la **facturation**) | rien |
| Commandes | `retoucher`, `generer`, `illustrer-lot` | `preparer` puis `importer` |

Si `npm run modeles-images` ne te donne rien (ou que l'outil dit « indisponible pour ta clé »), prends
le **mode gratuit à la main** : va directement au **§ A** ci-dessous. Tout le reste (références, lots,
`comparer`, `accepter`, sauvegardes) marche pareil dans les deux modes.

Toutes les commandes se tapent dans **PowerShell**, dans le dossier du projet. Pour **envoyer** tes
changements sur GitHub, une seule commande : **`npm run publier`** (§ B).

```powershell
cd "$HOME\Desktop\Nouveau dossier\revision-ia"
git pull
```

---

## B. ENVOYER SUR GITHUB EN UNE COMMANDE (`npm run publier`)

Fini `git add`, `git commit`, `git push` : une seule commande, après n'importe quel changement.

```powershell
npm run publier                              # message automatique en français
npm run publier -- "Chapitre 3 : nouvelles bulles"   # ton propre message
npm run publier -- --essai                   # montre ce qui serait envoyé, sans rien faire
```

Dans l'ordre, l'outil :
1. fait **`git pull`** (récupère ce qui a été fait ailleurs : cloud, autre PC) ;
2. prépare **les fichiers modifiés du projet** — **jamais** `.env`, `.env.local`, `_propositions/`,
   `_sauvegardes/`, `node_modules` (même si tu les avais ajoutés par erreur) ; si une **clé API** est
   trouvée dans ce qui va partir, **tout s'arrête** avant d'enregistrer ;
3. fait le **commit** (message automatique du genre « Mise à jour : Chapitre 3 : image page 4 case 2 ;
   documentation » si tu n'en donnes pas) ;
4. fait le **push** sur `main` (quelques nouveaux essais si ta connexion est mauvaise).

Il affiche ensuite : « ✅ Envoyé sur GitHub : … » avec la liste des fichiers (le site se met à jour tout
seul en 3 à 4 minutes : onglet **Actions** de GitHub), ou « ✅ Rien à envoyer » s'il n'y a rien de nouveau,
ou une explication simple de l'erreur (pas de connexion, identifiants GitHub expirés, nom Git absent…).

**En cas de conflit** (les mêmes fichiers modifiés ici ET sur GitHub), ou si un fichier que tu as modifié
a aussi changé sur GitHub : l'outil **ne force rien**, remet ton dossier comme avant (rien n'est perdu),
t'indique les fichiers concernés et te dit quoi faire : ouvrir Claude Code dans le dossier et écrire
« Conflit git sur … : aide-moi à garder les deux versions sans rien perdre ».

Autres commandes qui publient toutes seules :

| Commande | Ce qu'elle fait |
|---|---|
| `npm run accepter -- 3 4 2` | remplace l'image, puis publie (`--sans-publier` pour ne pas envoyer) |
| `npm run bulles -- 3` | prend le **dernier** `bulles-chapitre-3*.json` de Téléchargements (même « bulles-chapitre-3 (1).json »), le copie dans `public/story/chapitre-3/bulles-chapitre-3.json`, puis publie (`--sans-publier`, `--essai`) |

Pour les bulles : Panneau créateur → ✏️ Éditer les bulles → 💾 Enregistrer (le fichier se télécharge),
puis `npm run bulles -- 3`. Le dossier Téléchargements est celui de Windows ; un autre dossier :
`ILLUS_TELECHARGEMENTS=D:\Telechargements` dans `.env.local`.

---

## A. MODE GRATUIT À LA MAIN (AI Studio) — étape par étape

L'outil fait le travail pénible (écrire le prompt, choisir les bonnes images, ranger le résultat) ;
toi, tu fais seulement le passage dans AI Studio.

### A1. Préparer une case

```powershell
# Retouche ciblée (avec une consigne entre guillemets) :
npm run preparer -- 3 4 2 "Seule la main DROITE de Kaï est bandée : enlève le bandage de sa main gauche"

# Génération (sans consigne) :
npm run preparer -- 3 5 2
```

(= chapitre 3, page 4, case 2.) L'outil :
1. construit **exactement le même prompt** que le mode API et l'affiche ;
2. le **copie dans le presse-papiers** (rien à sélectionner) ;
3. met les **images à joindre** dans un dossier, avec des **noms parlants** (`a-RETOUCHER-page-4-case-2.png`,
   `style-page-4-case-1.jpg`, `perso-kai-bande.jpg`, `perso-mory.jpg`, `decor-bibliotheque.jpg`) —
   seulement les personnages **présents dans la case** — et **ouvre ce dossier** dans l'Explorateur Windows
   (`%TEMP%\revision-ia-illustration\ch3-p4-c2`) ;
4. te rappelle les étapes. Les lignes ⚠️ t'indiquent les références manquantes (voir `references/README.md`).

Pour voir tout ça **sans rien copier ni ouvrir** : ajoute `--essai`.

### A2. Dans AI Studio (aistudio.google.com)

1. **Nouvelle discussion** (une par case, voir `methode-illustration.md` §4).
2. Vérifie que le **modèle « Image »** est sélectionné (Nano Banana / Gemini Image).
3. **Colle le prompt** (Ctrl+V).
4. **Joins d'abord la case à retoucher SEULE** (`a-RETOUCHER-…`), **puis toutes les autres images ensemble**
   (`style-…`, `perso-…`, `decor-…`). **L'ordre des autres n'a aucune importance** : AI Studio et Gemini
   les mélangent souvent, et c'est normal. Le prompt ne parle jamais de « première » ou « deuxième » image :
   il décrit **chaque image par son contenu** (« the 16:9 comic panel showing Kaï… », « the character sheet
   of a young man with a big round afro… », « the empty university library… ») et dit à Gemini de les
   reconnaître lui-même. En retouche, il ajoute : « si tu hésites, l'image à modifier est celle qui
   correspond à cette description ». (En génération, joins simplement toutes les images ensemble.)
5. Clique sur **Générer**. Si le résultat n'est pas bon : une seule correction à la fois, et après
   deux essais ratés, recommence une nouvelle discussion.
6. **Télécharge l'ORIGINAL** (bouton de téléchargement de l'image, jamais une capture d'écran :
   la capture est plus petite et floue).

### A3. Ramener l'image

```powershell
npm run importer -- 3 4 2
```

L'outil prend l'**image la plus récente de ton dossier Téléchargements** (png, jpg ou webp, de moins de
**30 minutes**), la recadre en 16:9 si besoin et la range dans
`public/story/chapitre-3/_propositions/` sous le bon nom. **Ton fichier téléchargé n'est pas touché.**
Options :
- image plus ancienne : `npm run importer -- 3 4 2 --minutes=120` ;
- image ailleurs : `npm run importer -- 3 4 2 "C:\chemin\mon-image.png"` ;
- autre dossier Téléchargements : ajoute dans `.env.local` : `ILLUS_TELECHARGEMENTS=D:\Telechargements`.

### A4. Comparer, puis accepter (comme en mode API)

```powershell
npm run comparer -- 3
npm run accepter -- 3 4 2        # remplace l'image ET l'envoie sur GitHub tout seul
npm run verifier-bulles -- 3
```

(`accepter` lance `npm run publier` : plus aucune commande git à taper — voir le **§ B**.
Pour ne pas envoyer tout de suite : `npm run accepter -- 3 4 2 --sans-publier`.)

### A5. Plusieurs cases à la suite (lot)

Remplis `docs/retouches/chapitre-3.json` (voir §6 plus bas), puis répète ces deux commandes :

```powershell
npm run preparer -- 3 --suivante     # prépare la PROCHAINE tâche non faite
# … AI Studio …
npm run importer -- 3 <page> <case>  # (la commande exacte t'est rappelée) marque la tâche comme faite
```

`npm run preparer -- 3 --etat` montre où tu en es (✅ faite · ⏳ à faire · ⏸️ mise de côté).
Tu peux t'arrêter et reprendre le lendemain : l'avancement est gardé.

> Astuce : sans clé API, la description de la case reste en français dans le prompt (AI Studio la
> comprend). Avec une clé (même sans accès aux images), elle est traduite en anglais, comme en mode API.

---

---

## 1. Mode API — une seule fois : la clé API

> Cette partie ne sert qu'au **mode API**. Pour le mode gratuit à la main, tu n'as pas besoin de clé.

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

### Comment les images sont décrites dans le prompt (modes API et à la main)

| Image jointe | Description donnée à Gemini |
|---|---|
| case à retoucher | « the 16:9 comic panel showing *(personnages, lieu, début de la scène)* (this is the image to EDIT) » |
| case de style | « another finished panel of the same comic, a DIFFERENT scene… use it for the drawing style only » |
| fiche d'un personnage | « the character sheet of *(description visuelle courte)* on a plain background » |
| décor | « the empty *(lieu)* with no people » |

Chaque prompt contient aussi : « The attached images may be in any order: identify each one by its content. »
Seuls les personnages présents dans la case ont une fiche jointe.

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
recadrée en 16:9 si besoin. Puis **`accepter` publie tout seul** sur GitHub avec le message
« Chapitre 3 : retouche page 4 case 2 » (ou « illustration … » pour une génération) — voir le **§ B**.
Option `--sans-publier` pour garder le changement sur ton PC sans l'envoyer. Ensuite :

```powershell
npm run verifier-bulles -- 3
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
| `ILLUS_TELECHARGEMENTS=…` | dossier où `importer` cherche l'image (défaut : Téléchargements) |

## 10. Pour le développeur

`scripts/illustrer.mjs` (commandes), `scripts/illustration/config.mjs` (clé, personnages, décors),
`scripts/illustration/prompt.mjs` (détection des personnages, références, prompts),
Le mode à la main (`preparer`, `importer`) est dans `scripts/illustrer.mjs` et réutilise la même construction de prompt que le mode API (`construire`).
`scripts/illustration/fournisseurs/` (un fichier par service : `gemini.mjs` ; pour en ajouter un,
copier son interface et l'inscrire dans `index.mjs`).
