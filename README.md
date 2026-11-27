# HEAT

HEAT est un jeu de société de quiz pour 4 à 6 joueurs, où chaque mauvaise réponse se paie en sauce piquante. Ce dépôt contient son application web. Elle tient sur un seul téléphone posé au milieu de la table et remplace les cartes questions, le chrono et le tableau des scores.

L'application est en ligne ici : https://heat-app-olive.vercel.app. Elle est en anglais, comme les cartes du jeu.

## D'où vient le projet

On a imaginé HEAT à quatre, pour un projet d'équipe à My Digital School Paris : Thomas Pereira, Julie Rodrigues, Julian Pierrelee et moi, Ioulian Le Corre. C'est un serious game de culture numérique, pensé pour les étudiants plus jeunes de l'école.

L'idée de départ : apprendre à juger ce qu'on sait vraiment avant de répondre. Avant chaque question, tu paries sur ta propre connaissance du thème. Plus tu es sûr de toi, plus tu avances si tu as juste, et plus la sauce est forte si tu te trompes.

Le paquet compte 128 questions sur quatre thèmes (réseaux sociaux, intelligence artificielle, culture générale et jeux vidéo), réparties en trois niveaux de difficulté, plus quelques cartes « Very Hot » nettement plus dures.

## Le jeu

### Un tour

1. Le poseur tire une carte et annonce seulement son thème.
2. Le répondant parie de 1 à 4 piments : Mild, Spicy, Burning ou Hell.
3. Le poseur retourne la carte et lit la question avec ses quatre réponses. Le répondant a 30 secondes pour choisir (le chrono se règle de 15 à 60 secondes).
4. Si la réponse est juste, il avance d'une case par piment parié. Si elle est fausse, ou si le temps est écoulé, il reste sur place et prend la sauce de son pari. Il peut la refuser, mais il recule alors d'autant de cases.
5. Le répondant devient le poseur, et le joueur assis à sa gauche répond à son tour.

### Les cartes pièges

À peu près une carte sur dix est un piège. Il apparaît au tirage, avant le pari, et la question vient de la carte suivante.

- X2 : en cas d'erreur, la sauce compte double.
- Substitution : tu paries, mais c'est le joueur à ta droite qui répond. S'il a juste, c'est toi qui avances. S'il se trompe, c'est lui qui prend la sauce.
- Forced : le joueur à ta gauche choisit ton pari.

Huit cartes noires, les « Very Hot », sont aussi cachées dans la pile.

### La fin de partie

