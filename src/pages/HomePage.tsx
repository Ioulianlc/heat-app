import { useEffect, useState } from 'react'
import { useProfile } from '../account/profileContext'
import { ButtonLink } from '../components/Button'
import IconButton from '../components/IconButton'
import Screen from '../components/Screen'
import UiIcon from '../components/UiIcon'
import { readableError } from '../lib/errors'
import { listGames, type Game } from '../lib/games'
import HomeGameCard from './HomeGameCard'
import styles from './HomePage.module.css'

const SHOWN_GAMES = 5 // le paquet de cartes montre les 5 dernières parties

// Accueil (maquette « user page V2 »)
function HomePage() {
  const profile = useProfile()
  const [games, setGames] = useState<Game[] | null>(null)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState<string | null>(null) // la carte dépliée

  // Dans le paquet, la plus récente est devant (en bas), comme dans la maquette
  const shown = games ? games.slice(0, SHOWN_GAMES).reverse() : []
  const frontId = openId ?? shown.at(-1)?.id

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

        {shown.length > 0 && (
          <ul className={styles.stack}>
            {shown.map((game) => (
              <li key={game.id}>
                <HomeGameCard
                  game={game}
                  open={game.id === frontId}
                  onOpen={() => setOpenId(game.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </Screen>
  )
}

export default HomePage
