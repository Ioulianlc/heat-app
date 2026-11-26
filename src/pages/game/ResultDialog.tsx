import { Button } from '../../components/Button'
import Modal from '../../components/Modal'
import { betName } from '../../game/options'
import { doses, type Standing } from '../../game/rules'
import type { Player, QuestionTurn } from '../../game/types'
import { answerText } from '../../lib/cards'
import type { Card } from '../../types/card'
import RankingList from './RankingList'
import styles from './ResultDialog.module.css'

type ResultDialogProps = {
  answerer: Player // le joueur dont c'était le tour
  answeredBy: Player // qui a répondu (un autre joueur sur une Substitution)
  turn: QuestionTurn
  card: Card
  timedOut: boolean // fin du timer sans réponse choisie
  reachedFinish: boolean // il vient d'atteindre la ligne d'arrivée : place au défi final
  ranking: Standing[] // le classement après ce tour
  boardSize: number
  onNext: () => void
  onDecline: () => void // refuser la sauce : reculer à la place
  onFinal: () => void // ouvrir l'enveloppe du défi final
}

const spaces = (count: number) => `${count} space${count > 1 ? 's' : ''}`

// Fenêtre de résultat (maquettes « True » et « False »)
function ResultDialog(props: ResultDialogProps) {
  const { answerer, answeredBy, turn, card, timedOut, reachedFinish, ranking, boardSize } = props
  const sauce = betName(turn.bet)
  const backward = turn.bet * doses(turn)
  const substitute =
    answeredBy.id !== answerer.id ? `${answeredBy.name} answered for ${answerer.name}. ` : ''

  // Juste : le joueur du tour avance. Faux : celui qui a répondu prend la sauce (ou la refuse).
  let message = `${substitute}${answerer.name} moves ${spaces(turn.bet)}.`
  if (!turn.correct && turn.declined) {
    message = `${answeredBy.name} declined the sauce and moves back ${spaces(backward)}.`
  } else if (!turn.correct) {
    const twice = doses(turn) > 1 ? ' twice' : ''
    message = `${timedOut ? 'Time’s up! ' : ''}${answeredBy.name} takes the ${sauce} sauce${twice}.`
  }

  const primary = reachedFinish
    ? { label: 'Open the envelope', action: props.onFinal }
    : { label: 'Next round', action: props.onNext }

  return (
    <Modal labelledBy="result-title" onClose={primary.action} tone="maroon">
      <div className={styles.body}>
        <div className={styles.intro}>
          <h2 id="result-title" className={styles.title}>
            {turn.correct ? 'Nice !' : 'Hothead !'}
          </h2>
          <p>
            {message} Correct answer: {answerText(card, card.correct)}
          </p>
          {reachedFinish && (
            <p className={styles.finish}>
              {answerer.name} reached the finish line! Time for the final challenge.
            </p>
          )}
        </div>

        {/* L'encadré « WHY ? » n'apparaît que si l'Excel donne une explication */}
        {card.explanation && (
          <section className={styles.why} aria-labelledby="why-title">
            <h3 id="why-title">Why ?</h3>
            <p>{card.explanation}</p>
          </section>
        )}

        <RankingList ranking={ranking} boardSize={boardSize} />

        <div className={styles.actions}>
          <Button variant="primary" onClick={primary.action}>
            {primary.label}
          </Button>
          {/* Règle du PDF : on peut toujours refuser une sauce et reculer d'une case par piment */}
          {!turn.correct && !turn.declined && (
            <Button onClick={props.onDecline}>Decline the sauce (back {spaces(backward)})</Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default ResultDialog
