# Scénario actuel du Mode Histoire (BD) — Saison 1 « La Jeunesse contre l’Oubli »

> Document de référence avant réécriture. Il décrit l’état du code au 6 octobre 2026
> (version 1.18.0). **Rien n’a été modifié dans l’appli** : c’est un simple relevé.
>
> Conventions : « Kaï », « Mory »… sont les personnages de l’équipe ; « l’Oubli » est le
> monstre (une ombre qui efface les cours). `[image ✅]` = une illustration existe dans
> `public/story/chapitre-1/` ; `[image ⬜]` = pas d’image, c’est le dessin de l’appli qui
> s’affiche. Les « cartouches » sont les petits encadrés de narration.

## Vue d’ensemble

| Chapitre | Titre | Format actuel | Pages | Cases |
|---|---|---|---|---|
| 1 | 3 h 12 | **BD complète** (Kaï) | 4 | 19 |
| 2 | Le signal | BD complète (Mory) | 3 | 14 |
| 3 | La voix de la bibliothèque | BD complète (Nia) | 3 | 13 |
| 4 | Éclair sur la corniche | BD complète (Sora) | 3 | 14 |
| 5 | Le rival | BD complète (Ren) | 3 | 13 |
| 6 | Le dojo de Kaloum | BD complète (Awa) | 3 | 14 |
| 7 | L’Oubli attaque / « Panne générale » | **Brouillon de BD non branché** (+ version courte de 8 cases) | 3 (brouillon) | 14 (brouillon) |
| 8 à 12 | Le passé de Tidiane · La passion de Mory · La chute de Ren · Binta et le retour de l’ombre · Bataille finale | Version courte seulement (2 planches × 4 cases, textes) | — | 8 chacun |

Seul le chapitre 1 a des illustrations (17 images sur 19 cases). Les chapitres 2 à 6 sont
dessinés par l’appli (décors et personnages en SVG).

---

# 1. Chapitre 1 — « 3 h 12 » (script complet)

Teaser affiché dans la liste : *« Conakry, veille de la rentrée. Un message arrive à 3 h 12… »*
Fichier : `src/data/comic/chapitres/ch01.js` — 4 pages, 19 cases.
Images : `public/story/chapitre-1/page-P-case-C.jpg`.

### Page 1 — 4 cases · ambiance sonore : la mer · fond entre les cases : blanc

**Page 1 · Case 1** — `page-1-case-1.jpg` [image ✅]
- **Description** : plan large d’ambiance, la corniche au coucher du soleil. Kaï, petite silhouette à contre-jour, marche seul sur la promenade.
- **Cartouche (haut)** : « Conakry. Septembre 2026. »
- **Cartouche (bas, narration de Kaï)** : « La veille de la rentrée. Le soleil se couche sur la corniche… et sur mes vacances. »

**Page 1 · Case 2** — `page-1-case-2.jpg` [image ✅]
- **Description** : gros plan, Kaï pensif, le visage tourné vers la mer, éclairé par le soleil couchant.
- **Bulles** : aucune.

**Page 1 · Case 3** — `page-1-case-3.jpg` [image ✅]
- **Description** : plan poitrine, Kaï devant la mer et les pirogues, mains dans les poches. Il pense à la rentrée.
- **Bulle de pensée — Kaï** : « Licence 2 d’info. Encore une année à faire semblant d’être prêt. »

**Page 1 · Case 4** — `page-1-case-4.jpg` [image ✅]
- **Description** : un taxi jaune fonce vers le lecteur, phares allumés ; Kaï (silhouette) saute de côté, flou de mouvement. Humour. Son : « boss ».
- **Onomatopée** : « TUUUT ! »
- **Bulle de cri — le chauffeur de taxi (hors champ)** : « Hé, petit ! On dort debout ?! »
- **Bulle — Kaï** : « Pardon, tonton ! »

### Page 2 — 5 cases · ambiance : nuit · fond entre les cases : noir

**Page 2 · Case 1** — `page-2-case-1.jpg` [image ✅]
- **Description** : chambre d’étudiant, 3 h 12. Seule la lumière bleue de l’ordinateur éclaire Kaï, au bureau, qui n’arrive pas à dormir.
- **Cartouche** : « 3 h 12. »
- **Bulle de pensée — Kaï** : « Je dors pas. Je dors jamais avant une rentrée. »

