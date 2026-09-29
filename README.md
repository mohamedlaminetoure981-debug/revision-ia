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
2. Android : menu **⋮ → « Installer l'application »** (ou « Ajouter à l'écran d'accueil »).
   iPhone : bouton **Partager → « Sur l'écran d'accueil »**.
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
    │   ├── views.css          Stories, swipe, quiz, récap « Wrapped »
    │   └── characters.css     Animations des personnages
    ├── core/                  « Moteur » (pas d'affichage)
    │   ├── db.js              Base de données locale (IndexedDB), réglages, sauvegarde
    │   ├── gemini.js          Appels à Gemini : erreurs, réessais, vérification du JSON
    │   ├── importer.js        Photos (compression), PDF (lecture), transcription
    │   ├── generate.js        Création du résumé, des fiches, des quiz
    │   ├── srs.js             Répétition espacée (algorithme SM-2)
    │   ├── game.js            XP, niveaux, série de jours, objectifs, aura
    │   └── badges.js          Liste des badges et leurs conditions
    ├── ui/                    Outils d'affichage
    │   ├── character.js       Dessin SVG des persos en calques + animations
    │   ├── ui.js              Markdown + formules (KaTeX), bulles, fenêtres, erreurs
    │   └── fx.js              Confettis, onomatopées, vibrations, sons
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
    accessories: ['headphones'],  // headphones, visor, earrings, hoops, headband, earbuds, chain, clips, beard
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
Modifie `look` puis regarde le résultat dans `galerie.html` (section 5).
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

## 11. Changer de modèle Gemini

Par défaut : **`gemini-3.8-flash`** (meilleur modèle Flash gratuit d'après la doc Google,
septembre 2026). Pour en changer **sans toucher au code** : Profil → Réglages → Modèle.
Liste à jour : https://ai.google.dev/gemini-api/docs/models

Pour changer la valeur par défaut : `DEFAULT_SETTINGS.model` dans `src/core/db.js`.
Les modèles « lite » sont plus rapides et ont souvent plus de quota gratuit.

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
- ⏳ **Phase 3** : conseil de correction animé, auras et pouvoirs spéciaux.

Bibliothèques utilisées (incluses dans l'appli, rien à télécharger en plus) :
[Vite](https://vite.dev), [KaTeX](https://katex.org) (formules),
[pdf.js](https://mozilla.github.io/pdf.js/) (lecture des PDF),
polices [Unbounded](https://fonts.google.com/specimen/Unbounded) et
[Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (via Fontsource).
