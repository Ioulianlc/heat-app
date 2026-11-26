import type { Trap } from '../../game/types'
import styles from './TrapFace.module.css'

// Le texte des cartes pièges, repris de la maquette V3 (Forced Bet : même style, texte du PDF)
const TRAP_CARDS: Record<Trap, { title: string; text: string }> = {
  double: { title: 'X2', text: 'Draw a new card, the sauce is now 2x spicier!' },
  substitution: {
    title: 'Substitution',
    text: 'Draw a new card, the person on your right answers for you. You bet!',
  },
  forced: {
    title: 'Forced bet',
    text: 'The asker chooses your bet. Yours is cancelled, then draw a new card!',
  },
}

// La face d'une carte piège : pas de question, seulement l'effet
function TrapFace({ trap }: { trap: Trap }) {
  return (
    <div className={styles.trap}>
      <span className="visually-hidden">Trap card:</span>
      <h2 className={styles.title}>{TRAP_CARDS[trap].title}</h2>
      <p className={styles.text}>{TRAP_CARDS[trap].text}</p>
    </div>
  )
}

export default TrapFace
