import type { Trap } from '../../game/types'
import styles from './TrapFace.module.css'

// Le texte des cartes pièges, repris de la maquette V4
function trapCard(trap: Trap, answerer: string) {
  if (trap === 'double')
    return { title: 'X2', text: 'Draw a new card, the sauce is now 2x spicier!' }
  if (trap === 'substitution') {
    return {
      title: 'Substitution',
      text: 'Draw a new card, the person on your right answers for you. You bet!',
    }
  }
  return { title: 'Forced', text: `The person to ${answerer}’s left is betting in their place` }
}

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
