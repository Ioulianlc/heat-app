import type { Player } from '../game/types'
import styles from './Podium.module.css'

type PodiumProps = {
  players: Player[] // le 1er, le 2e, le 3e
}

// Le podium de la maquette « user page V2 ».
// Dans le code, l'ordre reste 1-2-3 (lu ainsi par les lecteurs d'écran) ;
// à l'écran, la propriété CSS order place le 2e à gauche et le 3e à droite.
function Podium({ players }: PodiumProps) {
  const places = [styles.first, styles.second, styles.third]
  return (
    <ol className={styles.podium} aria-label="Podium">
      {players.slice(0, 3).map((player, index) => (
        <li key={player.id} className={`${styles.place} ${places[index]}`}>
          <span className={styles.name}>{player.name}</span>
          <span className={styles.block}>{index + 1}</span>
        </li>
      ))}
    </ol>
  )
}

export default Podium
