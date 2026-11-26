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

// Les 3 cartes pièges du PDF
export type Trap = 'substitution' | 'double' | 'forced'

// Un tour de question terminé. Positions et sauces se recalculent à partir de la liste des tours.
export type QuestionTurn = {
  kind: 'question'
  answererId: string // le joueur dont c'était le tour : c'est lui qui avance si c'est juste
  askerId: string // sur une Substitution, c'est lui qui répond (et prend la sauce si c'est faux)
  cardId: number
  bet: Bet
  picked: Letter | null // null : aucune réponse avant la fin du timer
  correct: boolean
  trap: Trap | null // le piège révélé pendant ce tour
  declined: boolean // sauce refusée : recul d'une case par piment à la place
}

// Une tentative de défi final : la sauce la plus forte, puis 5 questions d'affilée
export type FinalTurn = {
  kind: 'final'
  answererId: string
  askerId: string
  cardIds: number[]
  picked: (Letter | null)[]
  won: boolean
  declined: boolean // sauce refusée : recul de 4 cases, pas de défi
  bonus: boolean // joué juste après l'arrivée : ne prend pas de tour dans la rotation
}

export type Turn = QuestionTurn | FinalTurn

// Une correction faite sur le plateau (bouton Edit) : tel joueur est posé sur telle case
export type BoardEdit = {
  atTurn: number // nombre de tours déjà joués au moment de la correction
  playerId: string
  space: number
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
  edits: BoardEdit[]
  winnerId: string | null // rempli quand quelqu'un réussit le défi final
}
