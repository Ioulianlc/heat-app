import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import PageHeader from '../components/PageHeader'
import PlayerBadge from '../components/PlayerBadge'
import Screen from '../components/Screen'
import { DIFFICULTY_LABELS } from '../game/options'
import { readableError } from '../lib/errors'
import { getGame, type Game } from '../lib/games'
import styles from './GamePage.module.css'

// Provisoire : montre la partie enregistrée. Le tour de jeu arrive à l'étape suivante.
function GamePage() {
  const { id } = useParams()
  const [game, setGame] = useState<Game | null | undefined>(undefined) // undefined = en chargement
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    getGame(id)
      .then(setGame)
      .catch((caught: unknown) => setError(readableError(caught)))
  }, [id])

  return (
    <Screen>
      <PageHeader title="Game" backTo="/" />
      {error && <p role="alert">{error}</p>}
      {game === undefined && !error && <p>Loading the game…</p>}
      {game === null && <p>This game doesn't exist.</p>}

      {game && (
        <>
          <ol className={styles.players}>
            {game.state.players.map((player) => (
              <li key={player.id} className={styles.player}>
                <PlayerBadge icon={player.icon} />
                {player.name}
              </li>
            ))}
          </ol>
          <p>
            {game.state.settings.timerSeconds} s per question ·{' '}
            {DIFFICULTY_LABELS[game.state.settings.difficulty]} · {game.state.settings.boardSize}{' '}
            spaces
          </p>
          <p className={styles.note}>The game screen arrives in the next step.</p>
        </>
      )}
    </Screen>
  )
}

export default GamePage
