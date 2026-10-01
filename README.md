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
10. [Ajouter une fonctionnalité](#10-ajouter-une-fonctionnalité)
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

L'offre gratuite a des **quotas** (nombre de requêtes par minute et par jour). Si tu les
dépasses, Tidiane te le dit : attends quelques minutes, ou change de modèle (section 11).

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
Mettre à jour »** apparaît dans l'appli.

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
    │   ├── importer.js        Photos (compression), PDF (lecture), transcription
    │   ├── generate.js        Création du résumé, des fiches, des quiz
    │   ├── srs.js             Répétition espacée (algorithme SM-2)
    │   ├── creator.js         Mode Créateur (empreinte du code secret, nom affiché)
    │   ├── game.js            XP, niveaux, série de jours, objectifs, aura
    │   └── badges.js          Liste des badges et leurs conditions
    ├── ui/                    Outils d'affichage
    │   ├── character.js       Dessin SVG des persos en calques + animations
    │   ├── ui.js              Markdown + formules (KaTeX), bulles, fenêtres, erreurs
    │   ├── fx.js              Confettis, onomatopées, vibrations, fête de Binta
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
2. **Transcription** : les images sont envoyées à Gemini **par lots de 3**, qui les
   transforme en texte. Chaque lot réussi est enregistré : si la connexion coupe, on
   **reprend** là où on s'était arrêté.
3. Ensuite, résumé / fiches / quiz sont créés **à partir du texte** (léger), jamais en
   renvoyant les photos. Le cours est découpé en morceaux pour ne rien oublier.
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

### Remplacer un perso par des images dessinées
1. Dessine (ou fais dessiner) une image par expression, fond transparent, format
   **PNG ou WebP**, proportions ≈ 200 × 232 (portrait).
2. Dépose-les dans **`public/characters/`**, par ex. `kai-neutre.webp`, `kai-joie.webp`.
3. Dans `characters.js` :
   ```js
   images: {
     neutre: 'characters/kai-neutre.webp',
     joie: 'characters/kai-joie.webp',
     celebration: 'characters/kai-celebration.webp',
   },
   ```
   Expressions possibles : `neutre`, `joie`, `reflexion`, `celebration`, `encouragement`,
   `surprise`, `concentration`, `clin`. Une expression sans image utilise l'image `neutre`
   (ou le dessin SVG s'il n'y a aucune image). **Rien d'autre à modifier.**

### Ajouter les voix (plus tard)
Dépose des fichiers audio courts dans `public/voices/`, puis :
```js
voice: { arrivee: ['voices/kai-arrivee-1.mp3', 'voices/kai-arrivee-2.mp3'] },
```
La fonction `playVoice()` de `src/ui/fx.js` les joue (si les sons sont activés).

### Animations
Dans `src/styles/characters.css` : animations de base (respiration, clignement, cheveux),
réactions (`anim-bounce`, `anim-jump`, `anim-shake`) et animations **signature**
(`.sig-salut`, `.sig-lunettes`, …). Pour en créer une : ajoute une classe `.sig-monnom`
et mets `signature: 'monnom'` dans le perso.

---

## 9. Modifier les consignes (prompts) de l'IA

**Toutes** les consignes envoyées à Gemini sont dans **`src/data/prompts.js`** :

| Élément | Rôle |
|---|---|
| `SYSTEM` | rôle général de l'IA (ton, règles, LaTeX, citations) |
| `transcribePrompt` + `TRANSCRIBE_SCHEMA` | photos → texte |
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
  et retire les questions ambiguës. ⚠️ Utilise environ 2× plus de quota gratuit.
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

## 10 sexies. Nouvelles fonctions (v1.4 et suivantes)

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

### Répliques, sons, tests
- Répliques des nouvelles fonctions (et taquineries du Mode Créateur) : section
  `FEATURE_LINES` de `src/data/characters.js`.
- Nouveaux sons générés (aucun fichier) : `page`, `ink`, `unlock`, `hit`, `boss`, `victory`.
- Panneau créateur → **🆕 Nouvelles fonctions** : planche démo, image, ouvrir tous les
  chapitres, lire un chapitre, boss démo (n'enregistre rien), remettre l'histoire à zéro.

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
- **En arrière-plan** : après l'import, résumé d'abord (streaming), puis fiches (2 morceaux
  à la fois) et quiz se préparent pendant que tu lis (`prepareCourse` dans
  `src/core/generate.js`, suivi par `src/core/jobs.js`).
- **Consignes courtes** et texte du cours compacté avant l'envoi.
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
| « ⏳ Quota gratuit dépassé » | Attends quelques minutes (ou demain pour le quota du jour), ou change de modèle. |
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

Bibliothèques utilisées (incluses dans l'appli, rien à télécharger en plus) :
[Vite](https://vite.dev), [KaTeX](https://katex.org) (formules),
[pdf.js](https://mozilla.github.io/pdf.js/) (lecture des PDF),
polices [Unbounded](https://fonts.google.com/specimen/Unbounded) et
[Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (via Fontsource).
