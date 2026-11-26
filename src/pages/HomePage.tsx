import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useProfile } from '../account/profileContext'
import { ButtonLink } from '../components/Button'
import IconButton from '../components/IconButton'
import Screen from '../components/Screen'
import UiIcon from '../components/UiIcon'
import { readableError } from '../lib/errors'
import { listGames, type GameRow } from '../lib/games'
import styles from './HomePage.module.css'

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })

// Accueil (maquette « user page V2 »)
function HomePage() {
  const profile = useProfile()
  const [games, setGames] = useState<GameRow[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    listGames()
      .then(setGames)
      .catch((caught: unknown) => setError(readableError(caught)))
  }, [])

  return (
    <Screen
      footer={
        <ButtonLink to="/new" icon={<UiIcon name="skull" />}>
          New game
        </ButtonLink>
      }
    >
      <header className={styles.header}>
        <div>
          <p>Hey {profile.name}</p>
          <h1>Ready to play ?</h1>
        </div>
        <IconButton to="/profile" label="My profile">
          <UiIcon name="user" />
        </IconButton>
      </header>

      <section className={styles.games} aria-labelledby="last-games">
        <div className={styles.row}>
          <h2 id="last-games" className={styles.sectionTitle}>
            Your last games
          </h2>
          {games && <p>{games.length} played</p>}
        </div>

        {!games && !error && <p>Loading your games…</p>}
        {error && <p role="alert">{error}</p>}

        {games?.length === 0 && (
          <div className={styles.empty}>
            <h3>No games yet</h3>
            <p>Tap “New game” to light the first one.</p>
          </div>
        )}

        {/* Version simple en attendant les cartes de partie de la maquette (étape du tour de jeu) */}
        {games && games.length > 0 && (
          <ul className={styles.list}>
            {games.map((game) => (
              <li key={game.id}>
                <Link to={`/game/${game.id}`} className={styles.game}>
                  <span>{dateFormat.format(new Date(game.created_at))}</span>
                  <span>{game.status === 'playing' ? 'In progress' : 'Finished'}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Screen>
  )
}

export default HomePage
