# Contenus traduits (répliques des personnages, BD, Mode Histoire)

Un dossier par langue : `contenu/<langue>/` (ex. `contenu/en/`), avec :

- `personnages.json` — répliques, rôles, conseils… (même forme que `src/data/characters.js`)
- `bd.json` — bulles et textes des BD, par chapitre (`ch01`, `ch02`…)
- `histoire.json` — titres, résumés et dialogues du Mode Histoire (`STORY_TITLE`, `CHAPTERS`)

Seuls les textes traduits y figurent : ce qui manque s'affiche en français.
Ces fichiers sont remplis par le script : `npm run traduire -- en` (voir README, section 10 octies).
