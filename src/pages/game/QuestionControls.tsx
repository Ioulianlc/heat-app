import { useEffect, useState, type CSSProperties } from 'react'
import LineIcon from '../../components/LineIcon'
import { canSpeak, speak } from '../../lib/speech'
import styles from './QuestionControls.module.css'

type QuestionControlsProps = {
  textToRead: string
  seconds: number // durée du timer (réglage de la partie)
  deadline: number | null // heure de fin du timer, ou null s'il n'est pas lancé
  onStart?: () => void // absent : timer verrouillé (réponse déjà donnée)
}

// Bouton « lire à voix haute » + timer (maquette « question V2 »)
function QuestionControls({ textToRead, seconds, deadline, onStart }: QuestionControlsProps) {
  const [now, setNow] = useState(() => Date.now())

  // Le timer ne compte pas lui-même : il affiche l'écart avec l'heure de fin.
  // Ainsi il reste juste même si l'écran est mis en arrière-plan.
  useEffect(() => {
    if (deadline === null) return
    const id = window.setInterval(() => setNow(Date.now()), 200)
    return () => window.clearInterval(id)
  }, [deadline])

  let timer
  if (deadline === null) {
    timer = (
      <button type="button" className={styles.start} onClick={onStart} disabled={!onStart}>
        <LineIcon name="timer" />
        Start timer
      </button>
    )
  } else {
    const left = Math.min(seconds, Math.max(0, Math.ceil((deadline - now) / 1000)))
    timer = (
      <div
        className={`${styles.running} ${left <= 5 ? styles.urgent : ''}`}
        role="timer"
        aria-label={`${left} seconds left`}
        style={{ '--progress': `${(left / seconds) * 100}%` } as CSSProperties}
      >
        <LineIcon name="timer" />
        {left} s
      </div>
    )
  }

  return (
    <>
      {canSpeak && (
        <button
          type="button"
          className={styles.speak}
          aria-label="Read the question aloud"
          onClick={() => speak(textToRead)}
        >
          <LineIcon name="sound" size={22} />
        </button>
      )}
      {timer}
    </>
  )
}

export default QuestionControls
