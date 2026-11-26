import { answeredBy, standings } from './rules'
import type { GameState } from './types'

export type PlayerStats = {
  played: number // parties commencées (au moins un tour joué)
  wins: number
  right: number // bonnes réponses
  answered: number // questions auxquelles il a répondu
  sauces: number // doses de sauce prises
}

// Les statistiques d'un joueur sur toutes ses parties (page Profil).
// Comme le classement, elles se recalculent à partir des tours : rien de plus à enregistrer.
export function statsFor(games: GameState[], playerId: string): PlayerStats {
  const stats: PlayerStats = { played: 0, wins: 0, right: 0, answered: 0, sauces: 0 }
  for (const state of games) {
    const plays = state.players.some((player) => player.id === playerId)
    if (!plays || state.turns.length === 0) continue
    stats.played += 1
    if (state.winnerId === playerId) stats.wins += 1
    const row = standings(state).find((standing) => standing.player.id === playerId)
    stats.right += row?.right ?? 0
    stats.sauces += row?.sauces ?? 0
    stats.answered += state.turns.filter(
      (turn) => turn.kind === 'question' && answeredBy(turn) === playerId,
    ).length
  }
  return stats
}
