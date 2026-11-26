import type { ReactNode } from 'react'
import type { Letter } from '../../game/types'
import { answerText } from '../../lib/cards'
import type { Card } from '../../types/card'
import styles from './GameCard.module.css'

type GameCardProps = {
  card: Card
  order: Letter[] // l'ordre d'affichage des 4 réponses
  flipped: boolean // false : dos (le thème) · true : face (la question)
  onFlip?: () => void // présent : toucher le dos retourne la carte
  picked: Letter | null // la réponse choisie par le poseur
  onPick?: (letter: Letter) => void // absent : réponses verrouillées
  showAnswer: boolean // après la réponse : la bonne est mise en évidence
  controls?: ReactNode // lecture à voix haute + timer, en bas de la face
}

// Une carte à deux faces (maquettes « Question card - Back / Variante2 »).
// Les deux faces sont empilées ; le retournement est une rotation 3D en CSS.
function GameCard({ card, order, flipped, onFlip, picked, onPick, showAnswer, controls }: GameCardProps) {
  const answers = order.map((letter) => ({ letter, text: answerText(card, letter) }))
  // Réponses courtes : 2 colonnes comme la maquette ; longues : une par ligne
  const isShort = answers.every((answer) => answer.text.length <= 14)

  const back = <span className={styles.theme}>{card.theme}</span>

  return (
    <div className={`${styles.card} ${flipped ? styles.flipped : ''}`}>
      <div className={styles.inner}>
        {onFlip ? (
          <button
            type="button"
            className={`${styles.face} ${styles.back} ${styles.tappable}`}
            onClick={onFlip}
            aria-label={`${card.theme}. Tap to reveal the question`}
            inert={flipped}
          >
            {back}
          </button>
        ) : (
          <div className={`${styles.face} ${styles.back}`} inert={flipped}>
            {back}
          </div>
        )}

        {/* inert : face cachée = ni cliquable, ni lue par les lecteurs d'écran */}
        <div className={`${styles.face} ${styles.front}`} inert={!flipped}>
          <p className={`${styles.question} ${card.question.length > 50 ? styles.long : ''}`}>
            {card.question}
          </p>
          <ol className={`${styles.answers} ${isShort ? styles.twoColumns : ''}`}>
            {answers.map(({ letter, text }, index) => {
              let state = ''
              if (showAnswer && letter === card.correct) state = styles.right
              else if (showAnswer && letter === picked) state = styles.wrong
              else if (!showAnswer && letter === picked) state = styles.picked
              return (
                <li key={letter}>
                  <button
                    type="button"
                    className={`${styles.answer} ${state}`}
                    aria-pressed={letter === picked}
                    disabled={!onPick}
                    onClick={() => onPick?.(letter)}
                  >
                    <span className={styles.number}>{index + 1}</span>
                    <span>{text}</span>
                  </button>
                </li>
              )
            })}
          </ol>
          {controls && <div className={styles.controls}>{controls}</div>}
        </div>
      </div>
    </div>
  )
}

export default GameCard