**Page 2 · Case 2** — `page-2-case-2.jpg` [image ⬜ : écran dessiné par l’appli]
- **Description** : très gros plan sur l’écran du téléphone qui vibre : un message du « Créateur ». Heure affichée : 03:12.
- **Message à l’écran — LE CRÉATEUR** : « Kaï. Tu es le guide. Réunis-les avant que l’Oubli n’efface tout. »
- **Onomatopée** : « BZZZT »

**Page 2 · Case 3** — `page-2-case-3.jpg` [image ✅]
- **Description** : très gros plan sur les yeux de Kaï, écarquillés. Lignes de concentration bleues.
- **Bulle de murmure — Kaï** : « …Comment il connaît mon nom ? »

**Page 2 · Case 4** — `page-2-case-4.jpg` [image ✅]
- **Description** : plan large sur la ville la nuit : une immense ombre (l’Oubli) se dresse au-dessus de Kaloum ; les lumières s’éteignent. Son : « boss ».
- **Cartouche** : « Au même moment, au-dessus de Kaloum, les lumières s’éteignent une à une. »

**Page 2 · Case 5** — `page-2-case-5.jpg` [image ✅]
- **Description** : Kaï, de dos, face à la fenêtre ; une lueur violette entre dans la chambre.
- **Bulle de murmure — Kaï** : « C’est quoi… ce truc ? »

### Page 3 — 5 cases · ambiance : ville · fond entre les cases : blanc

**Page 3 · Case 1** — `page-3-case-1.jpg` [image ✅]
- **Description** : marché de Madina, le matin : une vendeuse, désemparée, a oublié tous ses prix.
- **Cartouche** : « Le lendemain. Marché de Madina. »
- **Bulle — la vendeuse** : « Mes prix… je me souviens plus d’aucun prix ! »

**Page 3 · Case 2** — `page-3-case-2.jpg` [image ✅]
- **Description** : plan poitrine, Kaï, sidéré, voit les enseignes de la rue se vider de leurs lettres (effet glitch).
- **Bulle — Kaï** : « Les panneaux… ils se vident ?! »

**Page 3 · Case 3** — `page-3-case-3.jpg` [image ✅]
- **Description** : grande case d’action : l’Oubli surgit et attaque un étudiant ; Kaï plonge pour le pousser (silhouette, flou de vitesse). Son : « hit ».
- **Onomatopée** : « WHOOOM »
- **Bulle de cri — Kaï** : « BOUGE !! »
- **Bulle de cri — l’étudiant** : « MON CAHIER ! Tout est effacé ! »

**Page 3 · Case 4** — `page-3-case-4.jpg` [image ✅]
- **Description** : impact : éclair blanc, Kaï (silhouette) projeté en l’air par le choc. Son : « hit ».
- **Onomatopée** : « BAM ! »
- **Bulles** : aucune.

**Page 3 · Case 5** — `page-3-case-5.jpg` [image ✅]
- **Description** : contre-plongée : l’Oubli domine Kaï ; gros plan de Kaï éclairé en violet, terrifié.
- **Bulle de murmure (violette) — l’Oubli** : « …Savoir… non révisé… À MOI… »

### Page 4 — 5 cases · ambiance : ville · fond entre les cases : noir

**Page 4 · Case 1** — `page-4-case-1.jpg` [image ⬜ : écran dessiné par l’appli]
- **Description** : l’écran du téléphone s’allume par terre. Heure affichée : 08:47. Son : « sparkle ».
- **Message à l’écran — RÉVISION IA** : « Révise une notion. Une seule. Maintenant. »

**Page 4 · Case 2** — `page-4-case-2.jpg` [image ✅]
- **Description** : très gros plan sur le regard de Kaï qui se durcit : il se souvient de sa leçon de la veille.
- **Bulle de pensée 1 — Kaï** : « Hier soir… les suites. »
- **Bulle de pensée 2 — Kaï** : « u(n+1) = q × u(n). JE M’EN SOUVIENS ! »

