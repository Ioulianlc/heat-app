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
}

// Le plateau (maquette « board V2 ») : où en est chaque joueur
function BoardView({ state, currentId, onClose }: BoardViewProps) {
  const ranking = standings(state)
  const size = state.settings.boardSize
  const spaces = Array.from({ length: size }, (_, index) => index + 1)

  return (
    <Screen
      tight
      footer={
        <div className={styles.footer}>
          <Button variant="primary" onClick={onClose}>
            Back to game
          </Button>
          <Link to="/" className={styles.home}>
            Home
          </Link>
        </div>
      }
    >
      <GameHeader title="Board" closeLabel="Back to game" onCloseClick={onClose} />

      <ul className={styles.players}>
        {ranking.map(({ player, space }) => (
          <li
            key={player.id}
            className={`${styles.player} ${player.id === currentId ? styles.current : ''}`}
          >
            <PlayerBadge icon={player.icon} size={24} />
            <span className={styles.name}>{player.name}</span>
            <span className={styles.space}>{space === 0 ? 'Start' : space}</span>
          </li>
        ))}
      </ul>

      <ol className={styles.grid} aria-label={`Board of ${size} spaces`}>
        {spaces.map((space) => {
          const here = ranking.filter((standing) => standing.space === space)
          return (
            <li key={space} className={`${styles.cell} ${space === size ? styles.finish : ''}`}>
              <span>{String(space).padStart(2, '0')}</span>
              {here.length > 0 && (
                <span className={styles.pawns}>
                  {here.map(({ player }) => (
                    <PlayerBadge key={player.id} icon={player.icon} size={21} />
                  ))}
                  <span className="visually-hidden">
                    {here.map(({ player }) => player.name).join(', ')}
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
