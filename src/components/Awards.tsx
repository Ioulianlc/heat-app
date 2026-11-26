import { awards, type Standing } from '../game/rules'
import styles from './Awards.module.css'

type AwardsProps = {
  ranking: Standing[]
}

// Les deux distinctions de la partie (tuiles « Tête brûlée » de la maquette)
function Awards({ ranking }: AwardsProps) {
  const { hothead, sharpest } = awards(ranking)
  const tiles = [
    { label: 'Hothead', hint: 'most sauces', player: hothead },
    { label: 'Sharpest', hint: 'most right answers', player: sharpest },
  ]
  return (
    <ul className={styles.awards}>
      {tiles.map((tile) => (
        <li key={tile.label} className={styles.award}>
          <span className={styles.label}>
            {tile.label} <span className="visually-hidden">({tile.hint})</span>
          </span>
          <span>{tile.player?.name ?? 'Nobody yet'}</span>
        </li>
      ))}
    </ul>
  )
}

export default Awards