Le premier qui atteint ou dépasse la dernière case passe le défi final. Il prend une dose de la sauce la plus forte (ou recule de 4 cases s'il refuse), puis le poseur lui lit cinq questions d'affilée. Il y répond ensuite de mémoire, dans l'ordre. Avec cinq bonnes réponses, il gagne la partie. Sinon, il retente au tour suivant. En cas d'égalité au classement, celui qui a pris le moins de sauces passe devant.

Le jeu est réservé aux adultes. Les sauces sont vraiment fortes, et la page « How to play » de l'application rappelle les précautions à prendre avant de jouer.

## Ce que fait l'application

Tu l'ouvres en scannant le QR code imprimé sur le plateau, sans rien installer. Le premier écran demande juste un prénom, sans e-mail ni mot de passe. Ce compte appartient au joueur qui tient le téléphone, et les autres sont ajoutés comme invités, chacun avec son icône.

Avant la partie, tu règles la durée du chrono, la difficulté des questions et la taille du plateau (30, 45 ou 60 cases). Pendant la partie, l'application gère le tirage, la carte qui se retourne, la jauge de pari, le chrono et le plateau avec la position de chacun. Elle peut aussi lire les questions à voix haute. Si quelqu'un a mal avancé son pion, tu corriges sa case à la main depuis le plateau.

À la fin, un podium s'affiche. Le profil garde l'historique des parties et quelques statistiques : parties jouées, victoires, bonnes réponses, sauces prises. C'est aussi dans le profil que tu passes du thème clair au thème sombre.

L'application marche aussi sans réseau. Une partie commencée continue hors ligne et se synchronise dès que la connexion revient.

## Comment je l'ai construit

Pour coder l'application, je me suis aidé de Claude, l'assistant IA d'Anthropic, dans Claude Code. Au départ, je ne savais pas relier une application React à une base de données. Claude m'a guidé étape par étape : pour chaque étape, il me donnait les consignes, des exemples de code et ce qu'il fallait vérifier.

J'ai suivi ces étapes une par une. J'ai créé la base sur Supabase et lancé les scripts SQL, installé le projet, vérifié chaque étape avant de passer à la suivante, puis mis le site en ligne avec GitHub et Vercel. L'historique des commits suit ce découpage : la base de données, la création de partie, le tour de jeu, les pièges et le défi final, puis le mode hors ligne, et enfin chaque nouvelle version des maquettes.

Les décisions sur le jeu viennent de nous : les règles, les maquettes Figma, les questions et les choix d'interface.

## Le code

### La stack

- React 19 et TypeScript, avec Vite pour le développement et le build
- React Router pour les écrans : `/`, `/profile`, `/how-to-play`, `/new` et `/game/:id`
- Supabase (PostgreSQL) pour les questions, les profils et les parties
- des CSS Modules et des variables CSS pour la charte graphique, sans librairie d'interface
- un service worker écrit à la main pour le mode hors ligne
- Vercel pour l'hébergement, qui redéploie le site à chaque push sur `main`

J'ai choisi une application web plutôt qu'une application mobile pour que les joueurs n'aient rien à installer : ils scannent le QR code et la partie commence. Les questions sont dans Supabase pour pouvoir les corriger ou en ajouter sans redéployer l'application.

### Lancer le projet

Il faut Node 24 et un projet Supabase.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Dans `.env.local`, mets l'adresse du projet Supabase et sa clé publique (`sb_publishable_...`). La clé secrète et le mot de passe de la base ne vont jamais dans l'application, puisque tout ce qui commence par `VITE_` est visible dans le navigateur.

`npm run build` prépare la version publiée dans `dist/`. `npm run preview` l'ouvre en local, et c'est le seul moyen de tester le mode hors ligne sur ton ordinateur. `npm run lint` lance oxlint.

### L'organisation

```
src/
  pages/        un fichier par écran ; pages/game/ pour la partie en cours
  components/   les éléments réutilisés : boutons, fenêtres, podium, interrupteurs
  game/         les règles, sans affichage : paquet, tours, classement, statistiques
  lib/          Supabase, copies locales, préférences, voix, sons, thème
  styles/       tokens.css (la charte) et base.css
pwa/sw.js       le modèle du service worker
```

### Quelques choix techniques

L'application n'enregistre pas la position des joueurs, seulement la liste des tours joués. `standings()` dans `game/rules.ts` les rejoue dans l'ordre pour retrouver les cases et les sauces de chacun. Les statistiques du profil (`game/stats.ts`) et les corrections faites sur le plateau passent par le même calcul, donc les chiffres ne peuvent pas se contredire.

Le hasard part d'une graine. L'ordre des réponses et la place des pièges se calculent à partir de l'identifiant de la partie (`game/deck.ts`). Après un rechargement, la même carte revient, avec les réponses dans le même ordre. Il fallait les mélanger : dans notre fichier de questions, la bonne réponse était B dans 40 % des cas.

Le chrono garde une heure de fin au lieu de compter les secondes. Il reste juste même quand le téléphone met l'onglet en pause.

Un tour suit les étapes `draw`, `bet`, `reveal`, `question` puis `result` (le type `Phase` dans `GamePage.tsx`). Comme l'écran ne connaît qu'une étape à la fois, personne ne peut répondre avant d'avoir parié.

Pour le mode hors ligne, les questions, le profil et les parties sont copiés dans le `localStorage`. Une partie modifiée sans réseau est marquée, puis envoyée à Supabase quand la connexion revient. Le service worker est généré au build par un petit plugin dans `vite.config.ts`, qui lui donne la liste des fichiers à garder sur le téléphone.

Les composants n'utilisent que des couleurs nommées par leur rôle (`--text`, `--surface`, `--button`), et `tokens.css` donne à chacune une valeur claire et une valeur sombre. Un petit script dans `index.html` applique le thème sombre avant le premier affichage, sinon l'écran clignoterait en clair au démarrage.

Pour l'accessibilité, j'ai gardé de vrais éléments HTML sous le design. Les fenêtres sont des `<dialog>`, les icônes de joueurs des boutons radio, les interrupteurs des cases à cocher avec `role="switch"`. Le clavier et les lecteurs d'écran fonctionnent ainsi sans code en plus. Les animations se coupent quand le téléphone demande moins de mouvement.

### La base de données

Supabase contient trois tables. `cards` garde les questions : thème, difficulté de 1 à 4, quatre réponses et la bonne. L'application ne peut que les lire. `profiles` garde le prénom de chaque compte : il se crée une fois et ne se modifie plus. `games` garde une partie par ligne, avec tout son état dans une colonne `jsonb`.

Les comptes utilisent la connexion anonyme de Supabase, et des règles RLS limitent chaque compte à ses propres parties. Les scripts SQL qui créent ces tables sont gardés à part, hors de ce dépôt.

### Les limites connues

Le compte est lié au navigateur du téléphone : vider ses données de navigation ou changer de téléphone le fait perdre. Quelqu'un qui inspecte le site peut lire les bonnes réponses, ce qui reste acceptable pour un seul téléphone partagé autour de la table. Enfin, le projet Supabase gratuit se met en pause après environ une semaine sans activité, il faut donc l'ouvrir avant une démo.
