import IconButton from '../../components/IconButton'
import LineIcon from '../../components/LineIcon'
import styles from './GameHeader.module.css'

type GameHeaderProps = {
  title: string
  subtitle?: string
  closeLabel: string
  closeTo?: string // le bouton ✕ mène à une adresse…
  onCloseClick?: () => void // …ou déclenche une action
  onBoard?: () => void // présent : bouton « plateau » à droite
}

// En-tête des écrans de jeu : ✕ à gauche, titre au centre, plateau à droite (maquette « game V2 »)
function GameHeader({ title, subtitle, closeLabel, closeTo, onCloseClick, onBoard }: GameHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.row}>
        <IconButton label={closeLabel} to={closeTo} onClick={onCloseClick}>
          <LineIcon name="close" />
        </IconButton>
        <h1 className={styles.title}>{title}</h1>
        {onBoard ? (
          <IconButton label="Board" onClick={onBoard}>
            <LineIcon name="board" />
          </IconButton>
        ) : (
          <span className={styles.spacer} aria-hidden="true" />
        )}
      </div>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </header>
  )
}

export default GameHeader
