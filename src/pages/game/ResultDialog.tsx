import { Button } from '../../components/Button'
import Modal from '../../components/Modal'
import PlayerBadge from '../../components/PlayerBadge'
import { betName } from '../../game/options'
import type { Standing } from '../../game/rules'
import type { Player, Turn } from '../../game/types'
import { answerText } from '../../lib/cards'
import type { Card } from '../../types/card'
import styles from './ResultDialog.module.css'

type ResultDialogProps = {
  answerer: Player
  turn: Turn
  card: Card
  timedOut: boolean // fin du timer sans réponse choisie
  standings: Standing[] // le classement après ce tour
  boardSize: number
  onNext: () => void
}

// Fenêtre de résultat (maquettes « True » et « False »)
function ResultDialog({ answerer, turn, card, timedOut, standings, boardSize, onNext }: ResultDialogProps) {
  const own = standings.find((standing) => standing.player.id === answerer.id)
  const reachedFinish = turn.correct && own !== undefined && own.space >= boardSize

  const message = turn.correct
    ? `${answerer.name} moves ${turn.bet} space${turn.bet > 1 ? 's' : ''}.`
    : `${timedOut ? 'Time’s up! ' : ''}${answerer.name} takes the ${betName(turn.bet)} sauce.`

  return (
    <Modal labelledBy="result-title" onClose={onNext} tone="maroon">
      <div className={styles.body}>
        <div className={styles.intro}>
          <h2 id="result-title" className={styles.title}>
            {turn.correct ? 'Nice !' : 'Hothead !'}
          </h2>
          <p>
            {message} Correct answer: {answerText(card, card.correct)}
          </p>
          {reachedFinish && (
            <p className={styles.finish}>{answerer.name} reached the finish line!</p>
          )}
        </div>

        {/* L'encadré « WHY ? » n'apparaît que si l'Excel donne une explication */}
        {card.explanation && (
          <section className={styles.why} aria-labelledby="why-title">
            <h3 id="why-title">Why ?</h3>
            <p>{card.explanation}</p>
          </section>
        )}

        <ol className={styles.ranking} aria-label="Ranking">
          {standings.map(({ player, space }) => (
            <li key={player.id} className={styles.row}>
              <span className={styles.who}>
                <PlayerBadge icon={player.icon} />
                {player.name}
              </span>
              <span className={styles.space}>{space === 0 ? 'Start' : `Space ${space}`}</span>
            </li>
          ))}
        </ol>

        <Button variant="primary" onClick={onNext}>
          Next round
        </Button>
      </div>
    </Modal>
  )
}

export default ResultDialog
