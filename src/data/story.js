// =====================================================================
// story.js — LE MODE HISTOIRE (contenu FIXE, aucun appel à l'IA)
// ---------------------------------------------------------------------
// Saison 1 : "La Jeunesse de 2026 contre l'Oubli".
// 12 chapitres courts. Chaque chapitre = 2 planches de 4 cases,
// dessinées par le même moteur que le "cours en manga" (ui/manga.js).
//
// Une case : { character, expression, line, narration?, sfx? }
//   character  : kai, mory, nia, sora, ren, awa, tidiane, binta
//   expression : neutre, joie, reflexion, celebration, encouragement,
//                surprise, concentration, clin
//   {prenom}   : remplacé par le prénom de l'élève
//   narration  : 34 caractères max · sfx : 12 caractères max
//
// 👉 Pour modifier l'histoire : change simplement les textes ci-dessous.
// 👉 Les seuils de déblocage sont dans core/story.js (CHAPTER_POINTS).
// =====================================================================

const c = (character, expression, line, narration = '', sfx = '') => ({ character, expression, line, narration, sfx });

export const STORY_TITLE = 'Saison 1 — La Jeunesse contre l’Oubli';

export const CHAPTERS = [
  {
    id: 1, emoji: '🌌', title: 'Réveil au QG',
    teaser: 'Kaï se réveille dans un monde de néons…',
    strips: [
      { title: 'Ch. 1 — Réveil au QG', panels: [
        c('kai', 'surprise', 'Hein ?! Où je suis ? Pourquoi tout est violet et néon ?!', 'Quelque part dans un téléphone…', '?!'),
        c('kai', 'reflexion', 'Un message sur le mur : « Kaï, tu es le guide. Réunis l’équipe. — Le Créateur »'),
        c('kai', 'concentration', 'Le Créateur ? Message écrit à 3 h 12 du matin… Il dort jamais, ce type ?'),
        c('kai', 'joie', 'Bon. Une équipe, une mission. Et moi, j’ai jamais raté une mission !', '', 'YOSH!'),
      ] },
      { title: 'Ch. 1 — L’ombre', panels: [
        c('kai', 'surprise', 'Attends… les murs s’effacent ? Des formules disparaissent !', 'Soudain…', 'FSHHH'),
        c('kai', 'concentration', 'Une ombre qui mange les leçons pas révisées… c’est donc ça, « l’Oubli ».'),
        c('kai', 'encouragement', 'Seul, je tiendrai pas. Il me faut un geek, une poète, une rapide, une coach…'),
        c('kai', 'clin', 'Et toi, {prenom}. Chaque fois que tu révises, tu nous rends plus forts. Deal ?'),
      ] },
    ],
  },
  {
    id: 2, emoji: '📡', title: 'Le geek à 1 % de batterie',
    teaser: 'Quelqu’un télécharge tout le savoir du monde… en 3G.',
    strips: [
      { title: 'Ch. 2 — Mory', panels: [
        c('mory', 'concentration', 'Encore 3 Mo… allez… cette connexion ne m’arrêtera pas !', 'Salle des serveurs', 'BIP BIP'),
        c('kai', 'surprise', 'Euh… salut ? Tu télécharges quoi, là ?'),
        c('mory', 'joie', 'TOUT. Chaque cours, chaque formule. Je veux scanner tout le savoir du monde !'),
        c('kai', 'clin', 'Avec deux barres de réseau ? T’es courageux, toi.'),
      ] },
      { title: 'Ch. 2 — Sauvegarde', panels: [
        c('mory', 'surprise', 'Mes fichiers ! Il efface mes données !', 'L’Oubli attaque !', 'CRAC!'),
        c('kai', 'concentration', 'Mory ! Un cours retenu dans ta tête, l’Oubli ne peut pas le supprimer !'),
        c('mory', 'reflexion', '… Une sauvegarde dans le cerveau. Hors ligne. Sans réseau. C’est… génial.'),
        c('mory', 'celebration', 'Je rejoins ton équipe. Mais je garde mon chargeur.', '', 'BIIIP!'),
      ] },
    ],
  },
  {
    id: 3, emoji: '🌙', title: 'La poète des métaphores',
    teaser: 'Une voix douce parle aux livres.',
    strips: [
      { title: 'Ch. 3 — Nia', panels: [
        c('nia', 'reflexion', 'Une dérivée, c’est la vitesse d’une pirogue à un instant précis…', 'Bibliothèque infinie'),
        c('mory', 'surprise', 'Elle parle toute seule aux livres ?'),
        c('nia', 'joie', 'Je traduis les cours en images. Un cours qu’on voit, on ne l’oublie plus.'),
        c('kai', 'joie', 'C’est exactement ce qu’il nous faut. Tu viens avec nous ?'),
      ] },
      { title: 'Ch. 3 — Patience', panels: [
        c('nia', 'encouragement', 'Avant, on disait que mes explications compliquaient tout.'),
        c('kai', 'neutre', 'Et toi, tu en pensais quoi ?'),
        c('nia', 'reflexion', 'Que chacun mérite qu’on lui explique avec patience. Même à 3 h du matin.'),
        c('nia', 'clin', 'Je viens. Mais c’est moi qui écris les résumés.', '', '♪'),
      ] },
    ],
  },
  {
    id: 4, emoji: '⚡', title: 'Sora, 0,3 seconde',
    teaser: 'Un éclair traverse la salle des fiches.',
    strips: [
      { title: 'Ch. 4 — Sora', panels: [
        c('sora', 'celebration', 'Question ! Réponse ! Suivante ! Trop lents, tout le monde !', 'Dans un éclair…', 'ZIP!'),
        c('mory', 'surprise', 'Elle a révisé 200 fiches pendant que je disais bonjour.'),
        c('sora', 'clin', 'Répétition espacée, mon pote. Un peu chaque jour, et le cerveau garde tout.'),
        c('kai', 'reflexion', 'Tu pourrais aider {prenom} à retenir ses fiches ?'),
      ] },
      { title: 'Ch. 4 — Gardienne', panels: [
        c('sora', 'reflexion', 'Ça dépend. {prenom} swipe vite ?'),
        c('nia', 'joie', 'On pourrait dire que tu es la gardienne de la mémoire.'),
        c('sora', 'joie', 'Gardienne de la mémoire… j’aime bien. Ça claque.'),
        c('sora', 'celebration', 'OK, j’en suis ! Mais personne ne me ralentit.', '', 'SWOOSH!'),
      ] },
    ],
  },
  {
    id: 5, emoji: '🔥', title: 'Le rival',
    teaser: 'Dans l’arène des quiz, quelqu’un gagne toujours seul.',
    strips: [
      { title: 'Ch. 5 — Ren', panels: [
        c('ren', 'concentration', 'Encore une équipe de débutants. Vous perdez votre temps.', 'Arène des quiz'),
        c('kai', 'encouragement', 'On cherche des gens forts. T’as l’air fort.'),
        c('ren', 'clin', 'Je suis fort. C’est pour ça que je travaille seul.'),
        c('sora', 'surprise', 'Il vient de faire 10/10 en 40 secondes…', '', '!!'),
      ] },
      { title: 'Ch. 5 — Seul', panels: [
        c('ren', 'neutre', 'Un quiz, c’est un combat. Et dans un combat, on ne compte que sur soi.'),
        c('nia', 'reflexion', 'Même les meilleurs combattants ont un entraîneur, tu sais.'),
        c('ren', 'concentration', 'Tch. Revenez quand vous saurez gagner.'),
        c('kai', 'clin', 'Il reviendra. Les rivaux reviennent toujours.', 'Ren s’en va. Pour l’instant.'),
      ] },
    ],
  },
  {
    id: 6, emoji: '🥋', title: 'Le dojo d’Awa',
    teaser: 'Un coup de sifflet résonne dans le dojo.',
    strips: [
      { title: 'Ch. 6 — Awa', panels: [
        c('awa', 'concentration', 'Exercice 4 ! On pose les étapes ! Pas de résultat sans méthode !', 'Dojo des exercices', 'PRRT!'),
        c('mory', 'surprise', 'Elle a un sifflet. Pourquoi elle a un sifflet ?'),
        c('awa', 'joie', 'Parce qu’ici, on s’entraîne pour de vrai. Bienvenue au dojo !'),
        c('kai', 'joie', 'Awa, on monte une équipe. Il nous faut une coach.'),
      ] },
      { title: 'Ch. 6 — Rivalité', panels: [
        c('ren', 'clin', 'Une coach ? Pour quoi faire ? J’ai jamais eu besoin de méthode.', 'Une voix derrière eux…'),
        c('awa', 'concentration', 'Ren. Toujours aussi rapide… et toujours sans justifier tes réponses.'),
        c('ren', 'surprise', 'Je trouve la bonne réponse, c’est tout ce qui compte !', '', 'GRR'),
        c('awa', 'clin', 'À l’exam, une réponse sans méthode, ça vaut zéro. On en reparlera.', '', 'PRRT!'),
      ] },
    ],
  },
  {
    id: 7, emoji: '🌑', title: 'L’Oubli attaque',
    teaser: 'Minuit. Les fiches s’effacent une à une.',
    strips: [
      { title: 'Ch. 7 — Alerte', panels: [
        c('kai', 'surprise', 'L’Oubli est revenu ! Il efface les fiches de {prenom} !', 'Minuit. Alerte au QG.', 'VRRMM'),
        c('sora', 'concentration', 'Des fiches pas révisées depuis des jours… il se nourrit de ça !'),
        c('mory', 'surprise', 'Il attaque le chapitre que {prenom} n’a jamais vraiment compris !'),
        c('tidiane', 'neutre', 'Ne courez pas. Regardez d’abord l’erreur.', 'Une voix calme…'),
      ] },
      { title: 'Ch. 7 — Tidiane', panels: [
        c('tidiane', 'reflexion', 'L’Oubli adore les erreurs qu’on ignore. Il déteste celles qu’on comprend.'),
        c('awa', 'surprise', 'Toi… tu es qui ?'),
        c('tidiane', 'neutre', 'Tidiane. Je lis les messages d’erreur. Ceux que tout le monde ferme sans lire.'),
        c('tidiane', 'clin', 'Une erreur expliquée devient une leçon. Et l’Oubli recule.', '', 'SHHH…'),
      ] },
    ],
  },
  {
    id: 8, emoji: '🍵', title: 'Le passé de Tidiane',
    teaser: 'Avant d’avoir un nom, Tidiane était… un bug.',
    strips: [
      { title: 'Ch. 8 — Avant', panels: [
        c('tidiane', 'reflexion', 'J’étais un message d’erreur. Le tout premier de l’appli.', 'Il y a longtemps…'),
        c('nia', 'surprise', 'Un… message d’erreur ?'),
        c('tidiane', 'reflexion', 'Le Créateur testait à 3 h du matin. Il me fermait sans me lire. Cent fois.'),
        c('mory', 'surprise', 'Classique. Moi aussi je ferme les erreurs sans les lire…', '', 'GLOUPS'),
      ] },
      { title: 'Ch. 8 — Un nom', panels: [
        c('tidiane', 'neutre', 'Alors j’ai appris à parler doucement. À expliquer, au lieu de crier ERREUR.'),
        c('tidiane', 'joie', 'Un soir, il m’a enfin lu. Il a souri, corrigé le bug… et m’a donné un nom.'),
        c('kai', 'encouragement', 'Depuis, tu aides tout le monde à comprendre ses erreurs.'),
        c('tidiane', 'clin', 'Se tromper n’est pas grave. Ne pas chercher pourquoi, ça l’est.'),
      ] },
    ],
  },
  {
    id: 9, emoji: '💾', title: 'La passion de Mory',
    teaser: 'Sur le toit du QG, Mory avoue pourquoi il scanne tout.',
    strips: [
      { title: 'Ch. 9 — Le toit', panels: [
        c('mory', 'concentration', 'Tu sais pourquoi je veux tout scanner, Kaï ?', 'Toit du QG, 2 h du matin'),
        c('kai', 'reflexion', 'Parce que t’es un geek obsédé ?'),
        c('mory', 'reflexion', 'Aussi. Mais surtout parce que plein d’élèves n’ont ni livres ni bonne connexion.'),
        c('mory', 'encouragement', 'Si le savoir tient dans un téléphone, hors ligne, personne n’est laissé derrière.'),
      ] },
      { title: 'Ch. 9 — Pour tous', panels: [
        c('kai', 'surprise', '… Mory, c’était beau. Je vais pleurer.', '', 'SNIF'),
        c('mory', 'clin', 'Garde tes larmes. La page met déjà 40 secondes à charger.'),
        c('nia', 'joie', 'C’est pour ça que le Créateur a fait une appli légère. Pour la Guinée, pour tous.'),
        c('mory', 'celebration', 'Un jour, tout le pays révisera avec nous. Même en 3G !', '', 'BIP!'),
      ] },
    ],
  },
  {
    id: 10, emoji: '🤝', title: 'La chute de Ren',
    teaser: 'Le plus fort de l’arène vient de perdre.',
    strips: [
      { title: 'Ch. 10 — 3/10', panels: [
        c('ren', 'surprise', 'Impossible… 3/10 ? Moi ?!', 'Arène des quiz', 'CRAAC'),
        c('ren', 'concentration', 'L’Oubli m’a piégé… J’ai jamais pris le temps de réviser à fond.'),
        c('awa', 'encouragement', 'Relève-toi, Ren. La vitesse sans méthode, ça finit toujours comme ça.', 'Une main tendue'),
        c('ren', 'reflexion', 'Pourquoi tu m’aides ? Je me moque de ton sifflet depuis des mois.'),
      ] },
      { title: 'Ch. 10 — Rivaux', panels: [
        c('awa', 'clin', 'Parce qu’un rival te pousse à devenir meilleur. J’ai besoin de toi.'),
        c('ren', 'surprise', '… T’as besoin de moi ?'),
        c('awa', 'concentration', 'Exercice 1. On pose les étapes. Ensemble.', '', 'PRRT!'),
        c('ren', 'joie', 'Tch. OK, je rejoins l’équipe. Mais je reste le plus fort aux quiz.', 'Plus tard…'),
      ] },
    ],
  },
  {
    id: 11, emoji: '🎉', title: 'Binta et le retour de l’ombre',
    teaser: 'Des confettis… puis le ciel s’assombrit.',
    strips: [
      { title: 'Ch. 11 — Binta', panels: [
        c('binta', 'celebration', 'OUAIIIS ! 7 jours de série ! Confettis pour TOUT le monde !', 'QG, soirée stats', 'PAF!'),
        c('sora', 'surprise', 'Elle compte tout. Les XP, les badges, les jours… même mes swipes.'),
        c('binta', 'clin', 'Gardienne des stats. Et reine de la hype, évidemment.'),
        c('kai', 'joie', 'Bienvenue, Binta. Cette fois, l’équipe est au complet.'),
      ] },
      { title: 'Ch. 11 — Il revient', panels: [
        c('tidiane', 'surprise', 'Il revient. Plus fort. Il a mangé toutes les fiches oubliées.', 'Le ciel s’assombrit…'),
        c('ren', 'concentration', 'Enfin. Un adversaire digne de moi.'),
        c('binta', 'encouragement', '{prenom}, on a besoin de toi pour la bataille finale !'),
        c('kai', 'concentration', 'Chaque révision compte. Prépare-toi : on se bat ensemble.', '', 'DOOM'),
      ] },
    ],
  },
  {
    id: 12, emoji: '👑', title: 'Bataille finale',
    teaser: 'Toute l’équipe… et toi. Contre l’Oubli.',
    strips: [
      { title: 'Ch. 12 — Bataille finale', panels: [
        c('kai', 'celebration', 'Tous ensemble ! Les pouvoirs, MAINTENANT !', 'Bataille finale !', 'GOOO!'),
        c('awa', 'concentration', 'Méthode d’Awa ! Mémoire de Sora ! Métaphores de Nia ! Scan de Mory !', '', 'WHOOSH'),
        c('ren', 'celebration', 'Et la force de {prenom}… COUP DE RÉVISION ULTIME !', 'Le coup final', 'BAAAM!'),
        c('binta', 'celebration', 'ON A GAGNÉ ! Je savais que ça finirait en confettis !', 'L’Oubli disparaît…', 'K.O.!'),
      ] },
      { title: 'Ch. 12 — Le message', panels: [
        c('kai', 'reflexion', 'Le mur s’allume : un message du Créateur, MLT.', 'Un dernier message…'),
        c('nia', 'joie', '« Merci de réviser avec eux. Je les ai créés pour que personne ne révise seul. »'),
        c('mory', 'clin', '« PS : c’est pas parce que je code à 3 h du matin que vous devez réviser à 3 h. »'),
        c('kai', 'clin', 'Flemmard de 3 h du matin… mais génie quand même. On continue, {prenom} ?', '', 'FIN?'),
      ] },
    ],
  },
];