**Page 4 · Case 3** — `page-4-case-3.jpg` [image ✅]
- **Description** : LE COUP : le poing de Kaï, entouré d’aura violette, jaillit au premier plan vers le lecteur ; l’Oubli recule au fond. Son : « hit ».
- **Onomatopée** : « KRAAAK ! »
- **Bulles** : aucune.

**Page 4 · Case 4** — `page-4-case-4.jpg` [image ✅]
- **Description** : l’Oubli se désagrège en pixels et s’enfuit ; Kaï, de dos, essoufflé, le regarde partir. Son : « sparkle ».
- **Bulle — Kaï** : « Il… recule ? Il fuit ?! »

**Page 4 · Case 5** — `page-4-case-5.jpg` [image ✅]
- **Description** : cliffhanger : sur un toit, une silhouette (Mory) observait la scène, les bras croisés ; ses lunettes brillent.
- **Bulle de murmure — Mory** : « Un deuxième… enfin. »
- **Cartouche** : « À suivre… »

*Remarque : dans le code, `page-2-case-2` et `page-4-case-1` n’ont pas d’image parce que ce
sont des écrans de téléphone (dessinés par l’appli, pas par une illustration).*

---

# 2. Chapitres 2 à 6 — titres et résumés

## Chapitre 2 — « Le signal » (Mory) · 3 pages, 14 cases
*Teaser : « Un geek de Kaloum traque l’Oubli avec une antenne bricolée. »*

**Personnages** : Kaï, Mory, l’Oubli, un prof (voix hors champ), deux étudiants (figurants).
**Lieux** : une salle de classe de l’Université de Conakry (jour) ; le toit de Mory, à Kaloum (nuit) ; un écran de carte des attaques.

Premier cours à l’université : le prof parle des graphes, et Kaï s’étonne que personne ne parle de la veille (l’ombre, les panneaux vides). Mory, assis plus loin, l’interpelle : « le gars de Madina » qui a frappé l’Oubli à mains nues. Il traque le monstre depuis un mois sur une carte : l’Oubli frappe là où personne ne révise. Le soir, Mory emmène Kaï sur son toit : son antenne bricolée capte les pics d’énergie de l’Oubli (deux barres de réseau, 40 secondes de chargement, « son entraînement mental »). L’Oubli apparaît. Mory analyse : point faible à l’épaule gauche, certitude 87 %. Kaï lui fait confiance et frappe là où Mory dit ; l’Oubli se désagrège. Mory : « Je suis pas un combattant. Je suis le gars qui sait OÙ frapper. » Fin sur un nouveau pic d’énergie : l’Oubli prépare un gros coup, demain, « là où on garde les livres » (→ chapitre 3).

## Chapitre 3 — « La voix de la bibliothèque » (Nia) · 3 pages, 13 cases
*Teaser : « Un matin de pluie, une voix explique les cours avec des images. »*

**Personnages** : Nia, Kaï, Mory, l’Oubli, étudiants (figurants), puis Sora en tout dernier plan.
**Lieux** : la bibliothèque sous la pluie (9 h 58) ; la corniche à l’aube (dernière case).

Il pleut. À la bibliothèque, Nia explique une dérivée avec l’image d’une pirogue (« la vitesse à un instant précis, pas sur tout le trajet : MAINTENANT ») et une étudiante s’écrie qu’elle a enfin compris. Mory (dont l’antenne s’affole quand Nia parle) et Kaï l’observent : « c’est la seule qui explique bien ». À 10 h 00, l’Oubli arrive et efface les pages des livres une à une. Nia garde son calme (« Respirez. ») et lance : « L’Oubli, c’est une marée : il n’emporte que ce qui n’est pas ancré. ANCREZ-VOUS ! » Kaï et Mory l’affrontent (BAM). Plus tard, Nia confie qu’on disait d’elle qu’elle compliquait tout ; Kaï lui répond qu’elle rend les choses simples et l’invite dans l’équipe. Elle accepte à une condition : c’est elle qui écrit les résumés. Dernière case : le lendemain, 5 h 40, sur la corniche, un éclair passe (→ Sora).

## Chapitre 4 — « Éclair sur la corniche » (Sora) · 3 pages, 14 cases
*Teaser : « 5 h 40, sur la corniche : quelqu’un court plus vite que l’Oubli. »*

