import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import Awards from '../components/Awards'
import PlayerBadge from '../components/PlayerBadge'
import Podium from '../components/Podium'
import { standings } from '../game/rules'
import type { Game } from '../lib/games'
import styles from './HomeGameCard.module.css'

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })

// Durée de jeu jusqu'ici : de la création au dernier enregistrement (« 20 minutes » sur la maquette V3)
function playingTime(game: Game) {
  const minutes = Math.max(
    1,
    Math.round((Date.parse(game.updated_at) - Date.parse(game.created_at)) / 60000),
  )
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''}`
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')}`
}

type HomeGameCardProps = {
  game: Game
  open: boolean // la carte de devant, dépliée
  onOpen: () => void
}

// Une carte du paquet « Your last games » (maquette « user page V2 »).
// Partie finie : couleur du gagnant. Partie en cours : rouge.
function HomeGameCard({ game, open, onOpen }: HomeGameCardProps) {
  const { state } = game
  const ranking = standings(state)
  const winner = state.players.find((player) => player.id === state.winnerId)
  const title = winner ? `${winner.name} won` : 'Go back to the game'
  const color = winner ? ({ '--card': `var(--player-${winner.icon})` } as CSSProperties) : undefined
  // Texte foncé sur les couleurs claires (tout sauf la spirale, presque noire)
  const ink = winner && winner.icon !== 'spiral' ? styles.darkInk : ''
  const players = `${state.players.length} players`

  return (
    <article className={`${styles.card} ${ink} ${open ? styles.open : ''}`} style={color}>
      <div className={styles.head}>
        <div className={styles.titles}>
          <h3 className={styles.title}>
            {/* Toute la carte est cliquable (le lien ou le bouton s'étend dessus en CSS) */}
            {open ? (
              <Link to={`/game/${game.id}`} className={styles.stretch}>
                {title}
              </Link>
            ) : (
              <button
                type="button"
                className={styles.stretch}
                aria-expanded={false}
                onClick={onOpen}
              >
                {title}
              </button>
            )}
          </h3>
          {winner && (
            <span className={styles.small}>{dateFormat.format(new Date(game.created_at))}</span>
          )}
        </div>
        <span className={styles.small}>{winner ? players : playingTime(game)}</span>
      </div>

      {open && (
        <>
          {/* Partie en cours : les pions des joueurs et leur nombre (maquette V3) */}
          {!winner && (
            <div className={styles.players}>
              <ul className={styles.badges} aria-label="Players">
                {state.players.map((player) => (
                  <li key={player.id} title={player.name}>
                    <PlayerBadge icon={player.icon} size={21} />
                  </li>
                ))}
              </ul>
              <span className={styles.small}>{players}</span>
            </div>
          )}
          {state.turns.length > 0 ? (
            <>
              <Podium players={ranking.map((standing) => standing.player)} />
              <Awards ranking={ranking} />
            </>
          ) : (
            <p className={styles.small}>No round played yet.</p>
          )}
        </>
      )}
    </article>
  )
}

export default HomeGameCard
