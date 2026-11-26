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

// Ce qu'on range dans la colonne `state` de la table games.
// Le tour de jeu ajoutera ses propres informations (positions, tours joués…).
export type GameState = {
  version: 1
  settings: GameSettings
  players: Player[] // dans l'ordre où ils sont assis, en tournant vers la gauche
}
