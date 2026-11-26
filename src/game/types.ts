import type { IconName } from '../components/icons'

export type Player = {
  id: string
  name: string
  icon: IconName // une icône différente par joueur
  isOwner: boolean // le titulaire du compte : c'est lui qui a les stats
}

export type Difficulty = 1 | 2 | 3

export type GameSettings = {
  timerSeconds: number
  difficulty: Difficulty
  boardSize: number
}

export type Bet = 1 | 2 | 3 | 4 // nombre de piments = cases gagnées = sauce prise

export type Letter = 'A' | 'B' | 'C' | 'D'

// Un tour terminé. Positions et sauces se recalculent à partir de cette liste.
export type Turn = {
  answererId: string
  askerId: string
  cardId: number
  bet: Bet
  picked: Letter | null // null : aucune réponse avant la fin du timer
  correct: boolean
}

// Ce qu'on range dans la colonne `state` de la table games
export type GameState = {
  version: 1
  settings: GameSettings
  players: Player[] // dans l'ordre où ils sont assis, en tournant vers la gauche
  firstAnswererId: string | null // choisi au début : qui a mangé épicé en dernier
  deck: number[] // identifiants des cartes, dans l'ordre du paquet mélangé
  cursor: number // nombre de cartes déjà tirées
  turns: Turn[]
}
