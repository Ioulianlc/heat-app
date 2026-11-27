import { trapCard } from '../../game/trapCards'
import type { Trap } from '../../game/types'
import styles from './TrapFace.module.css'

type TrapFaceProps = {
  trap: Trap
  answerer: string // le prénom du joueur du tour (carte Forced)
}

// La face d'une carte piège : pas de question, seulement l'effet
function TrapFace({ trap, answerer }: TrapFaceProps) {
  const { title, text } = trapCard(trap, answerer)
  return (
    <div className={styles.trap}>
      <span className="visually-hidden">Trap card:</span>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.text}>{text}</p>
    </div>
  )
}

export default TrapFace
