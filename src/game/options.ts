import type { IconName } from '../components/icons'
import type { Bet, Difficulty, GameSettings, Trap } from './types'

export const MIN_PLAYERS = 4 // la maquette dit « 4 to 6 players »
export const MAX_PLAYERS = 6
export const PLAYER_NAME_MAX_LENGTH = 20

// Les 6 icônes de la fenêtre « Add a player », dans l'ordre de la maquette
export const PLAYER_ICONS: { name: IconName; label: string }[] = [
  { name: 'chili', label: 'Chili' },
  { name: 'skull', label: 'Skull' },
  { name: 'spiral', label: 'Spiral' },
  { name: 'flame', label: 'Flame' },
  { name: 'burst', label: 'Burst' },
  { name: 'bottle', label: 'Bottle' },
]

// Les choix des réglages (flèches gauche / droite)
export const TIMER_OPTIONS = [15, 20, 30, 45, 60]
export const DIFFICULTY_OPTIONS = [1, 2, 3] as const
export const DIFFICULTY_LABELS: Record<Difficulty, string> = { 1: 'Easy', 2: 'Medium', 3: 'Hard' }
export const BOARD_OPTIONS = [30, 45, 60]

export const DEFAULT_SETTINGS: GameSettings = { timerSeconds: 30, difficulty: 2, boardSize: 30 }

// Les 4 niveaux de pari = les 4 sauces, de la plus douce à la plus forte (jauge « Bet V2 »)
export const BETS: { value: Bet; name: string }[] = [
  { value: 1, name: 'Mild' },
  { value: 2, name: 'Spicy' },
  { value: 3, name: 'Burning' },
  { value: 4, name: 'Hell' },
]

export function betName(bet: Bet) {
  return BETS[bet - 1].name
}

export const TRAP_NAMES: Record<Trap, string> = {
  substitution: 'Substitution',
  double: 'Double or Nothing',
  forced: 'Forced Bet',
}