**Personnages** : Kaï, Mory, Nia, Sora, l’Oubli, passants et une étudiante (figurants), Ren (dernière case).
**Lieux** : la corniche (aube, puis jour) ; une salle de classe / amphi (dernière case).

Entraînement d’équipe à 5 h 40, idée de Kaï ; Mory est à bout de souffle. Sora déboule en criant « Trop lents ! » : elle fait 10 km avant les cours et révise 200 fiches dans le taxi, « un peu chaque jour : le cerveau garde tout ». L’Oubli surgit et vise une étudiante, de l’autre côté de la corniche, hors de portée de Kaï. Sora fonce, esquive en suivant un rythme (« Gauche ! Droite ! Gauche ! C’est un rythme, comme mes fiches ») et, sur le cri de Mory « MAINTENANT ! Ensemble ! », l’équipe frappe d’un seul coup (BADABOOM). Nia nomme Sora « la gardienne de la mémoire » ; Sora : « Ça claque. J’en suis ! » Dernière case : un panneau « TOURNOI DE QUIZ — Champion invaincu : REN » (→ chapitre 5).

## Chapitre 5 — « Le rival » (Ren) · 3 pages, 13 cases
*Teaser : « Dans l’arène des quiz, quelqu’un gagne toujours seul. »*

**Personnages** : Ren, Kaï, Nia, l’Oubli, public (figurants).
**Lieux** : l’amphi B, arène du tournoi de quiz ; un toit la nuit (dernière case).

Finale du tournoi de quiz à l’amphi B : Ren gagne encore (« Encore une victoire. Suivant. »). Kaï l’invite à rejoindre l’équipe ; Ren refuse : il est fort PARCE QU’il travaille seul. Kaï le défie en duel (« si je gagne, tu nous écoutes »). Ren gagne 10 à 7 (« Rentre chez toi, le guide »). Le public s’enfuit quand l’Oubli apparaît ; un écran affiche ERREUR et Ren, seul face au monstre, crie « J’ai PAS besoin d’aide ! » (SKRATCH). Nia rappelle que même les meilleurs combattants ont un entraîneur ; Ren lâche : « Tch. Revenez quand vous saurez gagner. » Dernière case : la nuit, seul sur un toit, Ren pense : « C’est rien. Ça va partir. Personne ne doit savoir. » (un secret, une marque — repris au chapitre 6).

## Chapitre 6 — « Le dojo de Kaloum » (Awa) · 3 pages, 14 cases
*Teaser : « Un coup de sifflet, une cour, des tapis usés. Et un combat. »*

**Personnages** : Awa, Kaï, Mory, Ren, étudiants (figurants).
**Lieux** : une cour de Kaloum transformée en dojo (fin d’après-midi, puis nuit) ; un toit la nuit (dernière case, ville dans le noir).

Dans une cour de Kaloum, Awa dirige un dojo d’exercices au sifflet (« Exercice 4 ! On pose les étapes ! »). Mory s’étonne du sifflet ; Awa : « ici, on s’entraîne pour de vrai ». Kaï lui propose d’être la coach de l’équipe. Ren, présent, se moque (« j’ai jamais eu besoin de méthode »). Awa lui reproche de ne jamais justifier ses réponses ; combat d’entraînement en trois touches (SWISH, TAC !) puis Awa conclut : « À l’exam, une réponse sans méthode vaut zéro. » Ren, vexé, murmure « … Tch. » ; Awa remarque une marque sur son bras. Elle accepte d’entraîner l’équipe : « Demain, 6 h. Retard = 20 pompes. » (Mory : « 6 h ?! »). Dernière case : 21 h 07, toute la ville de Conakry plonge dans le noir (→ chapitre 7).

---

# 3. Chapitres 7 à 12 — ce qui existe dans le code

Il n’existe **pas de plan écrit séparé** (pas de fichier « plan »). Les chapitres 7 à 12 existent
sous deux formes :

1. **Version courte** dans `src/data/story.js` : titre, teaser et 2 planches de 4 cases
   (personnage, expression, une réplique, parfois une narration et une onomatopée).
   C’est ce qui s’affiche aujourd’hui pour les chapitres 7 à 12 (images = dessin de l’appli).
