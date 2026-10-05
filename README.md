# 🎓 Révision IA — La Jeunesse de 2026

Application web de révision avec IA, installable sur téléphone (PWA), **gratuite**,
qui **marche hors ligne** pour réviser. Tu importes un cours (photos ou PDF), et une
équipe de personnages style anime t'aide à le réviser :

| Perso | Rôle | S'occupe de… |
|---|---|---|
| **Kaï** 💜 | le guide | accueil, objectifs du jour, présentation |
| **Mory** 🩵 | le scanner | ajouter un cours (photo / PDF), analyse par l'IA |
| **Nia** 🩷 | la conteuse | résumé en stories, explications ajoutées 💡 |
| **Sora** 💚 | la mémoire | fiches à swiper, répétition espacée |
| **Ren** 🧡 | le rival | quiz et examen blanc chronométré |
| **Awa** 💛 | la coach | exercices corrigés étape par étape |
| **Tidiane** 💙 | le calme | erreurs, coupures réseau, quota, chargements |
| **Binta** 💗 | la hype | badges, niveaux gagnés, statistiques, récap de la semaine |

> **Technique en une phrase :** HTML/CSS/JavaScript simple (sans framework) construit avec
> **Vite**, IA **Google Gemini** appelée directement depuis le navigateur, données dans
> **IndexedDB** (sur ton téléphone), hébergement **GitHub Pages**, publication automatique
> par **GitHub Actions**.

---

## Sommaire

