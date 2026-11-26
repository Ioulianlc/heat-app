import type { GameState, Player } from './types'

// Qui répond et qui pose la question au tour n° turnIndex.
// Le répondant devient le poseur, et le joueur à sa gauche (le suivant de la liste) répond.
export function rolesFor(state: GameState, turnIndex: number) {
  const { players } = state
  const count = players.length
  const first = Math.max(0, players.findIndex((player) => player.id === state.firstAnswererId))
  const answerer = (first + turnIndex) % count
  return { answerer: players[answerer], asker: players[(answerer - 1 + count) % count] }
}

export type Standing = {
  player: Player
  space: number // 0 = case départ
  sauces: number // nombre de sauces prises
}

// Le classement, recalculé à partir des tours joués : rien n'est stocké en double.
// À égalité de case, celui qui a pris le moins de sauces passe devant (règle du PDF).
export function standings(state: GameState): Standing[] {
  return state.players
    .map((player) => {
      const own = state.turns.filter((turn) => turn.answererId === player.id)
      const moved = own.filter((turn) => turn.correct).reduce((sum, turn) => sum + turn.bet, 0)
      return {
        player,
        space: Math.min(moved, state.settings.boardSize),
        sauces: own.filter((turn) => !turn.correct).length,
      }
    })
    .sort((a, b) => b.space - a.space || a.sauces - b.sauces)
}