2. **Brouillon de BD du chapitre 7** : `src/data/comic/brouillons/ch07.js` (3 pages, 14 cases).
   Ce fichier n’est **pas branché** : l’appli ne charge que `src/data/comic/chapitres/ch*.js`.
   Pour l’activer, il suffirait de le déplacer dans `chapitres/` (mais il n’a pas de descriptions
   de cases ni de repères d’illustration).

## Chapitre 7 — « L’Oubli attaque » (version courte) / « Panne générale » (brouillon BD)
*Teaser : « Minuit. Les fiches s’effacent une à une. »*
**Personnages** : Kaï, Sora, Mory, Awa, Tidiane (première apparition), Nia, l’Oubli (plusieurs).
**Lieux** : Conakry dans le noir sous la pluie ; le QG.

- *Version courte* : alerte au QG à minuit, l’Oubli efface les fiches de l’élève (« {prenom} »),
  il se nourrit des fiches pas révisées. Tidiane arrive, calme : « Ne courez pas. Regardez d’abord l’erreur. »
  Il se présente (« Je lis les messages d’erreur, ceux que tout le monde ferme sans lire ») :
  une erreur expliquée devient une leçon, et l’Oubli recule.
- *Brouillon BD* : la ville dans le noir, des Oublis partout qui se multiplient ; Sora et Mory
  paniquent, Awa constate que frapper ne sert à rien (« on frappe, ils reviennent ! »).
  Tidiane intervient, affiche un message système (« ERREUR : 12 notions ignorées. Voir les détails ? »)
  et montre l’erreur d’un étudiant (« dérivée et primitive confondues ») : comprendre l’erreur
  fait reculer l’Oubli. Dans la dernière page, il guide Kaï (« Vise l’erreur au centre ») ;
  Kaï frappe, les lumières de la ville se rallument. Fin : Tidiane murmure qu’il connaît cet
  Oubli, qu’il l’a déjà vu « il y a longtemps ».

## Chapitre 8 — « Le passé de Tidiane »
*Teaser : « Avant d’avoir un nom, Tidiane était… un bug. »* — Personnages : Tidiane, Nia, Mory, Kaï.
Tidiane raconte son origine : il était le tout premier message d’erreur de l’appli. Le Créateur
testait à 3 h du matin et le fermait sans le lire, cent fois. Il a appris à parler doucement,
à expliquer au lieu de crier « ERREUR ». Un soir, le Créateur l’a lu, a souri, corrigé le bug
et lui a donné un nom. Morale : « Se tromper n’est pas grave. Ne pas chercher pourquoi, ça l’est. »

## Chapitre 9 — « La passion de Mory »
*Teaser : « Sur le toit du QG, Mory avoue pourquoi il scanne tout. »* — Personnages : Mory, Kaï, Nia. Lieu : toit du QG, 2 h du matin.
Mory explique pourquoi il veut tout scanner : beaucoup d’élèves n’ont ni livres ni bonne connexion ;
si le savoir tient dans un téléphone, hors ligne, personne n’est laissé derrière. Kaï est ému,
Mory plaisante sur la page qui met 40 secondes à charger, Nia rappelle que le Créateur a fait
une appli légère pour la Guinée. Mory rêve que tout le pays révise avec eux, « même en 3G ».

## Chapitre 10 — « La chute de Ren »
*Teaser : « Le plus fort de l’arène vient de perdre. »* — Personnages : Ren, Awa. Lieu : l’arène des quiz.
Ren obtient 3/10 : l’Oubli l’a piégé, il n’a jamais révisé à fond. Awa lui tend la main
(« la vitesse sans méthode, ça finit toujours comme ça ») ; Ren s’étonne qu’elle l’aide malgré
ses moqueries sur le sifflet. Awa : « un rival te pousse à devenir meilleur, j’ai besoin de toi. »
Exercice 1, on pose les étapes ensemble. Ren rejoint l’équipe, mais reste « le plus fort aux quiz ».

## Chapitre 11 — « Binta et le retour de l’ombre »
*Teaser : « Des confettis… puis le ciel s’assombrit. »* — Personnages : Binta (première apparition), Sora, Kaï, Tidiane, Ren. Lieu : le QG, soirée stats.
Binta fête 7 jours de série avec des confettis ; elle compte tout (XP, badges, jours, même les swipes
de Sora) : « gardienne des stats, reine de la hype ». Kaï : « l’équipe est au complet ». Puis le ciel
s’assombrit : l’Oubli revient, plus fort, après avoir mangé toutes les fiches oubliées. Ren se réjouit
d’un adversaire digne de lui ; Binta et Kaï appellent l’élève (« {prenom} ») pour la bataille finale.

