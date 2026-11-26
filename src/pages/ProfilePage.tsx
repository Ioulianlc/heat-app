import { Link } from 'react-router'
import { useProfile } from '../account/profileContext'
import PageHeader from '../components/PageHeader'
import Screen from '../components/Screen'
import UiIcon from '../components/UiIcon'
import styles from './ProfilePage.module.css'

// Les 4 tuiles de la maquette. Les valeurs seront calculées à partir des parties jouées.
const stats = ['Games played', 'Wins', 'Right answers', 'Sauces taken']

// Profil (maquette « user profile V2 »)
function ProfilePage() {
  const profile = useProfile()

  return (
    <Screen>
      <PageHeader title="Profile" backTo="/" />

      <section className={styles.section} aria-labelledby="stats-title">
        <h2 id="stats-title" className={styles.sectionTitle}>
          {profile.name}'s stats
        </h2>
        <ul className={styles.tiles}>
          {stats.map((label) => (
            <li key={label} className={styles.tile}>
              <span className={styles.tileLabel}>{label}</span>
              <span className={styles.tileValue}>–</span>
            </li>
          ))}
        </ul>
        <p className={styles.note}>Your stats appear after your first game.</p>
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
    </Screen>
  )
}

export default ProfilePage
