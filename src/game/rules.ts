import type { GameState, Player, QuestionTurn } from './types'

export const FINAL_SAUCE = 4 // le défi final commence par la sauce la plus forte (4 piments)
export const FINAL_QUESTIONS = 5

// Le numéro du tour en cours dans la rotation.
// Le défi final joué juste après l'arrivée est un « bonus » : il ne prend pas le tour de quelqu'un.
export function turnNumber(state: GameState) {
  return state.turns.filter((turn) => !(turn.kind === 'final' && turn.bonus)).length
}

// Qui répond et qui pose la question au tour n° turnIndex.
// Le répondant devient le poseur, et le joueur à sa gauche (le suivant de la liste) répond.
export function rolesFor(state: GameState, turnIndex: number) {
  const { players } = state
  const count = players.length
  const first = Math.max(
    0,
    players.findIndex((player) => player.id === state.firstAnswererId),
  )
  const answerer = (first + turnIndex) % count
  return { answerer: players[answerer], asker: players[(answerer - 1 + count) % count] }
}

// Double or Nothing : la sauce est prise deux fois
export function doses(turn: QuestionTurn) {
  return turn.trap === 'double' ? 2 : 1
}

// Qui a vraiment répondu. Substitution : le joueur à droite du répondant (le poseur)
// répond pour lui. Juste : le répondant avance. Faux : c'est le remplaçant qui prend la sauce.
export function answeredBy(turn: QuestionTurn) {
  return turn.trap === 'substitution' ? turn.askerId : turn.answererId
}

export type Standing = {
  player: Player
  space: number // 0 = case départ
  sauces: number // nombre de sauces prises
  right: number // bonnes réponses (hors défi final)
}

// Le classement, recalculé en rejouant les tours dans l'ordre : rien n'est stocké en double.
// On rejoue (au lieu de simplement additionner) parce qu'on ne descend jamais sous la case départ
// et qu'une correction du plateau remplace la position à un moment précis de la partie.
export function standings(state: GameState): Standing[] {
  const size = state.settings.boardSize
  const rows = new Map(
    state.players.map((player) => [player.id, { player, space: 0, sauces: 0, right: 0 }]),
  )
  const clamp = (space: number) => Math.min(size, Math.max(0, space))
  const applyEdits = (atTurn: number) => {
    for (const edit of state.edits) {
      const row = rows.get(edit.playerId)
      if (row && edit.atTurn === atTurn) row.space = clamp(edit.space)
    }
  }

  state.turns.forEach((turn, index) => {
    applyEdits(index)
    const row = rows.get(turn.answererId)
    if (!row) return
    if (turn.kind === 'final') {
      if (turn.declined) row.space = clamp(row.space - FINAL_SAUCE)
      else row.sauces += 1
      return
    }
    const answerer = rows.get(answeredBy(turn)) ?? row
    if (turn.correct) {
      row.space = clamp(row.space + turn.bet)
      answerer.right += 1
    } else if (turn.declined) {
      answerer.space = clamp(answerer.space - turn.bet * doses(turn)) // 1 case par piment
    } else {
      answerer.sauces += doses(turn)
    }
  })
  applyEdits(state.turns.length)

  // Le gagnant d'abord ; puis la case la plus avancée ; à égalité, le moins de sauces (règle du PDF)
  const isWinner = (standing: Standing) => Number(standing.player.id === state.winnerId)
  return [...rows.values()].sort(
    (a, b) => isWinner(b) - isWinner(a) || b.space - a.space || a.sauces - b.sauces,
  )
}

export function spaceOf(state: GameState, playerId: string) {
  return standings(state).find((standing) => standing.player.id === playerId)?.space ?? 0
}

// Les deux distinctions (tuiles « Tête brûlée » de la maquette).
// En cas d'égalité, le mieux classé l'emporte. Personne si le compteur est à zéro.
export function awards(ranking: Standing[]) {
  const best = (value: (standing: Standing) => number) => {
    const top = ranking.reduce<Standing | null>(
      (leader, standing) => (!leader || value(standing) > value(leader) ? standing : leader),
      null,
    )
    return top && value(top) > 0 ? top.player : null
  }
  return {
    hothead: best((standing) => standing.sauces),
    sharpest: best((standing) => standing.right),
  }
}