## Chapitre 12 — « Bataille finale »
*Teaser : « Toute l’équipe… et toi. Contre l’Oubli. »* — Personnages : toute l’équipe (Kaï, Awa, Sora, Nia, Mory, Ren, Binta, Tidiane).
Tous ensemble, chacun utilise son pouvoir (méthode d’Awa, mémoire de Sora, métaphores de Nia, scan de Mory),
puis « la force de {prenom} » donne le coup de révision ultime et l’Oubli disparaît. Le mur s’allume :
un dernier message du Créateur (MLT) : « Merci de réviser avec eux. Je les ai créés pour que personne
ne révise seul. » avec un PS drôle sur le fait de coder à 3 h du matin. Kaï conclut en demandant si
l’élève continue (« FIN ? »).

## Points d’attention (cohérence) avant de réécrire
- Les textes courts de `story.js` pour les chapitres 1 à 6 sont l’**ancienne version** : ils ne
  s’affichent plus, car la BD les remplace. Ils diffèrent de la BD (ex. chapitre 1 : en BD, Kaï se
  réveille chez lui à 3 h 12 ; dans le texte court, il est « dans un téléphone »).
- La BD (chapitres 5 et 6) installe un **secret de Ren** (une marque sur le bras, « personne ne doit
  savoir ») que le chapitre 10 court (« L’Oubli m’a piégé ») ne reprend pas.
- Le chapitre 6 BD se termine par une **panne de courant à 21 h 07** ; le chapitre 7 court commence
  à **minuit** : les deux versions ne se raccordent pas exactement.
- **Tidiane et Binta** apparaissent seulement dans les chapitres 7 et 11 ; le chapitre 3 BD montre
  Sora en dernière case avant sa vraie présentation au chapitre 4, ce qui fonctionne bien comme enchaînement.

---

# 4. Section technique

## Où est stocké quoi

| Quoi | Fichier |
|---|---|
| Un chapitre en BD (pages → cases → bulles, cartouches, onomatopées, décors, personnages, effets, sons) | `src/data/comic/chapitres/chNN.js` (`ch01.js` à `ch06.js`) — chargé tout seul par un `import.meta.glob`, un fichier par chapitre, téléchargé seulement à l’ouverture |
| Liste des chapitres (emoji, titre, teaser) + version courte 2 × 4 cases | `src/data/story.js` (12 entrées) |
| Seuils de points pour débloquer chaque chapitre | `src/core/story.js` → `CHAPTER_POINTS = [0, 3, 6, 10, 15, 20, 26, 33, 40, 48, 57, 67]` (au-delà du 12ᵉ : +10 points par chapitre) |
| Illustrations des cases | `public/story/chapitre-N/page-P-case-C.(webp\|png\|jpg)` (N = chapitre, P = page, C = case dans l’ordre de lecture) |
| Positions de bulles enregistrées avec l’éditeur du Panneau créateur | `public/story/chapitre-N/bulles-chapitre-N.json` (prioritaires sur les positions du fichier `chNN.js`) |
| Dessin des décors, personnages, poses | `src/comic/decors.js`, `ville.js`, `figures.js`, `body.js`, `entities.js` ; `src/data/comic/poses.js`, `looks.js` |
| Mise en page des cases et des bulles | `src/comic/comic.js` (page de 1000 × 1500 unités, marges 26, espace entre cases 16) |
| Lecteur (case par case / page entière) | `src/comic/reader.js` |
| Brouillon du chapitre 7 (non branché) | `src/data/comic/brouillons/ch07.js` |
| Traductions anglaises de la BD | `src/i18n/contenu/en/bd.json` (par chapitre `ch01`, `ch02`…), `histoire.json` pour `story.js` |

**Structure d’un chapitre** : `{ id, title, pages: [ { gutter, ambient, rows: [{ h, cols, tilt, ctilt }], panels: [ { action, bg, chars, fx, bubbles, captions, sfx, sound, illus } ] } ] }`.
Le nombre de cases d’une page = la somme des colonnes de ses rangées (`rows[].cols`). Le détail
du format est expliqué en tête de `ch01.js` et dans le README (sections 8 et 10 septies).