1. [Obtenir ta clé Gemini (gratuite)](#1-obtenir-ta-clé-gemini-gratuite)
2. [Publier le site sur GitHub Pages (première fois)](#2-publier-le-site-sur-github-pages-première-fois)
3. [Installer l'appli sur ton téléphone](#3-installer-lappli-sur-ton-téléphone)
4. [Mettre à jour le site après une modification](#4-mettre-à-jour-le-site-après-une-modification)
5. [Travailler sur ton ordinateur (installation)](#5-travailler-sur-ton-ordinateur-installation)
6. [Structure des fichiers](#6-structure-des-fichiers)
7. [Modifier les couleurs](#7-modifier-les-couleurs)
8. [Modifier les personnages, leurs répliques, les remplacer par des images](#8-modifier-les-personnages)
9. [Modifier les consignes (prompts) de l'IA](#9-modifier-les-consignes-prompts-de-lia)
10. [Ajouter une fonctionnalité](#10-ajouter-une-fonctionnalité) ·
    [🖼️ Remplacer les cases de la BD par des illustrations](#10-septies-remplacer-les-cases-de-la-bd-par-des-illustrations)
11. [Changer de modèle Gemini](#11-changer-de-modèle-gemini)
12. [Sauvegarde de tes données](#12-sauvegarde-de-tes-données)
13. [Dépannage](#13-dépannage)
14. [Sécurité](#14-sécurité)
15. [Feuille de route](#15-feuille-de-route)

---

## 1. Obtenir ta clé Gemini (gratuite)

1. Va sur **https://aistudio.google.com/apikey** et connecte-toi avec ton compte Google.
2. Clique sur **« Create API key »** (Créer une clé API).
3. Copie la clé (elle ressemble à `AIza…`).
4. Dans l'appli : **Profil → ⚙️ Réglages → Clé API Gemini**, colle la clé, puis **Tester**.

✅ La clé est enregistrée **uniquement sur ton appareil** (dans IndexedDB). Elle n'est
jamais dans le code ni sur GitHub, et elle n'est pas incluse dans les sauvegardes.

⚠️ Ne partage jamais ta clé (capture d'écran, message…). Si elle fuite, supprime-la sur
AI Studio et crée-en une nouvelle.

L'offre gratuite a des **quotas** (nombre de requêtes par minute et par jour, **pour chaque
modèle**). L'appli passe toute seule au modèle gratuit suivant quand l'un est épuisé, et
Réglages → **📊 Quota Gemini aujourd'hui** montre les demandes du jour par modèle et l'heure
de la prochaine recharge (minuit heure du Pacifique, affichée à l'heure de ton téléphone).
Quand tout est épuisé, Tidiane te donne l'heure de recharge (section 11).

---

## 2. Publier le site sur GitHub Pages (première fois)

Tu as besoin d'un compte GitHub (gratuit) : https://github.com/signup

### a) Créer le dépôt
1. Sur GitHub, clique sur **« + » → « New repository »**.
2. Nom : `revision-ia` (tu peux en choisir un autre, tout s'adapte automatiquement).
3. Coche **Public** (obligatoire pour GitHub Pages gratuit).
4. Ne coche **rien** d'autre (pas de README, pas de .gitignore) → **Create repository**.

### b) Envoyer le code
Dans un terminal ouvert dans le dossier du projet :

```bash
git remote add origin https://github.com/TON-PSEUDO/revision-ia.git
git push -u origin main
```

La première fois, une fenêtre de connexion GitHub s'ouvre dans ton navigateur : accepte.

### c) Activer GitHub Pages
1. Sur la page du dépôt : **Settings → Pages**.
2. Dans **Source**, choisis **« GitHub Actions »**.
3. Va dans l'onglet **Actions** : la publication « Publier sur GitHub Pages » tourne
   (2 à 3 minutes). Si elle n'a pas démarré, clique dessus puis **Run workflow**.
4. Quand c'est vert ✅, ton site est en ligne à :
   **`https://TON-PSEUDO.github.io/revision-ia/`**

### Le « chemin de base », c'est quoi ?
Sur GitHub Pages, ton site n'est pas à la racine (`/`) mais dans `/revision-ia/`. Vite doit
le savoir pour que les liens vers les fichiers soient justes. C'est **automatique** :
le fichier `.github/workflows/deploy.yml` donne à Vite `BASE_PATH=/NOM-DU-DEPOT/`, lu par
`vite.config.js`. Si tu renommes le dépôt, rien à changer.

---

## 3. Installer l'appli sur ton téléphone

1. Ouvre le lien du site dans **Chrome** (Android) ou **Safari** (iPhone).
2. Un **bandeau de Kaï** apparaît en bas : « Installe l'appli pour réviser même sans
   connexion 📲 ».
   - Android / Chrome / Edge : touche **Installer** (vraie installation).
   - iPhone : suis le petit guide : **Partager ⬆️** puis **Sur l'écran d'accueil ➕**.
   - « Plus tard » : le bandeau ne revient pas pendant 3 jours.
   - Tu peux aussi passer par **Profil → Réglages → 📲 Installer l'appli**, ou par le menu
     du navigateur (**⋮ → « Installer l'application »**).
3. L'icône apparaît comme une vraie appli. Après la première ouverture avec internet,
   tout est gardé en cache : **tu peux réviser sans connexion**.

Quand une nouvelle version est publiée, un bandeau **« ✨ Nouvelle version dispo ! →
Mettre à jour »** apparaît dans l'appli. **La page n'est jamais rechargée toute seule** (ni à
la première visite, ni pendant une mise à jour) : elle ne se recharge que si tu appuies sur
le bouton, et le bandeau attend la fin de l'écran de bienvenue. Ce que tu tapes n'est donc
jamais effacé par surprise (code : `registerSW` dans `src/main.js`).
Filets de sécurité si une page se recharge quand même : le **prénom et le compagnon** de
l'écran de bienvenue sont gardés à chaque frappe ; les champs marqués `data-draft`
(`src/ui/drafts.js`, ex. titre et matière d'un nouveau cours) retrouvent leur texte ; les
exercices, l'examen blanc et « Explique-moi » gardaient déjà leur brouillon.

---

## 4. Mettre à jour le site après une modification

Chaque fois que tu envoies (« push ») une modification sur la branche `main`, GitHub
reconstruit et republie le site tout seul (onglet **Actions** pour suivre).

**Depuis ton ordinateur :**
```bash
git add .
git commit -m "Ce que j'ai changé"
git push
```

**Sans ordinateur (depuis le navigateur, même sur téléphone) :** sur github.com, ouvre
le fichier → icône ✏️ → modifie → **Commit changes**. La publication démarre toute seule.

💡 Astuce connexion lente : regroupe plusieurs modifications dans un seul push.

---

## 5. Travailler sur ton ordinateur (installation)

À installer une seule fois :
- **Node.js** (version 20 ou plus) : https://nodejs.org (bouton « LTS »)
- **Git** : https://git-scm.com

Puis, dans le dossier du projet :

```bash
npm install        # télécharge les dépendances (une seule fois, ~40 Mo)
npm run dev        # lance l'appli en local → http://localhost:5173
```

- Les modifications s'affichent **instantanément** dans le navigateur.
- **Galerie des personnages** : http://localhost:5173/galerie.html montre les 7 persos avec
  toutes leurs expressions (bouton « ▶ animation signature »). Options :
  `galerie.html?only=kai,ren&size=250&aura=3`.
- `npm run build` : construit la version finale dans `dist/` (c'est ce que fait GitHub).
- `npm run preview` : teste cette version finale (avec le mode hors ligne).

Le service worker (hors ligne) n'est actif que dans la version construite, pas avec `npm run dev`.

---

## 6. Structure des fichiers

```
revision-ia/
├── index.html                 Page unique de l'appli (barre de navigation du bas)
├── galerie.html               OUTIL : voir tous les persos et expressions (non publié)
├── vite.config.js             Config Vite : chemin de base + génération du service worker
├── package.json               Liste des dépendances et commandes (npm run …)
├── public/                    Fichiers copiés tels quels
│   ├── manifest.webmanifest   Nom, couleurs et icônes de l'appli installée
│   ├── icons/                 Icônes (icon.svg + PNG)
│   └── characters/            ← dépose ici les images de persos (voir section 8)
├── .github/workflows/deploy.yml   Publication automatique sur GitHub Pages
└── src/
    ├── main.js                Démarrage, liste des écrans (ROUTES), thème, mises à jour
    ├── sw.js                  Service worker (modèle) : fonctionnement hors ligne
    ├── data/
    │   ├── characters.js      ⭐ LE FICHIER DES PERSONNAGES (noms, couleurs, répliques…)
    │   └── prompts.js         ⭐ TOUTES LES CONSIGNES envoyées à Gemini
    ├── styles/
    │   ├── theme.css          ⭐ TOUTES LES COULEURS (mode sombre + mode clair)
    │   ├── main.css           Styles généraux (blocs bento, boutons, navigation…)
    │   ├── views.css          Stories, swipe, quiz, récap « Wrapped », stats
    │   ├── anime.css          Phase 3 : conseil de correction, téléportation, pouvoirs
    │   └── characters.css     Animations des personnages
    ├── core/                  « Moteur » (pas d'affichage)
    │   ├── db.js              Base de données locale (IndexedDB), réglages, sauvegarde
    │   ├── gemini.js          Appels à Gemini : erreurs, réessais, vérification du JSON
    │   ├── mathfix.js         Notation maths correcte : LaTeX réparé, u(n) → uₙ, texte Unicode
    │   ├── importer.js        Photos (compression), PDF (lecture), transcription
    │   ├── generate.js        Création du résumé, des fiches, des quiz
    │   ├── srs.js             Répétition espacée (algorithme SM-2)
    │   ├── creator.js         Mode Créateur (empreinte du code secret, nom affiché)
    │   ├── game.js            XP, niveaux, série de jours, objectifs, aura
    │   └── badges.js          Liste des badges et leurs conditions
    ├── ui/                    Outils d'affichage
    │   ├── character.js       Dessin SVG des persos en calques + animations
    │   ├── ui.js              Markdown + formules (KaTeX), bulles, fenêtres, erreurs
    │   ├── fx.js              Célébrations lumineuses, textes d'effet néon, vibrations, fête de Binta
    │   ├── particles.js       Moteur de particules (canvas) : étincelles, étoiles, ondes de choc
    │   ├── sfx.js             Effets sonores style anime générés par le code + voix des persos
    │   ├── bubble.js          Bulle unique des scènes de groupe (toujours dans l'écran)
    │   ├── install.js         Bandeau « Installe l'appli » (Android + guide iPhone)
    │   ├── creator-scene.js   Scène d'accueil du créateur (1re activation)
    │   ├── council.js         Phase 3 : scène du conseil de correction
    │   └── powers.js          Phase 3 : auras et pouvoirs spéciaux (+ règles de rareté)
    └── views/                 Un fichier par écran
        ├── welcome.js         Première ouverture (Kaï, équipe, choix du compagnon)
        ├── home.js            Accueil
        ├── courses.js         Mes cours (par matière)
        ├── course.js          Un cours (onglets Résumé / Fiches / Quiz / Exercices / Source)
        ├── add.js             Ajouter un cours (Mory)
        ├── stories.js         Résumé en stories (Nia)
        ├── review.js          Fiches à swiper (Sora)
        ├── quiz-hub.js        Onglet Quiz (Ren)
        ├── quiz-play.js       Duel de quiz + récap Wrapped (Ren)
        ├── exercise.js        Un exercice : réponse (texte/photo) + correction (Awa)
        ├── exam.js            Examen blanc : choix, chrono, correction avec barème (Ren)
        ├── stats.js           Statistiques, badges, récap de la semaine (Binta)
        ├── creator-panel.js   Panneau créateur (galerie, tests, réinitialisation)
        ├── profile.js         Profil
        ├── settings.js        Réglages
        └── report.js          Fenêtre « Signaler une erreur »
```

### Comment ça marche (en bref)
1. **Ajouter** : les photos sont réduites et compressées (≈ 150-300 Ko chacune). Un PDF
   qui contient du texte est lu **directement sur l'appareil** (rien n'est envoyé). Un PDF
   scanné est transformé en images.
2. **Transcription** : les images sont envoyées à Gemini **par lots de 8** (lot réduit de
   moitié tout seul s'il est trop lourd ou si la connexion est trop lente). Chaque page
   reçue est enregistrée aussitôt : si la connexion coupe, on **reprend** là où on s'était arrêté.
3. Ensuite, **résumé + fiches + quiz arrivent dans UNE SEULE demande** par morceau du cours
   (morceaux de 20 000 caractères), **à partir du texte** (léger), jamais en renvoyant les
   photos. Le résumé s'affiche en streaming, les fiches et le quiz arrivent juste après.
4. Chaque fiche / question cite **le passage source** (page ou photo + citation). L'appli
   vérifie que la citation existe vraiment dans le cours : ✓ vérifiée, ≈ proche,
   ⚠ non retrouvée.

---

## 7. Modifier les couleurs

**Toutes** les couleurs sont dans **`src/styles/theme.css`** :

```css
:root {
  --neon-violet: #8B5CF6;   /* violet électrique */
  --neon-green:  #C6FF3D;   /* vert acide */
  --neon-pink:   #FF3D9A;   /* rose vif */
  --neon-cyan:   #22D3EE;
  --bg:          #0B0A14;   /* fond (mode sombre) */
  …
}
:root[data-theme="light"] { … }  /* mode clair */
```

Change une valeur, enregistre : toute l'appli suit. Les dégradés (`--grad-main`…), les
lueurs (`--glow-…`) et les couleurs des matières (`--subject-1` à `7`) sont au même endroit.
La couleur signature de chaque **personnage** est dans `src/data/characters.js` (`color`).

Couleur de la barre du navigateur / de l'appli installée : `theme_color` dans
`public/manifest.webmanifest` et `<meta name="theme-color">` dans `index.html`.

---

## 8. Modifier les personnages

Tout est dans **`src/data/characters.js`**. Chaque perso ressemble à ça :

```js
kai: {
  name: 'Kaï',                 // ← nom affiché
  role: 'Le guide',
  personality: '…',
  color: '#8B5CF6',            // ← couleur signature
  screens: ['accueil', …],     // écrans dont il s'occupe (documentation)
  signature: 'salut',          // animation propre (voir characters.css)
  look: {                      // ← apparence du dessin SVG
    skin: '#6B4226',           // couleur de peau
    hair: 'hightop',           // coiffure : hightop, afro, braids, puffs, locks, bun, waves, ponytail
    hairColor: '#17100D',
    outfit: 'hoodie',          // tenue : hoodie, jacket, cardigan, bomber, track
    outfitColor: '#8B5CF6', outfitColor2: '#2A1F55',
    eyeColor: '#6A3F1F',
    accessories: ['headphones'],  // headphones, visor, earrings, hoops, whistle, earbuds, chain, clips, beard
  },
  images: {},                  // ← images qui remplacent le dessin (voir plus bas)
  voice: {},                   // ← voix audio (plus tard)
  lines: {                     // ← répliques, choisies au hasard sans répétition
    arrivee: ['Yo {prenom} !', …],
    reussite: […], echec: […], attente: […], encouragement: […], fin: […],
  },
},
```

### Changer un nom ou une réplique
Modifie simplement le texte. `{prenom}` est remplacé par le prénom de l'utilisateur.
Tu peux ajouter autant de répliques que tu veux dans chaque liste.

### Changer l'apparence
Les persos sont dessinés en **style manga shōnen** (portraits en buste, encrage épais,
ombres franches). Modifie `look` (peau, coiffure, tenue, `face: 'soft'` pour des traits
plus doux) puis regarde le résultat dans `galerie.html` (section 5) ou dans le
Panneau créateur.
Pour dessiner une nouvelle coiffure ou tenue : `src/ui/character.js`, fonctions `hair()`
et `outfit()` (chaque style est un `case` avec des formes SVG).

### 🧑 Remplacer un perso par des illustrations (planches d'expressions)
**Aucun code à toucher.** Pour chaque personnage, 2 images (« planches »), chacune
une grille **2 × 2** de portraits en buste sur **fond vert uni `#00FF00`** :

| Planche | en haut à gauche | en haut à droite | en bas à gauche | en bas à droite |
|---|---|---|---|---|
| **A** `planche-a.jpg` | neutre | joie | réflexion | célébration |
| **B** `planche-b.jpg` | encouragement | surprise | concentration | clin |

**Déposer les planches depuis github.com :**
1. Ouvre le dépôt, puis les dossiers `public` → `characters` → `kai` (le perso voulu :
   `kai`, `mory`, `nia`, `sora`, `ren`, `awa`, `tidiane`, `binta`). S'il n'existe pas
   encore : **Add file** → **Create new file**, tape `public/characters/nia/.gitkeep`,
   puis **Commit changes**.
2. Renomme tes images **`planche-a.jpg`** et **`planche-b.jpg`** (.png ou .webp acceptés).
3. **Add file** → **Upload files** → choisis les 2 planches → **Commit changes**.
4. Attends 2 à 3 minutes (onglet **Actions** ✅) : le perso apparaît en illustration
   **partout** (accueil, quiz, conseil de correction, pouvoirs, cartes, statut…).
5. Vérifie le résultat : appli → **Panneau créateur** → **🧑 Personnages en images**
   (les 8 expressions découpées, sur un damier qui montre la transparence).

**Grille d'une autre taille, ou plus de portraits que nécessaire ?** Ajoute dans le
dossier du perso un petit fichier **`planches.json`** (sur github.com : **Add file** →
**Create new file**, nom `public/characters/kai/planches.json`). Exemple (Kaï) :
```json
{
  "planche-a": { "grille": [2, 4], "cases": { "neutre": 1, "joie": 3, "reflexion": 5, "celebration": 8 } },
  "planche-b": { "grille": [2, 4], "cases": { "encouragement": 1, "surprise": 2, "clin": 4, "concentration": 5 } }
}
```
- `"grille": [rangées, colonnes]` ;
- `"cases"` : numéro de la case pour chaque expression, en comptant **de gauche à droite,
  rangée du haut puis rangée suivante** (1 = en haut à gauche). Les autres cases sont ignorées ;
- tu peux répartir les 8 expressions comme tu veux entre les planches (et en ajouter :
  `"planche-c": { … }` pour un fichier `planche-c.jpg`) ;
- facultatif : `"fond": "#2fd52a"` pour imposer la couleur du fond (sinon détectée).

**Disposition irrégulière ?** Au lieu des cases, donne une **zone** par expression, en
**pourcentages de l'image** : `[x, y, largeur, hauteur]` (0 0 = coin en haut à gauche).
Exemple (Mory : en haut 4 petits portraits, en bas 2 grands) :
```json
{
  "planche-a": { "zones": { "neutre": [0, 0, 25, 50], "joie": [75, 0, 25, 50],
                            "reflexion": [0, 50, 50, 50], "celebration": [50, 50, 50, 50] } },
  "planche-b": { "zones": { "encouragement": [0, 0, 25, 50], "surprise": [50, 0, 25, 50],
                            "clin": [75, 0, 25, 50], "concentration": [0, 50, 50, 50] } }
}
```
Une zone n'a pas besoin d'être précise : le script se recentre tout seul sur le portrait,
efface les morceaux d'un portrait voisin qui dépassent dans la zone (une main, une
mèche…) et ignore les traits de séparation blancs qui y entrent (même un trait qui ne
traverse qu'une rangée). Conseil : arrête quand même la zone juste avant un trait plutôt
que dessus (ex. `24.5` plutôt que `25` si le trait est à 25 %). On peut mélanger
`"cases"` et `"zones"` dans une même planche.

**Autant de planches que tu veux, même à un seul portrait.** Une image qui ne contient
qu'UN portrait (centré, avec des marges) se déclare en une ligne. Exemple (Mory : 3
expressions refaites, chacune dans son fichier) :
```json
{
  "planche-a": { "zones": { "neutre": [0, 0, 25, 50], "joie": [75, 0, 25, 50] } },
  "planche-b": { "zones": { "encouragement": [0, 0, 25, 50], "surprise": [50, 0, 25, 50], "clin": [75, 0, 25, 50] } },
  "planche-c": "reflexion",
  "planche-d": "celebration",
  "planche-e": "concentration"
}
```
Le portrait est recadré tout seul à la même taille de visage et à la même hauteur
d'yeux que les autres. Si une expression figure dans deux planches, c'est la dernière
de la liste qui compte.

Pour changer une expression, il suffit de modifier un numéro de case dans ce fichier.

**Cadrage d'une expression avec un geste (optionnel).** Quand une main ou un bras dépasse
du cadre (ex. main levée à droite), on peut régler le cadrage de CETTE expression
seulement, avec `"cadrage"` dans la planche concernée. Sans `"cadrage"`, rien ne change
(les autres portraits sortent identiques à l'octet près). Exemple (Tidiane, encouragement) :
```json
"planche-c": { "expression": "encouragement",
  "cadrage": { "encouragement": { "zoom": 0.76, "dx": -9, "fondu": false } } }
```
- `zoom` : dézoom autour des **yeux** (1 = normal, 0.76 = visage à 76 %). Les yeux restent
  à la même hauteur que les autres expressions. Prends le plus grand zoom qui laisse
  la main entière avec une petite marge (≈ 15 px sur 720).
- `dx` / `dy` : décalage en % de l'image (`dx` négatif = vers la gauche, `dy` négatif = vers
  le haut). Décaler vers le côté opposé au geste permet de moins dézoomer.
- `fondu` : `false` pour ne pas estomper le bord de l'image (par défaut, le bord est estompé
  quand le buste touche le bord de la planche, ce qui effacerait le bout des doigts).
- Les trois réglages sont facultatifs. Pour vérifier : lancer le build et regarder le
  portrait (doigts entiers, yeux alignés avec les autres expressions).

**Ce que le build fait tout seul** (`scripts/planches.mjs`) :
- il **détecte la couleur du fond** (pas besoin d'un vert exactement `#00FF00`) : vert,
  ou **magenta** (`#FF00FF`) pour un perso habillé en vert, comme Sora ;
- il trouve la grille même s'il y a des **marges** ou des **traits de séparation** ;
- il retire le fond avec des bords adoucis, **sans liseré vert** ;
- il **cadre les portraits à l'identique** (même taille de visage, yeux à la même place),
  même si les portraits d'une planche ont des tailles différentes : l'expression
  « neutre » sert de référence ; une tête entière est alignée par le haut des cheveux et
  sa largeur, une tête coupée par le bord de sa case est recalée sur le visage de la
  référence. Les bords coupés (côtés, haut des cheveux) sont fondus en douceur ;
- il exporte des **WebP transparents** : 300 px pour l'appli (pré-téléchargés, donc
  instantanés hors ligne) et 720 px pour les images partagées. Les planches d'origine
  ne sont pas publiées.

Les animations du personnage entier (apparition, respiration, sauts, secousses,
téléportation), l'**aura** et les **pouvoirs** restent autour de l'illustration.
Sans planche, le dessin SVG reste affiché. Une planche seule (A ou B) suffit : les
expressions manquantes prennent l'image « neutre » (ou le dessin s'il n'y a pas de A).

**Conseils pour la génération :** fond vert vraiment uni, personnage bien détaché du
fond, **pas de vert dans les vêtements ni les effets** (il deviendrait transparent),
même cadrage en buste sur les 8 cases (épaules coupées en bas de chaque case).
Perso qui porte du **vert** (Sora) : fond **magenta** uni à la place ; ses roses et
violets restent intacts, mais évite un magenta pur dans les vêtements.

(Avancé : le champ `images` d'un perso dans `characters.js` permet encore d'indiquer
des fichiers à la main ; il a la priorité sur les planches.)

### Ajouter les voix (plus tard)
Dépose des fichiers audio courts dans `public/voices/`, puis :
```js
voice: { arrivee: ['voices/kai-arrivee-1.mp3', 'voices/kai-arrivee-2.mp3'] },
```
La fonction `playVoice()` de `src/ui/fx.js` les joue (si les sons sont activés).

### Persos vivants (portraits en images)
Sans nouvelle image, les portraits paraissent vivants (`src/ui/character.js` + bloc
« PERSOS VIVANTS » de `src/styles/characters.css`) :
- **fondu enchaîné** (~260 ms) avec un petit rebond quand l'expression change
  (`setExpression`), la nouvelle image n'apparaît qu'une fois prête ;
- **respiration** quasi invisible (cycle de 3 à 4 s) et **balancement** lent, avec une
  phase au hasard pour chaque perso ;
- **coups de tête** de temps en temps (une seule petite boucle pour toute l'appli) ;
- **parole** : `speak(perso, bulle, texte)` écrit la bulle mot par mot (sa taille est
  réservée d'avance : rien ne saute) et le perso bouge légèrement à chaque mot.
Uniquement `transform` et `opacity`, dans des calques imbriqués à l'intérieur du perso :
les apparitions, signatures, auras, pouvoirs et téléportations ne sont pas touchés.
Tout s'arrête si le téléphone demande de réduire les animations.

### 😉 Clignement des yeux et 👄 bouche qui parle (facultatif)
Pour chaque perso, deux petites retouches de son portrait **neutre** suffisent :
1. **Panneau créateur → 🧑 Personnages en images → ⬇️ Télécharger** sous le portrait
   *neutre* : tu obtiens `kai-neutre.png` (portrait découpé sur fond vert uni).
2. Donne cette image à Gemini et demande, en deux fois :
   - « Garde exactement la même image (cadrage, couleurs, fond vert), ferme seulement les yeux » ;
   - « Garde exactement la même image, ouvre seulement un peu la bouche, comme s'il parlait ».
3. Dépose les deux résultats (sur github.com : **Add file → Upload files**) dans
   `public/characters/<perso>/` avec ces noms exacts : **`yeux-fermes.png`** et
   **`bouche-ouverte.png`** (`.jpg` ou `.webp` acceptés aussi).

Au build (`scripts/calques.mjs`), chaque retouche est **recalée** sur le portrait
(taille et position retrouvées automatiquement, même si l'IA a changé la taille de
l'image), comparée pixel par pixel, et **seule la zone qui change** (les yeux, ou la
bouche) devient un petit calque transparent collé au pixel près. Les petites
différences de couleur de l'IA sont corrigées. L'appli fait alors **cligner** le perso
(toutes les 2 à 6 s, parfois deux fois) et **bouger sa bouche** à chaque syllabe quand
sa bulle s'écrit (sur l'expression neutre). Le Panneau créateur indique ✅ quand c'est actif.
Sans ces fichiers, rien ne change. Les retouches elles-mêmes ne sont pas publiées.

### Animations
Dans `src/styles/characters.css` : animations de base (respiration, clignement, cheveux),
réactions (`anim-bounce`, `anim-jump`, `anim-shake`) et animations **signature**
(`.sig-salut`, `.sig-lunettes`, …). Pour en créer une : ajoute une classe `.sig-monnom`
et mets `signature: 'monnom'` dans le perso.

### Célébrations et textes d'effet
- `confetti(intensité, { color })` (`src/ui/fx.js`) : explosion de **lumière** dessinée en
  canvas par `src/ui/particles.js` (étincelles en traînées néon, petites étoiles, onde de
  choc ; pluie d'éclats en plus à partir de 140). `color` = couleur du perso concerné
  (sinon celle du compagnon choisi).
- `onomatopoeia("LET'S GO!", { color, big })` : grand texte néon (dégradé, lueur, zoom
  avec rebond, flash, aberration chromatique), sortie en éclat de particules. `big` ajoute
  une secousse discrète de l'écran (automatique pour NIVEAU, LÉGENDAIRE, K.O.…).
- Styles : bloc « Célébrations » de `src/styles/main.css`. Onomatopées de la BD (BAM,
  TUUUT…) : fonction `sfx()` de `src/comic/comic.js` + `.bd-sfx` dans `views.css`.
- Léger sur petit Android : pas de `shadowBlur`, lueurs pré-calculées, 320 particules
  au plus, salves allégées si le téléphone ralentit ; rien ne bouge si « réduire les
  animations » est activé sur le téléphone.

---

## 8 bis. Formules mathématiques (KaTeX)

Tout passe par **`src/core/mathfix.js`** :
- **À la réception** (`core/gemini.js`) : `parseJsonLatex` répare le LaTeX mal échappé
  par l'IA. En JSON, `\f`, `\t`, `\n`, `\b`, `\r` sont des caractères spéciaux : un
  `\frac` écrit avec une seule barre devenait « saut de page + rac », `\times`
  « tabulation + imes », `\neq` « retour à la ligne + eq »…
- **À l'affichage** (`rich()` et `mathText()` dans `ui/ui.js`) : `normalizeMath` répare
  aussi les fiches et résumés **déjà enregistrés** (sans rien regénérer), corrige les
  écritures mal formées (`u(n)` → $u_n$, `un+1` → $u_{n+1}$, `x^10` → $x^{10}$) et met
  entre `$…$` les maths écrites hors formule.
- **Dans les images** (cartes, planches manga, statuts) : `latexToText` écrit les maths
  en symboles Unicode (uₙ₊₁, x², ½, √2, ≤, →), car KaTeX ne peut pas y aller.
- Pour un texte court écrit par l'IA (titre, choix, conseil), utilise `mathText(texte)`
  au lieu de `esc(texte)`.
- Les consignes à Gemini (`SYSTEM` dans `prompts.js`) exigent le LaTeX entre `$…$` avec
  les bons indices et exposants.

---

## 9. Modifier les consignes (prompts) de l'IA

**Toutes** les consignes envoyées à Gemini sont dans **`src/data/prompts.js`** :

| Élément | Rôle |
|---|---|
| `SYSTEM` | rôle général de l'IA (ton, règles, LaTeX, citations) |
| `transcribePrompt` + `TRANSCRIBE_SCHEMA` | photos → texte |
| `packPrompt` + `packSchema` | **résumé + fiches + quiz en une seule demande** (préparation d'un cours) |
| `summaryPrompt` + `SUMMARY_SCHEMA` | résumé partie par partie + blocs « explication » |
| `cardsPrompt` + `CARDS_SCHEMA` | fiches question/réponse + source |
| `quizPrompt` + `QUIZ_SCHEMA` | QCM + explications + source |
| `exercisesPrompt` + `EXERCISES_SCHEMA` | exercices d'application (Awa) |
| `correctionPrompt` + `CORRECTION_SCHEMA` | correction étape par étape, note /20, conseils |
| `verify…Prompt` + `VERIFY_SCHEMA` | mode vérification : 2e relecture des fiches, QCM et corrections |
| `examPrompt` + `EXAM_SCHEMA` | sujet d'examen blanc (barème sur 20) |
| `examCorrectionPrompt` + `EXAM_CORRECTION_SCHEMA` | correction de la copie avec barème |

- **Changer le texte d'une consigne** : sans risque, modifie librement.
- **Changer un schéma** (la forme du JSON demandé) : l'IA répond **exactement** dans cette
  forme (`responseSchema`). Si tu ajoutes/supprimes un champ, adapte le code qui l'utilise
  (cherche le nom du champ dans `src/`). L'appli vérifie chaque réponse avec ce schéma et
  **redemande automatiquement** si le JSON est invalide (`src/core/gemini.js`).

---

## 10. Ajouter une fonctionnalité

### Un nouvel écran
1. Crée `src/views/mon-ecran.js` :
   ```js
   import { mascot } from '../ui/ui.js';
   export async function render(el, args) {
     el.innerHTML = `<h1>Mon écran</h1>${mascot('kai', { situation: 'arrivee' })}`;
   }
   ```
2. Dans `src/main.js` : `import * as monEcran from './views/mon-ecran.js';` puis ajoute
   dans `ROUTES` : `monecran: { view: monEcran },`
3. Il est accessible à l'adresse `#/monecran` (lien : `<a href="#/monecran">`).

### Un nouvel onglet dans un cours
Dans `src/views/course.js` : ajoute une ligne dans `TABS` et une fonction dans `TAB_RENDERERS`.

### Une nouvelle génération par l'IA
1. Ajoute la consigne + le schéma dans `src/data/prompts.js`.
2. Appelle `generateJSON({ parts: [{ text: maConsigne }], schema: MON_SCHEMA, system: SYSTEM })`
   (voir `src/core/generate.js` pour des exemples). Pour afficher un chargement animé
   par un perso : `runAI('Titre', 'awa', async (set) => { … })` (dans `course.js`).

### Données enregistrées
`src/core/db.js` : `db.put('store', objet)`, `db.get`, `db.getAll`, `db.getByIndex`…
Pour ajouter un « store », ajoute-le dans `STORES` **et augmente `DB_VERSION`**.

### Gains d'XP, objectifs du jour, badges
`src/core/game.js` : `XP_RULES` (XP par action), `DAILY_GOALS`, `AURA_STEPS` (paliers de série).
`src/core/badges.js` : liste `BADGES`. Pour en ajouter un, copie une ligne et change
`id`, `icon`, `name`, `desc` et la condition `test` (ex. `(c) => c.reviews.length >= 1000`).
Binta fête automatiquement chaque nouveau badge et chaque niveau gagné.

---

## 10 bis. Fonctions de la phase 2

- **Exercices (Awa)** : onglet ✍️ Exercices d'un cours, ou Quiz → Exercices. Réponds en
  texte **ou prends ton brouillon en photo** (compressée avant envoi). Awa corrige étape
  par étape (juste / partiel / faux / manquant), met une note sur 20 et donne des conseils.
  Ton brouillon de réponse est gardé automatiquement.
- **Mode vérification** (Réglages → 🔍) : après chaque génération, un 2e appel à l'IA relit
  les fiches, les QCM et les corrections en les comparant au cours. Il corrige les erreurs
  (badge « 🔍 corrigée par la vérif ») ou signale les fiches fausses (mises dans « À corriger »)
  et retire les questions ambiguës. ⚠️ **Double la consommation de quota** : désactivé par défaut.
- **Examen blanc (Ren)** : Quiz → Examen blanc. Choisis un ou plusieurs cours et une durée.
  Le chrono continue même si tu quittes l'écran, et tes réponses sont enregistrées au fur
  et à mesure (rien n'est perdu si la connexion coupe : bouton « Réessayer » la correction).
  Les QCM sont notés par l'appli, le reste par l'IA avec le barème.
- **Statistiques (Binta)** : Profil → Stats. Activité des 14 derniers jours, progression
  par matière, notions les plus ratées, badges, et **récap de la semaine** façon Wrapped.

---

## 10 ter. Phase 3 : le conseil de correction, les auras et les pouvoirs

### Le conseil de correction (`src/ui/council.js`)
Quand tu finis un quiz, un exercice ou un examen blanc, **avant la note** :
1. 3 à 5 persos arrivent un par un en **se téléportant** (traînée de lignes de vitesse,
   image rémanente, flash et particules) autour d'une **table ronde lumineuse**
   (trame de points, lignes de concentration) ;
2. **2 à 4 persos parlent** (tirés au hasard, jamais toute l'équipe, jamais la même
   combinaison deux fois de suite), les autres réagissent en silence (hochements de tête,
   bras croisés, yeux étoilés, goutte de sueur) ;
3. un perso **révèle la note** : explosion d'énergie si excellent, encouragement
   chaleureux si c'est à retravailler (jamais moqueur).

Durée : environ **4 s** (1,5 à 2,5 s en version courte). La correction par l'IA se fait
**pendant** la scène : si elle est plus longue, les persos continuent de délibérer.
Bouton **« Passer »** toujours visible.

**Réglage** : Profil → Réglages → **Scène de correction et pouvoirs** :
*Complète* / *Courte* (par défaut : la note arrive en 1 à 2 s, pouvoirs plus brefs) /
*Désactivée* (simple chargement, aucun pouvoir).

**Répliques** : dans `src/data/characters.js`, objet `COUNCIL_LINES` : pour chaque perso,
`deliberation` (pendant que l'IA corrige) puis `excellent`, `bon`, `moyen`,
`a_retravailler` (8 répliques minimum chacune). Niveaux : ≥ 16/20 excellent, ≥ 12 bon,
≥ 8 moyen, sinon à retravailler (fonction `verdictOf` de `src/core/generate.js`).

### Auras et pouvoirs (`src/ui/powers.js`)
Chaque perso a un pouvoir signature dans sa couleur (objet `POWERS` de `characters.js`) :

| Perso | Pouvoir |
|---|---|
| Kaï | Flamme du guide (flamme montante autour de l'écran) |
| Mory | Scan laser (laser + grille holographique) |
| Nia | Tourbillon de pages lumineuses |
| Sora | Tempête de cartes en vortex |
| Ren | Éclairs du rival (aura électrique) |
| Awa | Stylo d'énergie qui trace un ✓ géant |
| Tidiane | Bouclier zen (onde calme) |
| Binta | Explosion de hype (étoiles, confettis) |

Trois niveaux, **volontairement rares** :
- **Aura légère** (petite lueur) : bonne série de fiches (≥ 80 %), quiz ≥ 70 %, exercice ≥ 10/20.
- **Aura forte** (flammes, particules, cheveux qui s'agitent) : 100 % à un quiz, examen
  blanc réussi (≥ 10/20), exercice à 20/20, nouveau niveau.
- **Pouvoir ultime** (plein écran, flash, vibration, onomatopée géante) : série de
  **7 / 30 / 100 jours** (pouvoir de ton compagnon), **premier examen blanc à 20/20**,
  niveaux **10 / 25 / 50**. **Un seul par session** (sinon il devient une aura forte).

Jamais de pouvoir pendant la lecture d'un résumé ni pendant une question (les écrans
appellent `suspendPowers()` / `resumePowers()` ; un pouvoir demandé est joué à la fin).
Tout respecte « réduire les animations » du téléphone et le réglage ci-dessus.

Pour changer une règle : cherche `power(` dans `src/` (ex. `src/views/quiz-play.js`).
Pour changer un effet : `ULTIMATE_FX` dans `powers.js` + styles dans `anime.css`.
Pour tester tous les pouvoirs : lance `npm run dev`, ouvre l'appli, puis dans la console
du navigateur (F12) :
```js
const m = await import('/src/ui/powers.js'); sessionStorage.clear(); m.power('ren', 'ultimate');
```

### Bandeau d'installation (`src/ui/install.js`)
- Android / Chrome / Edge : le navigateur envoie l'événement `beforeinstallprompt` ;
  l'appli le garde et affiche son propre bandeau. « Installer » lance la vraie installation.
- iPhone / iPad : Safari ne permet pas d'installer automatiquement → guide illustré.
- Jamais affiché si l'appli est déjà installée (mode « standalone »), ni sur les écrans
  listés dans `BLOCKED_ROUTES` (bienvenue, quiz, examen, révision, stories, exercice).
- « Plus tard » = pause de `SNOOZE_DAYS` jours (3 par défaut), mémorisée sur l'appareil.

---

## 10 quater. Mode Créateur (réservé à MLT)

- **Activer** : Profil → Réglages → tout en bas, **🔒 Code créateur** → tape ta phrase
  secrète (majuscules et espaces autour ignorés) → OK. La première fois, toute l'équipe
  se téléporte pour t'accueillir.
- **Sécurité** : la phrase n'est écrite **nulle part** dans le code ni sur l'appareil.
  `src/core/creator.js` contient seulement son empreinte SHA-256 (`CREATOR_HASH`), calculée
  avec un « grain de sel » (`SALT`). L'appli calcule l'empreinte de ce que tu tapes
  (Web Crypto) et compare. ⚠️ Comme le dépôt est public et que la phrase est courte,
  quelqu'un de très motivé pourrait la deviner en essayant des mots au hasard : c'est un
  œuf de Pâques amusant, pas un coffre-fort (le mode ne donne accès à aucune donnée privée).
- **Changer la phrase** : dans un terminal, dans le dossier du projet :
  ```bash
  node -e "const c=require('crypto');console.log(c.createHash('sha256').update('revision-ia/createur:'+process.argv[1].trim().toLowerCase()).digest('hex'))" "ma nouvelle phrase"
  ```
  puis remplace la valeur de `CREATOR_HASH` par le résultat.
- **Ce qui change** : nom « MLT » (modifiable dans Réglages), badge 👑 Créateur, aura
  or/violet autour du compagnon, titre « Créateur » à côté du niveau, **répliques
  spéciales taquines** dans toutes les situations (section `CREATOR_LINES` de
  `src/data/characters.js` : arrivée, réussite, échec, attente, encouragement, fin,
  erreurs de Tidiane, conseil de correction, accueil). Les autres utilisateurs ne les
  voient jamais.
- **Panneau créateur** (Profil → 👑 Panneau créateur) : galerie de toutes les expressions,
  boutons de test (animations signature, pouvoirs léger/fort/ultime, conseil de correction
  excellent/bon/moyen/faible, confettis, installation, scène d'accueil), infos techniques
  (version, modèle, nombre de cours et fiches) et « Réinitialiser l'appli ».
- **Désactiver** : Réglages → 👑 Mode Créateur → Désactiver (réactivable avec le code).

---

## 10 cinquies. Sons style anime (`src/ui/sfx.js`)

- **Aucun fichier audio** : chaque son est fabriqué par le code (Web Audio API), donc rien
  à télécharger. Les sons démarrent après ton premier toucher (règle des navigateurs).
- **Activés par défaut**, volume modéré. Bouton **🔊/🔇** en bas à droite (au-dessus de la
  barre de navigation) et **curseur de volume** dans Réglages → Ambiance.
- Sons disponibles (objet `SOUNDS`) : clic, whoosh de téléportation, scintillement,
  montée d'énergie (3 niveaux, de plus en plus puissante), bonne / mauvaise réponse,
  swipe (différent selon la direction), retournement de fiche, niveau gagné, badge,
  apparition d'une bulle, révélation de la note.
- **Voix signature** de chaque perso (objet `VOICES` : hauteur, timbre, petite mélodie),
  jouée quand il parle dans une bulle.
- Pour modifier un son : change les fréquences (Hz) et durées (secondes) de sa fonction.
- Tous les sons se testent dans **Panneau créateur → 🔊 Sons**.

---

## 10 sexies. Nouvelles fonctions (v1.4 à v1.7)

### 📖 Le cours en manga (Nia)
- Bouton **📖 Manga** sur chaque notion du résumé, et **📖 Version manga** sur chaque story.
- L'IA écrit SEULEMENT le contenu des 4 cases (JSON : perso, expression, réplique,
  narration, onomatopée). La consigne est `mangaPrompt` dans `src/data/prompts.js`.
- L'appli dessine la planche elle-même (`src/ui/manga.js`) : 4 cases verticales,
  bordures épaisses, trame de points, lignes de vitesse, bulles, onomatopées,
  avec les personnages SVG. Les cases apparaissent une par une (streaming).
- Chaque planche est **enregistrée** (store `mangas`) : jamais regénérée, lisible hors ligne.
- Le passage du cours est affiché sous la planche (vérification ✓).
- **📤 Partager l'image** : PNG 1080 px de large (menu Partager du téléphone, sinon téléchargement).

### 📚 Le mode Histoire (Kaï) — AUCUN appel à l'IA
- Accès : tuile **Mode Histoire** sur l'accueil (adresse `#/histoire`).
- Histoire fixe en 12 chapitres : `src/data/story.js` (modifie les textes librement).
- Tes révisions donnent des points : +1 fiche maîtrisée, +3 quiz ≥ 70 %,
  +3 exercice ≥ 10/20, +10 boss vaincu. Seuils : `CHAPTER_POINTS` dans `src/core/story.js`.
- Chaque **matière est un arc** avec sa barre. À 6 points, son **boss** apparaît.
- Le chapitre 12 demande en plus d'avoir vaincu un boss.

### 💀 Le boss de fin d'arc (Ren) — `src/views/boss.js`
- Un examen blanc en combat : les questions viennent des quiz DÉJÀ créés pour la matière
  (l'IA n'est appelée que s'il y en a moins de 5, une seule fois).
- Barre de vie du boss (≈ 70 % des questions à réussir), 3 cœurs pour toi.
- Bonne réponse = coup + réplique d'un allié + aura ; 3 d'affilée = aura forte.
- Victoire : K.O., pouvoir ultime, confettis, XP, badges « Tueur de boss » / « Intouchable ».

### ⚔️ Duels entre amis, SANS serveur (Ren) — `src/core/duel.js`, `src/views/duel.js`
- Après un quiz : **🤝 Défier un ami**. Tout le quiz (questions, réponses, explications,
  ton score, ton pseudo, ton perso) est **compressé dans le lien** (après le `#`, avec lz-string).
- Partage par le menu du téléphone (WhatsApp…), sinon `wa.me`. Message accrocheur
  (« Je t'ai mis 8/10 sur « Les suites » 😏 Fais mieux. »).
- L'ami joue **sans clé Gemini** ni compte. S'il n'a jamais ouvert l'appli : petit accueil,
  pseudo, duel, puis proposition d'installer l'appli et de créer son profil.
- Écran de duel : les deux persos face à face, les deux scores, le gagnant.
  **↩️ Renvoyer le défi** : quand tu ouvres sa réponse, tu vois directement le résultat.
- Longueur : environ 2 000 caractères pour 10 questions (aucun souci pour WhatsApp).

### 📸 Image de statut WhatsApp (Binta) — `src/ui/status.js`
- Image 1080 × 1920 (JPEG ~300 Ko) : perso en pose de pouvoir, score ou récap, série 🔥,
  niveau, style néon/manga, nom de l'appli discret.
- Proposée après : examen blanc réussi (≥ 10/20), boss vaincu, niveau gagné (fenêtre de Binta),
  et dans le récap de la semaine (écran Stats).

### 🃏 Cartes à collectionner (Sora) — `src/core/collection.js`, `src/ui/card.js`, `src/views/collection.js`
- Chaque fiche devient une carte (aucun appel à l'IA) : titre, idée clé, perso attribué,
  couleur de la matière.
- Rareté selon ta maîtrise (répétition espacée, intervalle de la fiche) :
  Commune (réussie 1 fois) → Rare (≥ 6 j) → Épique (≥ 15 j) → Légendaire (≥ 35 j).
  Effets qui grandissent : reflet qui passe, holographique, aura animée.
- Nouvelles cartes et montées de rareté arrivent dans un **paquet** à ouvrir
  (retournement + flash, confettis pour les plus rares). Proposé à la fin d'une pile de fiches.
- **Classeur** par matière avec progression : Profil → 🃏 Ma collection (ou tuile Collection sur l'accueil).
- Chaque carte se partage en image (PNG 600 × 840).
- Seuils de rareté : `RARITIES` dans `src/core/collection.js`.

### 🥋 Mode Focus : le dojo d'Awa — `src/views/dojo.js`
- Minuteur travail / pause (25 / 5 par défaut, réglable), 100 % hors ligne.
- Ton compagnon s'entraîne (animation légère en boucle) ; son aura grandit à 25 %, 50 %, 80 % du temps.
- Si tu quittes l'appli pendant le travail : Awa réagit à ton retour et la session rapporte
  25 % d'XP en moins par sortie (un coup d'œil de moins de 3 s est pardonné).
- Ambiances générées (pluie, nuit, dojo), sans aucun fichier : `AMBIENTS` dans `src/ui/sfx.js`.
- Sessions enregistrées (store `focus`) : minutes du jour / 7 jours / total dans Profil.
- Badges : Premier entraînement, Esprit d'acier (session sans sortie), Maître du dojo (10 h).
- Nouveaux sons : `gong`, `oops`.

### 🧠 « Explique-moi comme si j'étais nul » (Ren) — `src/core/feynman.js`, `src/views/feynman.js`
- Accès : onglet Quiz → **🧠 Explique-moi**, ou bouton 🧠 à côté de chaque notion du résumé.
- Ren fait semblant de ne rien comprendre ; tu expliques par écrit (60 caractères minimum).
- L'IA (d'après ton cours) fait poser à Ren 2 ou 3 questions naïves mais piégeuses (en streaming),
  tu réponds une par une (ou « Je sais pas »).
- Résultat avec le conseil de correction : note de compréhension /20, ce qui est bien expliqué,
  oublié, faux, une correction courte et le passage du cours.
- Jamais deux fois le même appel : une explication identique réutilise les questions déjà reçues.
- Consignes : `feynmanQuestionsPrompt` et `feynmanGradePrompt` dans `src/data/prompts.js`.

### 🌙 Veille d'examen (toute l'équipe) — `src/core/veille.js`, `src/views/veille.js`
- Accès : onglet Quiz → **🌙 Veille d'exam**.
- Tu choisis la matière, ton temps (1 à 6 h) et l'heure de l'examen.
- Le plan vient de TES stats (fiches ratées, oublis, questions manquées) : cycle d'environ 1 h
  = focus au dojo 25 min → pause → fiches fragiles 15 min → quiz 10 min → pause,
  puis toujours un **mini examen final** (8 questions, d'abord celles déjà ratées).
- On réutilise tes fiches et quiz : l'IA n'est appelée que s'il n'existe aucun quiz pour la matière.
- Les blocs se cochent seuls (dojo, fiches, quiz) ; l'équipe se charge en puissance au fil de la nuit ;
  examen final réussi (≥ 70 %) → **pouvoir ultime**.
- Tidiane veille sur ton sommeil : heure de coucher conseillée (8 h 30 avant l'examen)
  et proposition de raccourcir le plan si besoin.
- Ambiance de nuit (étoiles, lune) + grillons générés en option (🦗).

### 🧪 Tester les nouveautés (Mode Créateur)
Panneau créateur → **🆕 Nouvelles fonctions** : planche manga démo, chapitres tous ouverts,
boss démo, duel démo et longueur du lien, statuts démo, carte légendaire, réouverture du paquet,
dojo d'1 minute, ambiances, veille (tout cocher sauf l'examen final, effacer).

### Répliques, sons, tests
- Répliques des nouvelles fonctions (et taquineries du Mode Créateur) : section
  `FEATURE_LINES` de `src/data/characters.js`.
- Nouveaux sons générés (aucun fichier) : `page`, `ink`, `unlock`, `hit`, `boss`, `victory`.
- Panneau créateur → **🆕 Nouvelles fonctions** : planche démo, image, ouvrir tous les
  chapitres, lire un chapitre, boss démo (n'enregistre rien), remettre l'histoire à zéro.

## 10 septies. Remplacer les cases de la BD par des illustrations

**Aucun code à toucher.** Il suffit de déposer une image avec le **bon nom** dans le
**bon dossier** : elle remplace automatiquement le dessin de la case. S'il n'y a pas
d'image, le dessin reste affiché.

### Le nom du fichier
```
public/story/chapitre-1/page-2-case-3.webp
              │          │      └── 3e case de la page (dans l'ordre de lecture)
              │          └── page 2 du chapitre
              └── chapitre 1
```
- Formats acceptés : **.webp**, **.png** ou **.jpg** (n'importe quelle taille).
- Pour connaître le nom exact de chaque case : appli → **Panneau créateur** →
  **🖼️ Illustrations des cases**. Chaque case y est listée avec ✅ (illustrée) ou
  ⬜ (dessin), son nom de fichier et la description de la scène.

### Déposer une image depuis github.com (téléphone ou PC)
1. Ouvre ton dépôt sur **github.com**, puis les dossiers `public` → `story` →
   `chapitre-1` (le chapitre voulu).
2. Bouton **Add file** → **Upload files**.
3. Choisis ton image. ⚠️ Renomme-la **avant** (ex. `page-1-case-1.png`) :
   GitHub garde le nom du fichier tel quel.
4. En bas, clique sur **Commit changes**.
5. Attends 2 à 3 minutes (onglet **Actions** : la pastille devient verte ✅), puis
   recharge l'appli. C'est en ligne !

Pour **changer** une image : dépose la nouvelle avec le même nom (elle écrase
l'ancienne). Pour **revenir au dessin** : ouvre l'image sur github.com → menu **⋯** →
**Delete file** → **Commit changes**.

### Ce que l'appli fait toute seule
- L'image est **recadrée** pour remplir la case, en gardant au centre son **point
  focal** (`illus.focus` dans le chapitre ; sinon le milieu de l'image). La page de BD
  a toujours le même format : le recadrage est **identique sur téléphone et sur
  ordinateur** (seul le zoom change), donc une bulle bien placée l'est partout.
- Bulles, cartouches, onomatopées, effets (vitesse, glitch…), sons et zooms du
  lecteur restent **par-dessus** l'image : les textes se modifient toujours dans
  `src/data/comic/chapitres/chNN.js`. Les effets ne recouvrent jamais les zones
  protégées (visages…) ; les éclats et halos qui les toucheraient sont retirés.
- **Taille du texte automatique** selon la taille de la case (lisible sur un
  téléphone de 360 px), et une bulle ne couvre jamais plus de **25 %** de la case.
- Au déploiement, chaque image est **optimisée** : WebP, 1200 px maximum, moins de
  200 Ko (outil `sharp`, voir `vite.config.js`). Tu peux donc déposer de gros PNG.
- Les images ne sont pas pré-téléchargées à l'installation : elles se chargent (puis
  restent hors ligne) quand on lit le chapitre.

### ⚡ Pour que tout s'affiche vite (automatique)
- **Aperçu flou** : au build, chaque image reçoit un minuscule aperçu (≈ 250 octets)
  inclus dans l'appli. La case s'affiche aussitôt en flou, puis l'image nette arrive
  en fondu. La case qu'on regarde est téléchargée **seule d'abord**, les autres ensuite.
- **3 tailles** par image (600, 900 et 1200 px de large) : l'appli prend la plus
  petite qui reste nette sur l'écran (et un cran plus léger si la connexion est lente
  ou en mode « économie de données »).
- **Préchargement** : la liste des chapitres prépare la page 1 du prochain chapitre ;
  pendant la lecture d'une page, la page suivante est déjà téléchargée.
- **Cache permanent** des illustrations (service worker) : une image vue une fois
  reste instantanée et disponible hors ligne, même après une mise à jour du site. Une
  image remplacée sur GitHub change d'adresse (`?v=…`) : jamais d'ancienne version.
- **Démarrage** : seuls l'accueil et le strict nécessaire sont chargés au lancement ;
  les autres écrans et le moteur de formules (KaTeX) arrivent à la demande. La
  vérification de mise à jour se fait en arrière-plan, quand l'appli est au repos.

### ✏️ Déplacer les bulles (sans toucher au code)
1. Dans l'appli : **Panneau créateur** → **✏️ Éditer les bulles**.
2. Choisis le **chapitre** et la **case** en haut de l'écran.
3. **Touche** une bulle, un cartouche ou une onomatopée, puis :
   - **glisse-la** pour la déplacer ;
   - tire la **poignée carrée bleue** pour l'élargir ou la rétrécir ;
   - tire la **poignée ronde rose** pour orienter la **pointe** (vers la bouche de
     celui qui parle) ;
   - **A− / A+** : taille du texte (**Taille auto** pour revenir au réglage
     automatique) ; ↺ ↻ : angle d'une onomatopée ; **Pointe** : auto / aucune.
   Tes modifications sont gardées sur l'appareil (brouillon), même si tu fermes.
4. Appuie sur **💾 Enregistrer** : le fichier **`bulles-chapitre-1.json`** est
   téléchargé (dossier Téléchargements).
5. Sur **github.com** : dossiers `public` → `story` → `chapitre-1` → **Add file** →
   **Upload files** → choisis ce fichier → **Commit changes**. Garde exactement ce
   nom ; s'il en existe déjà un, il est remplacé.
6. Attends 2 à 3 minutes (onglet **Actions** ✅) : les nouvelles positions sont en
   ligne. Pour revenir aux positions d'origine, supprime le fichier sur GitHub.

Seules les **positions et tailles** sont dans ce fichier : les textes restent dans le
code. Si tu ajoutes ou retires une bulle dans le code, refais un passage dans
l'éditeur puis ré-enregistre.

### Pour les prochains chapitres illustrés (développeur)
Dans chaque case de `chNN.js`, le bloc `illus` décrit l'image (en fractions de
l'image, 0 → 1) : `focus` (point focal), `keep` (zones à ne jamais couvrir : visages,
personnage, action, objet clé), `free` (zones libres pour les textes) et `mouths`
(bouche de chaque perso de `chars`, que vise la pointe des bulles). Ensuite :
```
npm run verifier-bulles        # chapitre 1
npm run verifier-bulles -- 2   # chapitre 2
```
Le script signale un texte posé sur une zone protégée, une bulle de plus de 25 % de
la case, un texte qui déborde, deux textes qui se touchent, un sujet coupé par le
recadrage et un ordre de lecture douteux (de haut en bas, de gauche à droite).

## 11. Changer de modèle Gemini (et vitesse de l'IA)

Par défaut : **`gemini-3.5-flash-lite`**, le modèle gratuit le plus **rapide** et le moins
surchargé (doc Google, septembre 2026). Pour en changer **sans toucher au code** :
Profil → Réglages → Modèle. Liste à jour : https://ai.google.dev/gemini-api/docs/models

Pour changer la valeur par défaut : `DEFAULT_SETTINGS.model` dans `src/core/db.js`.

### Comment l'appli va vite (`src/core/gemini.js`)
- **Streaming** (`streamGenerateContent`) : le résumé arrive partie par partie ; la 1re
  story s'affiche dès que la 1re partie est prête, les suivantes pendant que tu lis.
- **Réflexion minimale** : `thinkingLevel: "minimal"` (Flash-Lite) ou `"low"` (Flash),
  `thinkingBudget: 0` (Gemini 2.5). Un peu plus (`"low"`) seulement pour corriger les
  exercices et examens (calculs).
- **Bascule automatique** : si un modèle est surchargé (503) ou à court de quota (429),
  l'appli passe tout de suite au suivant de `MODEL_CHAIN` (attente 1 s puis 3 s max),
  puis revient au modèle principal pour la requête suivante. Le modèle utilisé s'affiche
  discrètement pendant le chargement.
- **En arrière-plan** : après l'import, UNE demande par morceau renvoie le résumé
  (streaming) puis les fiches et les questions du quiz (`prepareCourse` / `generatePack`
  dans `src/core/generate.js`, suivi par `src/core/jobs.js`).
- **Consignes courtes** et texte du cours compacté avant l'envoi.

### Comment l'appli économise le quota gratuit
- **Résumé + fiches + quiz = 1 demande par morceau** (avant : 1 + 1 + 1, et le texte du
  cours envoyé 3 fois). Morceaux de 20 000 caractères (avant 12 000).
- **Photos par lots de 8** (avant 3), compressées en JPEG qualité 0,6.
- **Tout le reste à la demande** : manga, Explique-moi, exercices, examen blanc, nouveau
  quiz ne partent que si tu appuies sur le bouton. Ce qui est déjà enregistré (planches,
  explications, corrections d'une même réponse) n'est **jamais redemandé**.
- **Plusieurs modèles** (`MODEL_CHAIN` dans `src/core/gemini.js`) : chaque modèle gratuit a
  son propre quota quotidien. Un modèle qui répond « quota du jour dépassé » (429) est
  mémorisé jusqu'à la recharge et n'est plus retenté (`src/core/quota.js`).
- **Compteur** : Réglages → 📊 Quota Gemini aujourd'hui (demandes par modèle, état,
  heure de la prochaine recharge).
- **Mesures** : Panneau créateur → ⏱️ Vitesse de l'IA (temps du 1er texte, temps total,
  modèle, réessais) + **banc d'essai avant / après** sur un de tes cours.

---

## 12. Sauvegarde de tes données

Tout est stocké **sur ton téléphone** (IndexedDB). Si tu effaces les données du navigateur
ou changes de téléphone, tout est perdu… sauf si tu as une sauvegarde :
**Réglages → ⬇️ Exporter** crée un fichier `.json` (cours, fiches, résultats, XP,
compagnon). Garde-le sur Google Drive, WhatsApp, clé USB…
**⬆️ Importer** le recharge (fusion avec les données existantes).
La clé API et les photos ne sont pas incluses.

---

## 13. Dépannage

| Problème | Solution |
|---|---|
| « 🔑 Clé API invalide » | Recopie la clé depuis AI Studio (sans espace), puis Tester. |
| « ⏳ Quota gratuit dépassé » | Quota par minute : attends 1 minute. Quota du jour épuisé sur tous les modèles : Tidiane donne l'heure de recharge (aussi dans Réglages → 📊 Quota). |
| « 🤖 Modèle introuvable » | Le nom du modèle a changé : mets-en un de la liste officielle. |
| « 📡 Connexion interrompue » | L'appli réessaie toute seule. Ton travail déjà fait est gardé : bouton « Reprendre / Continuer ». |
| « 📦 Fichier trop gros » | PDF > 50 Mo ou > 80 pages : découpe-le en plusieurs cours. |
| Le site GitHub est vide / 404 | Settings → Pages → Source = « GitHub Actions ». Vérifie l'onglet Actions (✅ vert ?). |
| Je ne vois pas mes modifications | Attends la fin de l'Action, puis ouvre l'appli : bandeau « Mettre à jour ». |
| Action rouge ❌ | Clique dessus pour lire l'erreur (souvent une faute de frappe dans un fichier JS). Teste avec `npm run build` en local. |

---

## 14. Sécurité

- **Aucune clé API dans le code ni dans le dépôt.** La clé est collée dans l'appli et
  reste dans IndexedDB sur l'appareil. Elle est envoyée uniquement à Google (en-tête
  `x-goog-api-key`), jamais dans une adresse web.
- Le dépôt est public : n'y mets jamais de clé, mot de passe ou sauvegarde personnelle
  (le `.gitignore` bloque déjà les fichiers `revision-ia-sauvegarde-*.json` et `.env`).
- Les textes renvoyés par l'IA sont « échappés » avant affichage (pas d'injection de code).

---

## 15. Feuille de route

- ✅ **Phase 1** : style, navigation, 7 persos (expressions, animations, répliques),
  compagnon, XP/niveaux/série, import photo/PDF, résumé en stories, fiches swipe SM-2,
  quiz contre Ren + récap Wrapped, sources vérifiées, signalement d'erreurs, JSON
  structuré + réessais, erreurs expliquées par Tidiane, hors ligne.
- ✅ **Phase 2** : exercices corrigés (Awa, réponse texte ou photo), mode vérification,
  Binta (badges, niveaux, stats, récap de la semaine), examen blanc chronométré (Ren).
- ✅ **Phase 3** : conseil de correction animé (téléportation, table, délibération,
  révélation), auras et pouvoirs spéciaux des 8 persos, règles de rareté, réglage
  complète / courte / désactivée.
- ✅ **v1.4** : cours en manga (planches yonkoma), mode Histoire (12 chapitres), boss de fin d'arc.
- ✅ **v1.5** : duels entre amis par lien (sans serveur), image de statut WhatsApp.
- ✅ **v1.6** : cartes à collectionner (raretés, paquets, classeur), mode Focus (dojo d'Awa).
- ✅ **v1.7** : « Explique-moi comme si j'étais nul » (Ren), veille d'examen (plan intensif).
- ✅ **v1.16** : persos vivants (fondu entre expressions, respiration, micro-mouvements,
  bulles qui s'écrivent). **v1.17** : clignement et bouche (calques tirés de
  `yeux-fermes.png` / `bouche-ouverte.png`), bouton « Télécharger » des portraits.
- ✅ **v1.15.1** : correctif de l'écran de bienvenue (la page ne se recharge plus toute seule
  à la première visite ni pendant une mise à jour ; saisie sauvegardée au fur et à mesure).
- ✅ **v1.15** : économie de quota (résumé + fiches + quiz en 1 demande, photos par 8,
  bascule entre modèles gratuits avec mémoire des modèles épuisés, compteur dans les Réglages).

Bibliothèques utilisées (incluses dans l'appli, rien à télécharger en plus) :
[Vite](https://vite.dev), [KaTeX](https://katex.org) (formules),
[pdf.js](https://mozilla.github.io/pdf.js/) (lecture des PDF), [lz-string](https://github.com/pieroxy/lz-string) (liens de duel),
polices [Unbounded](https://fonts.google.com/specimen/Unbounded) et
[Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (via Fontsource).
