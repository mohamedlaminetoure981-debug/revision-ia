# Méthode d'illustration des chapitres avec Gemini

Guide pour illustrer les prochains chapitres de **Révision IA — La Jeunesse de 2026** avec
**Google AI Studio** (aistudio.google.com), modèle Gemini « Image ». Il résume ce que le travail sur
le chapitre 1 (54 illustrations + 7 cases dessinées par l'appli) a appris.

> En une phrase : **préparer des références, écrire des prompts très cadrés, vérifier chaque image
> contre une liste d'erreurs connues, et toujours repartir de la dernière case validée.**

---

## 1. Avant de commencer un chapitre : les références

Gemini oublie vite. Il faut lui montrer, à chaque scène, à quoi ressemblent les personnages et le lieu.

### 1.1 Fiche personnage sur fond gris
Pour chaque personnage (Kaï, l'étudiant, la vendeuse, Mory…), une image de référence :
- le personnage **de face, en pied**, sur un **fond gris uni** (pas de décor : Gemini ne doit pas
  recopier un lieu) ;
- **tenue complète** visible (sweat, casque, chaussures, lunettes…) ;
- si la tenue change en cours de chapitre (blessures, manche déchirée), une fiche par état ;
- dans le prompt, une phrase qui **décrit la fiche en mots** (cheveux, tenue, accessoires) : l'image
  seule ne suffit pas.

### 1.2 Décor vide de référence
Pour chaque lieu (la chambre, la corniche, le marché), une image du **décor sans personnage** :
- un plan large, lumière et heure du chapitre, tous les éléments importants visibles ;
- c'est elle qui fixe l'**inventaire** du décor (voir « SCENE LOCK ») ;
- pour un lieu qui évolue (le marché se vide, l'étal se renverse), faire une version « avant » et une
  version « après », ou mettre à jour la référence au fil des pages.

### 1.3 Le script
Garder le script du chapitre sous la main (`docs/scenario-ch01-v2.md` pour le chapitre 1) :
**bible de continuité** (état physique du héros, heure, lumière, objets) + description de chaque case.
Les textes (bulles, pensées, cartouches, onomatopées) **ne se dessinent pas** : l'appli les ajoute.

---

## 2. Structure d'un prompt (à copier à chaque case)

Sept blocs, toujours dans le même ordre, en anglais (Gemini obéit mieux) :

```
STYLE
Modern shonen manga, thick black ink outlines, cel-shading, saturated colors, readable realistic action,
no cute style. 16:9 landscape, subject centered.

SCENE LOCK / INVENTORY
(Le décor, objet par objet, avec leur place et leur état.)
Same street as the reference image. Exactly these elements: a cracked concrete pillar on the right,
three plastic crates (two blue, one green) at its base, a grey backpack on the road, a torn billboard
in the distance. Nothing else added. Full midday sun, hard shadows.

CHARACTER LOCK
(Chaque personnage, décrit comme sur sa fiche.)
Kaï: short black curly hair with a faded side, purple hoodie, black headphones around his NECK (not on his
ears), black joggers, white sneakers. Torn right sleeve, dust on clothes, small cut on lower lip.
Same face as the character sheet.

CAMERA
Eye-level, medium shot, seen from the left. Kaï at the right third of the frame.

ACTION
(Ce qui se passe, une seule action par image.)
Kaï sits against the pillar, holding his stomach, grimacing. His cracked phone lies on the ground next to
his hand. A student kneels far behind him.

PHYSICAL LOGIC
(Les lois de la scène : poids, appuis, ombres, direction.)
Everything rests on the ground and casts a shadow to the left. The crates are heavy and stay where they
fell. The phone lies flat.

DO NOT
No text, no speech bubbles, no captions, no sound-effect lettering, no logos, no watermark, no extra
characters, no extra objects, no character looking at the camera.
```

Pourquoi ces blocs :
- **STYLE** : le même à chaque case, sinon le dessin dérive d'une image à l'autre.
- **SCENE LOCK / INVENTORY** : lister les objets **empêche Gemini d'en inventer** et de modifier le lieu.
- **CHARACTER LOCK** : répéter la description, même si la fiche est jointe.
- **CAMERA** : une seule phrase, toujours le même vocabulaire (eye-level, low angle, over-the-shoulder,
  point of view…).
- **ACTION** : une seule action. Deux actions = un personnage dessiné deux fois.
- **PHYSICAL LOGIC** : évite les objets qui flottent et les ombres incohérentes.
- **DO NOT** : liste négative, indispensable (voir §3).

---

## 3. Les erreurs fréquentes de Gemini et leurs parades

| Erreur | Parade (à écrire dans le prompt) |
|---|---|
| **Les cheveux changent** d'une case à l'autre (plus longs, lisses, couleur) | Décrire la coiffure mot pour mot dans CHARACTER LOCK (« short black curly hair, faded sides ») ; joindre la dernière case validée ; ajouter « hair identical to the previous image ». |
| **Le casque est posé sur les oreilles** au lieu d'être autour du cou | Écrire « headphones resting around his NECK, NOT on his ears, ears fully visible ». |
| **Des objets flottent** (caisses, téléphone, mangues en l'air) | Bloc PHYSICAL LOGIC : « everything rests on the ground, nothing floats, every object casts a shadow ». Décrire sur quoi chaque objet repose. |
| **Un personnage est dessiné deux fois** (jumeau, reflet, silhouette en trop) | Une seule action par image ; écrire « exactly ONE Kaï, no duplicate, no twin, no reflection » ; compter les personnages dans DO NOT (« exactly two people in the image »). |
| **Des formes blanches apparaissent** dès qu'on parle de bulles | **Ne jamais écrire** « bubble », « speech », « text », « caption » dans l'ACTION. Si besoin, écrire seulement dans DO NOT : « no text of any kind ». Laisser une zone calme du dessin pour que l'appli y place la bulle. |
| **Le décor revient à son état d'origine** quand on joint une vieille référence (étal de nouveau debout, panneau intact, enseignes remplies) | Joindre **la dernière case validée** plutôt que la référence d'origine ; lister l'état actuel dans SCENE LOCK (« the mango stall stays overturned, the billboard stays torn and empty »). |
| **Le personnage regarde la caméra** | Écrire où il regarde (« looks at the phone in his hand », « looks toward the intersection ») et « nobody looks at the camera ». |
| **Proportions géantes au premier plan** (main énorme, tête démesurée) | Cadrer en plan moyen, pas en gros plan extrême ; écrire « natural proportions, no exaggerated perspective, foreground hand normal size » ; ou utiliser le point de vue du personnage (voir §4). |
| **Détails qui changent** (blessure qui disparaît, manche qui se répare) | Rappeler l'état physique dans CHARACTER LOCK à chaque case, comme dans la bible de continuité. |
| **Texte illisible ou inventé** (panneaux, enseignes) | « all signs and billboards are blank » ; l'appli n'a pas besoin de texte dans l'image. |

---

## 4. Les bonnes pratiques

1. **Une nouvelle discussion par page.** Une longue conversation fait dériver le style. On repart de zéro
   à chaque page, avec STYLE + références.
2. **Joindre la dernière case validée**, pas la référence d'origine. Elle porte l'état courant du décor
   et des personnages (blessures, objets déplacés).
3. **Garder le cadrage que le modèle maîtrise.** Si un plan marche (plan moyen en légère plongée), le
   réutiliser pour la case suivante plutôt que d'inventer un angle audacieux.
4. **Utiliser le point de vue du personnage** (« seen through Kaï's eyes, we see his hand and his feet »)
   pour les contre-plongées difficiles : on évite de dessiner le héros et on garde le décor identique
   d'une case à l'autre (pages 8 et 9 du chapitre 1).
5. **Télécharger les originaux** (bouton de téléchargement d'AI Studio), **jamais une capture d'écran** :
   la capture est plus petite et floue. L'appli ne peut pas rendre plus net que le fichier d'origine
   (voir `npm run verifier-nettete`).
6. **Format 16:9, sujet au centre.** L'appli recadre l'image selon la forme de la case (les cases étroites
   gardent le centre) : tout ce qui est important (visages, mains, objet clé) doit être au centre ou dans
   le tiers central.
7. **Laisser des zones calmes** (ciel, mur, route) autour du sujet : c'est là que se posent les bulles.
8. **Nommer le fichier tout de suite**, `page-P-case-C.jpg` (voir README section 10 septies), et le
   déposer dans `public/story/chapitre-N/`.
9. **Vérifier avec les contrôles de l'appli** après le dépôt :
   - `npm run verifier-bulles -- N` : recadrage et bulles (aucun visage couvert ni coupé) ;
   - `npm run verifier-nettete -- N` : aucune image agrandie, donc floue ;
   - Panneau créateur → « 🖼️ Illustrations des cases ».
10. **Régler le recadrage et les bulles** dans le code du chapitre (`illus` : `focus`, `keep`, `free`,
    `mouths`) en regardant l'image. Chaque `keep` est une zone à ne jamais couvrir.
11. **Cases dessinées par l'appli** (écrans de téléphone, cahier) : jamais d'illustration ; ne pas les
    demander à Gemini.

---

## 5. Cases « illustration + surimpression » (textes posés par l'appli)

Gemini écrit mal (lettres inventées, mots déformés). Quand une image doit montrer des **mots** (carte avec
des noms de quartiers, panneau, écran avec des chiffres), on sépare le travail :

1. **L'illustration ne contient AUCUN texte.** Dans le prompt : ACTION décrit seulement les formes (« a realistic
   map of the Conakry peninsula, coastline, sea, main roads, about ten glowing red dots linked by a thin dotted
   purple line ») et DO NOT dit « no text, no letters, no numbers, no labels, no legend ».
2. **Prévoir la place des textes** : des zones calmes (mer, aplat de couleur) près des points à nommer, et le
   sujet bien au centre (16:9).
3. **L'appli ajoute les textes** (`labels` dans la case, voir README section 10 septies) : texte clair avec un
   contour sombre, lisible sur n'importe quelle image ; les dates sont plus petites, rosées, en italique.
4. **Une fois l'image déposée**, placer chaque texte au bon endroit avec le Panneau créateur → ✏️ Éditer les
   bulles (glisser ; A− / A+ pour la taille), puis 💾 Enregistrer et déposer `bulles-chapitre-N.json`.
5. Les textes sont **traduits** comme les bulles (`npm run traduire -- en`).

Exemple : chapitre 2, page 4 case 2 (carte de Conakry sur la tablette de Mory : 7 quartiers + 4 dates).
Dans le Panneau créateur → « 🖼️ Illustrations des cases », ces cases sont marquées 🏷️.

---

## 6. Leçons du chapitre 2 (53 illustrations)

### 6.1 Bloc EYE-LINE : quand deux personnages se parlent
Sans consigne, Gemini fait regarder la caméra, ou regarder « dans le vide ». Ajouter un bloc dédié :

```
EYE-LINE
Kaï looks at Mory: his head is turned to the right, his pupils are fixed on Mory's eyes.
Mory looks at Kaï: his head is turned to the left, his pupils are fixed on Kaï's eyes.
Mory's glasses are fully transparent: both of his eyes and pupils are clearly visible through the lenses
(no opaque reflection, no white glare).
Nobody looks at the camera.
```

- Dire pour chacun **la direction de la tête ET celle des pupilles** (« head », « pupils »).
- Les **verres de Mory doivent être transparents** : sinon Gemini dessine un reflet blanc ou cyan opaque
  et l'on ne voit plus ses yeux (l'éclat cyan reste sur la monture et sur les lignes de la veste).
- Pour une réplique, la bouche du personnage qui parle est légèrement ouverte, l'autre a la bouche fermée.

### 6.2 Repère de taille entre personnages
Gemini rapetisse ou agrandit un personnage selon la case (Mory adolescent, Kaï enfant, tête géante…).
Ajouter dans CHARACTER LOCK :

```
SIZE REFERENCE
Kaï and Mory are both young adults of the same height: their shoulders are at the same level,
their faces are adult faces (not child-like, no big round cheeks), natural proportions.
```

Et joindre **une case validée où les deux sont ensemble** (pas deux fiches séparées) quand on les redessine côte à côte.

### 6.3 Montrer un personnage de dos quand son visage n'est pas indispensable
Chaque visage dessiné est un risque (cheveux, âge, regard qui change). Quand le texte ne l'exige pas, **le montrer de dos
ou en amorce** : un seul visage à contrôler au lieu de deux, la pose est plus simple, et le personnage reste reconnaissable
à sa silhouette (sweat violet, casque autour du cou ; veste marine à lignes cyan). Exemples du chapitre 2 :
Kaï de dos au premier plan face à Mory (page 3), Mory qui s'éloigne (page 4), Kaï et Mory de dos face à la ville (page 6),
Kaï de dos en amorce à gauche, Mory au centre (page 12 case 5).

### 6.4 Bloc REALISM LOCK
Pour garder un rendu manga cohérent d'une case à l'autre, et éviter qu'une scène devienne « photo » ou « 3D » :

```
REALISM LOCK
Same modern shonen manga style as the reference: thick black outlines, cel-shading. No photorealism, no 3D render,
no painterly style. Realistic proportions and physics: real weight, real shadows, objects rest on surfaces,
hands have five fingers, no deformed anatomy. Light source and shadows consistent with the time of day.
```

À placer juste après STYLE. Il corrige aussi les mains (doigts en trop) et les ombres incohérentes.

### 6.5 Une nouvelle discussion AI Studio par page, et après deux retouches ratées
- **Une discussion par page** (déjà vu au §4) ; **et** repartir d'une nouvelle discussion **après deux retouches ratées**
  de la même case : au-delà, Gemini s'enferme dans son erreur (il reproduit la même faute, ou en ajoute). On recopie le
  prompt d'origine, on joint la dernière case validée, et on corrige la consigne fautive plutôt que de la répéter.
- Ne retoucher qu'**un seul défaut à la fois** (« only change the eyes direction, keep everything else identical »).

### 6.6 Déposer les images par git quand un fichier dépasse 25 Mo
Le site GitHub (« Add file → Upload files ») **refuse les fichiers de plus de 25 Mo** (les PNG d'AI Studio en 16:9 font
souvent 2 Mo, mais un lot de nombreuses images, ou un PNG exceptionnel, dépasse la limite et le dépôt échoue).
Dans ce cas : déposer **par git** (depuis le PC : copier les images dans `public/story/chapitre-N/`, puis
`git add`, `git commit`, `git push` sur `main`), pas par le site. Le build réduit ensuite les images (WebP, 1376 px max
si la source est plus petite), donc des PNG lourds ne ralentissent pas l'appli.

### 6.7 Autres constats
- **Cases étroites** (3 cases sur une rangée) : l'image 16:9 y est très recadrée (30 % de sa largeur visible) donc
  agrandie et moins nette ; le sujet doit être **au centre** et **les rangées de 3 cases évitées** pour les images à
  plusieurs personnages (le chapitre 2 a élargi les cases des pages 4 et 8).
- **Bandeau de couleur** : parfois Gemini laisse une bande unie en haut de l'image (ex. chapitre 2 page 1 case 1 et
  page 7 case 1) ; la bande peut servir de place pour un cartouche, sinon redemander l'image avec « no flat color band,
  the scene fills the entire frame ».
- **Texte sur un objet** (nom sur un taxi, enseigne) : Gemini l'invente ; ajouter « all signs, taxi plates and
  billboards are blank ».

---

## 7. Fiche des personnages et décors du chapitre 1

### Personnages

| Personnage | Description à répéter dans CHARACTER LOCK |
|---|---|
| **Kaï** (héros) | Jeune homme noir, cheveux courts bouclés (côtés rasés dégradé), sweat à capuche **violet**, casque noir **autour du cou**, pantalon de jogging noir, baskets blanches. Sac à dos gris (pages 1, 3 case 1, 5 à 12 ; tombé sur la route dès la page 7 case 5). À la maison : t-shirt gris foncé, sans sweat, sans sac. **États physiques** : intact (pages 1 à 7 case 4) → lèvre qui saigne, manche droite déchirée, poussière (à partir de la page 7 case 5) → en plus jointures de la main droite en sang (à partir de la page 11 case 4). |
| **L'étudiant** | Jeune homme à lunettes rondes, cheveux courts, chemise claire à manches courtes (de plus en plus poussiéreuse), pantalon gris, cahier **bleu** à la main (pages 6 à 12). |
| **La vendeuse de mangues** | Femme souriante, pagne coloré (orange et vert), foulard assorti, étal de mangues (pages 5 et 12) ; son étal reste renversé après la page 6. |
| **Le passant** | Homme à barbe courte, chemise **verte**, petit **bonnet blanc**, caché derrière l'étal de mangues renversé (page 9 case 4). |
| **Mory** | Adolescent à grosse coupe afro, lunettes cyan qui brillent, veste bleu nuit à liserés cyan lumineux, baskets noires et cyan (page 12 case 5 seulement ; antenne bricolée et chronomètre). |
| **L'Oubli** (méchant) | Silhouette encapuchonnée immense, yeux blancs sans pupilles, contour violet lumineux, tentacules d'ombre, pixels violets qui se détachent. À la condensation : noyau de verre violet translucide. **Règle : une fois condensé, il devient solide et lourd, donc il tombe.** |

### Décors

| Décor | Pages | Description / inventaire |
|---|---|---|
| **La chambre** | 3 et 4 | Chambre d'étudiant : lit, bureau, ordinateur, cahier, ventilateur au plafond, réveil, fenêtre sur Kaloum ; 2 h 47 → 3 h 12 ; lumière bleue (écran), puis violette (l'Oubli), puis seulement les lumières de la ville. |
| **La corniche** | 1 et 2 | Corniche de Conakry : mer, pirogues, rambarde, route, lampadaires, palmiers ; coucher de soleil doré qui baisse ; page 2 : lampadaires allumés et panneau publicitaire numérique sur le trottoir. |
| **Le marché de Madina** | 5 à 12 | 7 h 40, plein soleil, ombres nettes : étal de mangues (renversé dès la page 6), étal de tissus wax (intact tout le chapitre), boutiques aux enseignes (vides à partir de la page 5 case 3), motos-taxis, foule, **pilier en béton** à droite (fissuré page 7 case 5, caisses bleues et vertes à son pied), **grand panneau** au-dessus du carrefour (déchiré dès la page 6, vide), immeuble d'angle, moto rouge renversée près du carrefour (page 11). |
| **Le toit** | 12 | Toit-terrasse au réservoir d'eau, au-dessus des boutiques de droite, qui domine la rue du marché, 7 h 41. |

> Tous les détails (heures, lumières, continuité case par case) sont dans `docs/scenario-ch01-v2.md`.
> Pour un nouveau chapitre, copier ce modèle : un tableau personnages, un tableau décors, et une bible de
> continuité à jour **avant** de lancer Gemini.
