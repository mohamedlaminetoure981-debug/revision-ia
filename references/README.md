# Références pour l'outil d'illustration

Ce dossier contient les images que l'outil (`npm run generer`, `npm run retoucher`) **joint
automatiquement** à Gemini pour qu'il garde les bons visages, les bonnes tenues et le bon décor.
Il n'est **pas publié** dans l'appli (il n'est pas dans `public/`).

Formats acceptés : `.png`, `.jpg`, `.jpeg`, `.webp`. Les images sont réduites automatiquement
avant l'envoi (1024 px) : inutile de les réduire toi-même.

## 1. `personnages/` — une fiche par personnage

Le personnage **de face, en pied ou en buste**, sur un **fond gris uni** (pas de décor), avec sa
tenue complète (voir `docs/methode-illustration.md` §1.1). Nom du fichier = identifiant du perso :

| Fichier | Personnage |
|---|---|
| `kai.png` | Kaï, mains nues |
| `kai-bande.png` | Kaï avec **seulement la main droite bandée** (chapitres 2 et suivants) |
| `mory.png` | Mory |
| `nia.png` | Nia |
| `binta.png` | Binta |
| `sora.png`, `ren.png`, `awa.png`, `tidiane.png` | les autres membres de l'équipe (la fiche de Sora paraît jeune : le prompt impose un visage adulte) |
| `bibliothecaire.png`, `etudiant_jaune.png`… | figurants (facultatif) |

- Une 2ᵉ vue est possible : `kai-2.png`, `nia-2.png` (2 fichiers au plus par personnage).
- `kai-bande.png` est choisi tout seul quand la description de la case parle de bandage ;
  sinon `kai.png`.
- **Règle d'or** : l'outil ne joint JAMAIS la fiche d'un personnage absent de la case (sinon Gemini
  dessine des clones). Un personnage dit « hors champ » dans la description n'est pas joint.

## 2. `decors/` — un décor vide par lieu

Un plan large du lieu **sans personnage** (lumière et heure du chapitre). Nom du fichier = identifiant
du décor utilisé dans les chapitres (`bg: { id: '…' }`) :

| Fichier | Décor |
|---|---|
| `bibliotheque.jpg` | la salle de lecture de la bibliothèque universitaire (chapitre 3) |
| `rue.jpg` | rue ou campus de Conakry |
| `classe.jpg` | amphithéâtre, salle de cours |
| `marche.jpg` | le marché de Madina |
| `corniche.jpg` | la corniche (sans ce fichier : la dernière case du chapitre 3, `DECOR_REF_DEFAUT` dans `config.mjs`) |
| `chambre.jpg` | la chambre de Kaï |
| `toit.jpg` | le toit-terrasse |

- Version propre à un chapitre : `chapitre-3-bibliotheque.jpg` (elle passe avant `bibliotheque.jpg`).
- Sans fichier de décor, l'outil prend une case déjà illustrée du même lieu (même chapitre, ou un autre
  chapitre : la corniche du chapitre 1 par exemple).

## 3. Référence de STYLE (rien à déposer)

L'outil joint **toujours** au moins une case déjà illustrée du **même chapitre** (la plus proche, du
même décor si possible) comme référence de **style** : sans elle, Gemini part en photoréalisme.
Pour un tout nouveau chapitre sans aucune image, il prend une case du chapitre précédent et te prévient.
