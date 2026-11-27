import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useProfile } from '../account/profileContext'
import PageHeader from '../components/PageHeader'
import Screen from '../components/Screen'
import Switch from '../components/Switch'
import UiIcon from '../components/UiIcon'
import { statsFor, type PlayerStats } from '../game/stats'
import { listGames } from '../lib/games'
import { setPreference, usePreferences, type Preferences } from '../lib/preferences'
import styles from './ProfilePage.module.css'

// Les 3 interrupteurs de la maquette V4, plus le thème (maquette V5)
const PREFERENCES: { key: keyof Preferences; label: string; description: string }[] = [
  {
    key: 'voiceOver',
    label: 'Voice over',
    description: 'Reads each question and its answers aloud when the card is revealed.',
  },
  {
    key: 'soundEffects',
    label: 'Sound effects',
    description: 'Card flips, timer, right and wrong.',
  },
  { key: 'vibrations', label: 'Vibrations', description: 'The phone vibrates on a wrong answer.' },
  {
    key: 'darkMode',
    label: 'Dark mode',
    description: 'A dark background, easier on the eyes in a dim room.',
  },
]

// Profil (maquette V4 « iPhone 17 - 11 ») : statistiques, règles, préférences
function ProfilePage() {
  const profile = useProfile()
  const preferences = usePreferences()
  const [stats, setStats] = useState<PlayerStats | null>(null)
  const [failed, setFailed] = useState(false)

  // Les statistiques se calculent à partir des parties de ce compte (le titulaire = joueur 01)
  useEffect(() => {
    let cancelled = false
    listGames()
      .then((games) => {
        if (!cancelled)
          setStats(
            statsFor(
              games.map((game) => game.state),
              profile.id,
            ),
          )
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [profile.id])

  const tiles = [
    { label: 'Games played', value: stats?.played },
    { label: 'Wins', value: stats?.wins },
    { label: 'Right answers', value: stats && `${stats.right}/${stats.answered}` },
    { label: 'Sauces taken', value: stats?.sauces },
  ]

  return (
    <Screen>
      <PageHeader title="Profile" backTo="/" />

      <section className={styles.section} aria-labelledby="stats-title">
        <h2 id="stats-title" className="visually-hidden">
          {profile.name}'s stats
        </h2>
        <ul className={styles.tiles}>
          {tiles.map(({ label, value }) => (
            <li key={label} className={styles.tile}>
              <span className={styles.tileLabel}>{label}</span>
              <span className={styles.tileValue}>{value ?? '–'}</span>
            </li>
          ))}
        </ul>
        {failed && <p className={styles.note}>Stats unavailable for now.</p>}
        {stats?.played === 0 && (
          <p className={styles.note}>Your stats appear after your first game.</p>
        )}
      </section>

      <section className={styles.section} aria-labelledby="game-title">
        <h2 id="game-title" className={styles.sectionTitle}>
          The game
        </h2>
        <Link to="/how-to-play" className={styles.card}>
          <span>
            <span className={styles.cardTitle}>How to play</span>
            <span>Rules, bet and scoring</span>
          </span>
          <UiIcon name="back" flip />
        </Link>
      </section>

      <section className={styles.section} aria-labelledby="preference-title">
        <h2 id="preference-title" className={styles.sectionTitle}>
          Preference
        </h2>
        <ul className={styles.preferences}>
          {PREFERENCES.map(({ key, label, description }) => (
            <li key={key}>
              <Switch
                label={label}
                description={description}
                checked={preferences[key]}
                onChange={(checked) => setPreference(key, checked)}
              />
            </li>
          ))}
        </ul>
      </section>
    </Screen>
  )
}

export default ProfilePage
