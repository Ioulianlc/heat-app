import { Button } from '../../components/Button'
import Modal from '../../components/Modal'
import { FINAL_SAUCE } from '../../game/rules'
import type { FinalTurn, Player } from '../../game/types'
import { answerText } from '../../lib/cards'
import type { Card } from '../../types/card'
import styles from './FinalResultDialog.module.css'

type FinalResultDialogProps = {
  player: Player
  turn: FinalTurn
  cards: Card[] // les cartes du défi, dans l'ordre
  onClose: () => void
}

// Le résultat du défi final : victoire, échec (on retente au prochain tour) ou sauce refusée
function FinalResultDialog({ player, turn, cards, onClose }: FinalResultDialogProps) {
  const rightCount = cards.filter((card, index) => turn.picked[index] === card.correct).length

  let title = 'So close !'
  let message = `${player.name} got ${rightCount} of ${cards.length} right and stays on the finish line. Try again next turn!`
  if (turn.declined) {
    title = 'Cooled down'
    message = `${player.name} declined the sauce and moves back ${FINAL_SAUCE} spaces.`
  } else if (turn.won) {
    title = 'Champion !'
    message = `${player.name} beat the final challenge and wins the game!`
  }

  return (
    <Modal labelledBy="final-title" onClose={onClose} tone="maroon">
      <div className={styles.body}>
        <h2 id="final-title" className={`${styles.title} ${turn.won ? styles.won : ''}`}>
          {title}
        </h2>
        <p>{message}</p>

        {!turn.declined && (
          <ol className={styles.answers}>
            {cards.map((card, index) => {
              const right = turn.picked[index] === card.correct
              return (
                <li key={index} className={right ? styles.right : styles.wrong}>
                  <span className={styles.mark} aria-hidden="true">
                    {right ? '✓' : '✗'}
                  </span>
                  <span className="visually-hidden">{right ? 'Right:' : 'Wrong:'}</span>
                  <span>
                    {card.question}
                    <strong className={styles.correct}>{answerText(card, card.correct)}</strong>
                  </span>
                </li>
              )
            })}
          </ol>
        )}

        <Button variant="primary" onClick={onClose}>
          {turn.won ? 'See the podium' : 'Next round'}
        </Button>
      </div>
    </Modal>
  )
}

export default FinalResultDialog
