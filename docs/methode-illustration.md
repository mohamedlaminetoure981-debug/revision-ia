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

## 5. Fiche des personnages et décors du chapitre 1

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