## Combien de pages et de cases l’appli peut-elle afficher ?

- **Il n’y a aucune limite codée** : le lecteur lit `chapter.pages.length` et `page.panels.length`,
  sans plafond. Une seule page est dessinée à la fois (fluide sur petit Android) et la page suivante
  est préchargée.
- **Limite pratique, côté mise en page** : une page fait 1000 × 1500 unités, découpée en rangées de
  cases. Toutes les pages actuelles ont **4 ou 5 cases** (3 rangées) ; au-delà de ~6 cases par page,
  les cases deviennent trop petites pour les bulles (une bulle ne couvre jamais plus de 25 % de la case).
- **Aujourd’hui** : 3 à 4 pages et 13 à 19 cases par chapitre (le plus long est le chapitre 1 : 19 cases).
- **Pas de reprise de lecture** : si l’élève quitte en cours de chapitre, il recommence à la page 1
  (seul le mode « case par case / page entière » est mémorisé). Le chapitre est marqué « lu » à la
  fin et donne un seul gain d’XP, quelle que soit sa longueur.

## Que faudrait-il changer pour un chapitre de 50 à 60 cases ?

Avec 5 cases par page, 50 à 60 cases = **10 à 12 pages** (12 à 15 pages si on reste à 4 cases).

**Rien à changer dans le moteur** pour que cela s’affiche. Ce qui change, c’est le travail autour :

1. **Écrire le chapitre** : un fichier `chNN.js` de 10 à 12 pages. Un chapitre actuel pèse 7 à 9 Ko
   (20 Ko pour le chapitre 1, qui a les repères d’illustration) ; un chapitre de 55 cases pèserait
   environ 60 Ko (estimation) : acceptable, car il n’est téléchargé qu’à l’ouverture.
2. **Les illustrations** : 50 à 60 images à produire par chapitre, nommées `page-P-case-C`.
   Le chapitre 1 pèse 12 Mo de sources pour 17 images, et **4,2 Mo une fois optimisé** (3 largeurs
   WebP par image, environ 250 Ko par case). Un chapitre de 55 cases publié ≈ **13 à 14 Mo**
   (estimation). Les images ne sont pas préchargées pour le hors-ligne : elles se mettent en cache
   une fois vues. Sur une connexion lente, prévoir un chapitre long = un téléchargement important
   (la page suivante seulement est préchargée, donc ça passe, mais c’est à garder en tête).
   Le build optimise toutes les images avec `sharp` : le temps de build augmentera.
3. **Découpage possible** (facultatif) : si un fichier de 1 000+ lignes devient pénible à éditer,
   on peut le scinder (ex. `ch07a.js`, `ch07b.js`) — cela demanderait une petite modification de
   `src/data/comic/index.js` pour les assembler ; ce n’est pas obligatoire.
4. **Progression** : ajouter une **reprise de lecture** (mémoriser la page en cours) serait
   recommandé pour un chapitre de 10 à 12 pages ; il faudrait aussi réfléchir à l’XP (un seul gain
   par chapitre aujourd’hui) et à la durée de lecture par rapport aux seuils de `CHAPTER_POINTS`.
5. **Traductions** : `src/i18n/contenu/en/bd.json` est rangé **par position** (page n° X, case n° Y).
   Dès qu’un chapitre est réécrit, ses traductions ne correspondent plus : il faudra supprimer le
   chapitre concerné de `bd.json` (et de `histoire.json` si le texte court change), puis relancer
   `npm run traduire -- en bd` (le script ne traduit que ce qui manque).
6. **Outils** : le Panneau créateur → « 🖼️ Illustrations des cases » liste automatiquement toutes les
   cases (✅/⬜) et `npm run verifier-bulles -- N` contrôle les bulles du chapitre N ; ils fonctionneront
   sans modification, mais la liste sera longue (55 lignes par chapitre).
7. **Brancher / débrancher** : un chapitre BD existe dès que `chNN.js` est dans `chapitres/`. Le
   texte court de `story.js` reste obligatoire pour le titre, l’emoji et le teaser dans la liste.
