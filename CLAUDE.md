# CLAUDE.md — Règles permanentes (sessions PC et cloud)

## Qui je suis
Étudiant en informatique en Guinée, connexion lente et instable, budget zéro.
Je ne modifie pas le code moi-même : je travaille uniquement par instructions.
J'alterne entre Claude Code sur mon PC (Windows) et les sessions cloud (claude.ai/code).
Réponds-moi toujours en français, simplement.

## Au début de CHAQUE session
1. Faire un `git pull` sur `main` pour récupérer les modifications faites ailleurs
   (cloud ou PC). Si des modifications locales non poussées existent, me prévenir
   avant de toucher à quoi que ce soit.
2. Lire le `README.md` pour se resituer si nécessaire.

## Pendant le travail
- Une seule session à la fois sur le projet.
- Déployer après chaque partie d'un chantier, pas à chaque petite modification.
- Ne jamais mettre de clé API dans le code ni dans le dépôt.
- Fluidité obligatoire sur un Android d'entrée de gamme (légèreté, peu d'animations lourdes).
- Ne jamais casser ce qui fonctionne : vérifier les autres fonctionnalités après chaque changement.

## À la fin de CHAQUE tâche
1. Commit et push DIRECTEMENT sur la branche `main` (pas de nouvelle branche, pas de
   pull request), pour que GitHub Actions déploie.
2. Vérifier que le déploiement GitHub Actions a réussi.
3. Mettre à jour le `README.md` si quelque chose a changé.
4. Me faire un compte rendu simple en français : ce qui a changé, ce qui reste à faire,
   et ce que je dois vérifier dans l'appli.

## Infos sur le projet
**Révision IA — La Jeunesse de 2026** : PWA gratuite de révision (cours importés en
photo/PDF, résumés, fiches, quiz, exercices), qui marche hors ligne.
Technique : HTML/CSS/JS sans framework + Vite, IA Google Gemini appelée depuis le
navigateur (clé saisie dans l'appli, stockée dans IndexedDB, jamais dans le dépôt),
hébergement GitHub Pages, déploiement par GitHub Actions (`.github/workflows/deploy.yml`).

- **Quota Gemini (gratuit)** : résumé + fiches + quiz = UNE demande par morceau (`generatePack`
  dans `src/core/generate.js`), photos par lots de 8, le reste seulement à la demande, rien
  de déjà enregistré n'est redemandé. Bascule entre modèles gratuits (`MODEL_CHAIN` dans
  `src/core/gemini.js`) ; modèles épuisés mémorisés jusqu'à minuit heure du Pacifique et
  compteur par modèle (`src/core/quota.js`, Réglages → 📊). Mode vérification = 2× le quota.

- **Code** : `src/core` (logique), `src/views` (écrans), `src/ui` (composants),
  `src/comic` (BD/lecteur), `src/data` (personnages, prompts, histoire), `scripts/` (build).
- **Personnages** (Kaï, Mory, Nia, Sora, Ren, Awa, Tidiane, Binta) : dessinés en SVG par défaut,
  remplaçables par des images sans toucher au code. Dans `public/characters/<perso>/` :
  2 « planches » d'expressions (`planche-a`, `planche-b`) + un fichier `planches.json` qui
  indique la grille (ex. `[2, 4]`) et le numéro de case de chaque expression
  (de gauche à droite, rangée du haut d'abord ; 1 = en haut à gauche), ou des « zones »
  pour une disposition irrégulière. Expressions : neutre, joie, réflexion, célébration,
  encouragement, surprise, clin, concentration. Une planche peut n'avoir qu'un seul portrait.
  Le build (`scripts/planches.mjs`) découpe et optimise tout seul. Détails : README section 8.
  **Cadrage par expression (optionnel)** pour un geste qui dépasse du cadre (main levée…) :
  dans la planche, `"cadrage": { "<expression>": { "zoom": 0.76, "dx": -9, "fondu": false } }`
  (dézoom autour des yeux, décalage en % de l'image, pas de fondu des bords). Utilisé
  uniquement s'il est présent ; ex. Tidiane/encouragement. Détails : README section 8.
- **Mode Histoire** (Kaï, sans appel à l'IA) : 12 chapitres, textes dans `src/data/story.js`
  et BD dans `src/data/comic/chapitres/chNN.js`. Les révisions donnent des points
  (seuils dans `src/core/story.js`) ; chaque matière est un arc avec un boss (`src/views/boss.js`).
- **Convention de nommage des cases** (illustrations de la BD) :
  `public/story/chapitre-N/page-P-case-C.(webp|png|jpg)` — N = chapitre, P = page,
  C = case dans l'ordre de lecture. Sans image, le dessin SVG reste affiché. Les images
  sont optimisées au build (WebP, ≤ 1200 px). Liste des cases : Panneau créateur →
  « 🖼️ Illustrations des cases ». Détails : README section 10 septies.
- **Mode Créateur** (réservé à MLT) : activé par une phrase secrète (Profil → Réglages →
  Code créateur) ; seule son empreinte SHA-256 est dans `src/core/creator.js`. Donne le
  badge 👑, des répliques spéciales et le **Panneau créateur** (galerie des expressions,
  tests des sons et nouveautés, illustrations des cases, remise à zéro). Détails : README section 10 quater.
