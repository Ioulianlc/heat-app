import { useEffect, useState, type CSSProperties } from 'react'
import LineIcon from '../../components/LineIcon'
import { canSpeak, speak } from '../../lib/speech'
import styles from './QuestionControls.module.css'

type QuestionControlsProps = {
  textToRead: string
  seconds: number // durée du timer (réglage de la partie)
  deadline: number | null // heure de fin du timer · null : pas de barre (réponse déjà donnée)
}

// Bouton « lire à voix haute » + barre du timer (maquette V3 « iphone 17 - 9 »)
function QuestionControls({ textToRead, seconds, deadline }: QuestionControlsProps) {
  const [now, setNow] = useState(() => Date.now())

  // La barre ne compte pas elle-même : elle affiche l'écart avec l'heure de fin.
  // Ainsi elle reste juste même si l'écran est mis en arrière-plan.
  useEffect(() => {
    if (deadline === null) return
    const id = window.setInterval(() => setNow(Date.now()), 200)
    return () => window.clearInterval(id)
  }, [deadline])

  const left = deadline === null ? 0 : Math.min(seconds, Math.max(0, (deadline - now) / 1000))
  const shownSeconds = Math.ceil(left)

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
      {deadline !== null && (
        <div
          className={`${styles.track} ${shownSeconds <= 5 ? styles.urgent : ''}`}
          role="timer"
          aria-label={`${shownSeconds} seconds left`}
        >
          <div
            className={styles.fill}
            style={{ '--left': `${(left / seconds) * 100}%` } as CSSProperties}
          />
        </div>
      )}
    </>
  )
}

export default QuestionControls
