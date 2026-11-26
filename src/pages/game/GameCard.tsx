import { useEffect, useState, type ReactNode } from 'react'
import type { Letter } from '../../game/types'
import { answerText } from '../../lib/cards'
import type { Card } from '../../types/card'
import styles from './GameCard.module.css'

export const FLIP_MS = 600 // durée du retournement (la même valeur est dans le CSS)

type GameCardProps = {
  card: Card
  order: Letter[] // l'ordre d'affichage des 4 réponses
  flipped: boolean // false : dos (le thème) · true : face
  onFlip?: () => void // présent : toucher le dos retourne la carte
  trap?: ReactNode // carte piège : la face montre l'effet, pas de question
  heading?: string // remplace la question (défi final : « Question 3 »)
  controls?: ReactNode // lecture à voix haute + barre du timer, en bas de la face
  picked: Letter | null // la réponse choisie
  onPick?: (letter: Letter) => void // absent : réponses verrouillées
  showAnswer: boolean // après la réponse : la bonne est mise en évidence
}

// Une carte à deux faces (maquettes V3). Les deux faces sont empilées ; le retournement est
// une rotation 3D en CSS. Une fois la carte retournée, le dos s'efface : la carte prend la
// hauteur de la face (plus courte) et les réponses apparaissent dessous.
function GameCard(props: GameCardProps) {
  const { card, order, flipped, onFlip, trap, heading, controls, picked, onPick, showAnswer } =
    props
  // « posée » : retournement terminé (ou carte affichée déjà retournée)
  const [settled, setSettled] = useState(flipped)
  const isHot = card.difficulty === 4 && !trap // Very Hot : la carte noire aux flammes
  const showAnswers = flipped && settled && !trap

  // Fin du retournement : une minuterie de la durée de l'animation. Plus fiable que l'événement
  // transitionend, qui n'arrive jamais si l'animation ne se joue pas (onglet en arrière-plan…).
  useEffect(() => {
    if (!flipped || settled) return
    const timeout = window.setTimeout(() => setSettled(true), FLIP_MS)
    return () => window.clearTimeout(timeout)
  }, [flipped, settled])

  const back = <span className={styles.theme}>{card.theme}</span>
  const question = heading ?? card.question

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.card} ${flipped ? styles.flipped : ''} ${settled ? styles.settled : ''} ${isHot ? styles.hot : ''}`}
      >
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
          <div
            className={`${styles.face} ${styles.front} ${trap ? styles.trapFront : ''}`}
            inert={!flipped}
          >
            {trap ?? (
              <>
                <p
                  className={`${styles.question} ${!heading && question.length > 60 ? styles.long : ''}`}
                >
                  {question}
                </p>
                {controls && <div className={styles.controls}>{controls}</div>}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Les réponses, sous la carte (maquette « iphone 17 - 9 ») */}
      {showAnswers && (
        <ol className={styles.answers}>
          {order.map((letter, index) => {
            let state = ''
            if (showAnswer && letter === card.correct) state = styles.right
            else if (showAnswer && letter === picked) state = styles.wrong
            else if (letter === picked) state = styles.picked
            return (
              <li key={letter} style={{ animationDelay: `${index * 60}ms` }}>
                <button
                  type="button"
                  className={`${styles.answer} ${state}`}
                  aria-pressed={letter === picked}
                  disabled={!onPick}
                  onClick={() => onPick?.(letter)}
                >
                  <span>{index + 1}</span>
                  <span>{answerText(card, letter)}</span>
                  {showAnswer && letter === card.correct && (
                    <span aria-label="right answer">✓</span>
                  )}
                </button>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

export default GameCard
