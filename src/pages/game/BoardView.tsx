import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '../../components/Button'
import PlayerBadge from '../../components/PlayerBadge'
import Screen from '../../components/Screen'
import { standings } from '../../game/rules'
import type { GameState } from '../../game/types'
import GameHeader from './GameHeader'
import styles from './BoardView.module.css'

type BoardViewProps = {
  state: GameState
  currentId: string // le joueur qui répond en ce moment
  onClose: () => void
  onSave: (changes: { playerId: string; space: number }[]) => void // corrections du bouton Edit
}

// Le plateau (maquette « board V2 ») : où en est chaque joueur.
// Edit : on recale les pions sur le vrai plateau (erreur de comptage, pion renversé…).
function BoardView({ state, currentId, onClose, onSave }: BoardViewProps) {
  const ranking = standings(state)
  const size = state.settings.boardSize
  const cells = Array.from({ length: size }, (_, index) => index + 1)
  // null : simple consultation · sinon : la case de chaque joueur pendant la correction
  const [draft, setDraft] = useState<Map<string, number> | null>(null)

  const saved = new Map(ranking.map((standing) => [standing.player.id, standing.space]))
  const spaceOf = (playerId: string) => draft?.get(playerId) ?? saved.get(playerId) ?? 0
  const label = (space: number) => (space === 0 ? 'Start' : String(space))

  function move(playerId: string, step: number) {
    if (!draft) return
    const next = new Map(draft)
    next.set(playerId, Math.min(size, Math.max(0, spaceOf(playerId) + step)))
    setDraft(next)
  }

  function save() {
    if (!draft) return
    const changes = state.players
      .filter((player) => spaceOf(player.id) !== saved.get(player.id))
      .map((player) => ({ playerId: player.id, space: spaceOf(player.id) }))
    if (changes.length > 0) onSave(changes)
    setDraft(null)
  }

  const footer = draft ? (
    <div className={styles.footer}>
      <Button variant="primary" onClick={save}>
        Save
      </Button>
      <Button onClick={() => setDraft(null)}>Cancel</Button>
    </div>
  ) : (
    <div className={styles.footer}>
      <Button variant="primary" onClick={onClose}>
        Back to game
      </Button>
      <div className={styles.secondary}>
        <button type="button" className={styles.small} onClick={() => setDraft(new Map(saved))}>
          Edit
        </button>
        <Link to="/" className={styles.small}>
          Home
        </Link>
      </div>
    </div>
  )

  return (
    <Screen tight footer={footer}>
      <GameHeader
        title={draft ? 'Edit board' : 'Board'}
        subtitle={draft ? 'Move the pawns to match the real board.' : undefined}
        closeLabel="Back to game"
        onCloseClick={onClose}
      />

      {draft ? (
        <ul className={styles.editList}>
          {state.players.map((player) => (
            <li key={player.id} className={styles.editRow}>
              <PlayerBadge icon={player.icon} size={24} />
              <span className={styles.name}>{player.name}</span>
              <button
                type="button"
                className={styles.step}
                aria-label={`${player.name}: back one space`}
                onClick={() => move(player.id, -1)}
              >
                −
              </button>
              <output className={styles.editSpace} aria-live="polite">
                {label(spaceOf(player.id))}
              </output>
              <button
                type="button"
                className={styles.step}
                aria-label={`${player.name}: forward one space`}
                onClick={() => move(player.id, 1)}
              >
                +
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <ul className={styles.players}>
          {ranking.map(({ player, space }) => (
            <li
              key={player.id}
              className={`${styles.player} ${player.id === currentId ? styles.current : ''}`}
            >
              <PlayerBadge icon={player.icon} size={24} />
              <span className={styles.name}>{player.name}</span>
              <span className={styles.space}>{label(space)}</span>
            </li>
          ))}
        </ul>
      )}

      <ol className={styles.grid} aria-label={`Board of ${size} spaces`}>
        {cells.map((cell) => {
          const here = state.players.filter((player) => spaceOf(player.id) === cell)
          return (
            <li key={cell} className={`${styles.cell} ${cell === size ? styles.finish : ''}`}>
              <span>{String(cell).padStart(2, '0')}</span>
              {here.length > 0 && (
                <span className={styles.pawns}>
                  {here.map((player) => (
                    <PlayerBadge key={player.id} icon={player.icon} size={21} />
                  ))}
                  <span className="visually-hidden">
                    {here.map((player) => player.name).join(', ')}
                  </span>
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </Screen>
  )
}

export default BoardView
