import Icon from './Icon'
import type { IconName } from './icons'
import styles from './PlayerBadge.module.css'

type PlayerBadgeProps = {
  icon: IconName
  size?: number // diamètre en pixels : 33 sur les tuiles, 45 dans la fenêtre
}

// L'icône d'un joueur, en rouge sur sa couleur (maquette « Add a player »)
function PlayerBadge({ icon, size = 33 }: PlayerBadgeProps) {
  return (
    <span
      className={styles.badge}
      style={{ width: size, height: size, backgroundColor: `var(--player-${icon})` }}
    >
      <Icon name={icon} size={Math.round(size * 0.6)} />
    </span>
  )
}

export default PlayerBadge
