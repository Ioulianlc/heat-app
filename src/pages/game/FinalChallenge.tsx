import { useEffect, useState } from 'react'
import { Button } from '../../components/Button'
import Icon from '../../components/Icon'
import LineIcon from '../../components/LineIcon'
import Screen from '../../components/Screen'
import UiIcon from '../../components/UiIcon'
import { answerOrder } from '../../game/deck'
import { FINAL_SAUCE } from '../../game/rules'
import type { Letter, Player } from '../../game/types'
import { answerText } from '../../lib/cards'
import { vibrate } from '../../lib/feedback'
import { getPreferences } from '../../lib/preferences'
import { canSpeak, readAloud, speak, stopSpeaking } from '../../lib/speech'
import type { Card } from '../../types/card'
import GameCard from './GameCard'
import GameHeader from './GameHeader'
import QuestionControls from './QuestionControls'
import styles from './FinalChallenge.module.css'

type Drawn = { card: Card; index: number } // une carte et sa place dans le paquet

const ANSWER_DELAY = 450 // la réponse touchée reste en jaune un instant

type FinalChallengeProps = {
  gameId: string
  player: Player
  drawn: Drawn[] // les 5 cartes tirées
  timerSeconds: number
  onDone: (result: { declined: boolean; picked: (Letter | null)[] }) => void
}

type Step =
  | { step: 'intro' } // l'enveloppe : les règles du défi, la sauce
  | { step: 'read' } // les 5 questions lues d'affilée
  | { step: 'answer'; picked: Letter | null; deadline: number } // une question à la fois, timer lancé

// Le défi final (règle du PDF) : sauce la plus forte, 5 questions lues d'affilée,
// puis les 5 réponses dans l'ordre, de mémoire.
function FinalChallenge({ gameId, player, drawn, timerSeconds, onDone }: FinalChallengeProps) {
  const [step, setStep] = useState<Step>({ step: 'intro' })
  const [answers, setAnswers] = useState<(Letter | null)[]>([]) // les réponses déjà données

  // Les 5 questions d'affilée, et pour chaque question à répondre : « Question N » + ses réponses
  const allQuestions = drawn
    .map((entry, index) => `Question ${index + 1}. ${entry.card.question}`)
    .join(' ')
  function answersToRead(number: number) {
    const { card, index } = drawn[number]
    const answers = answerOrder(gameId, index).map(
      (letter, position) => `${position + 1}: ${answerText(card, letter)}.`,
    )
    return `Question ${number + 1}. ${answers.join(' ')}`
  }

  // Chaque question a son propre timer, lancé dès qu'elle s'affiche.
  // Préférence « Voice over » : ses réponses sont lues tout de suite.
  function startQuestion(number: number) {
    setStep({ step: 'answer', picked: null, deadline: Date.now() + timerSeconds * 1000 })
    if (getPreferences().voiceOver) readAloud(answersToRead(number))
  }

  function submit(timedOut: boolean) {
    if (step.step !== 'answer') return
    stopSpeaking()
    if (timedOut) vibrate(200)
    const all = [...answers, step.picked]
    if (all.length === drawn.length) {
      onDone({ declined: false, picked: all })
      return
    }
    setAnswers(all)
    startQuestion(all.length)
  }

  // Même principe que pendant un tour : réponse touchée = question suivante, fin du timer = sans réponse
  useEffect(() => {
    if (step.step !== 'answer') return
    const delay = step.picked !== null ? ANSWER_DELAY : Math.max(0, step.deadline - Date.now())
    const timeout = window.setTimeout(() => submit(step.picked === null), delay)
    return () => window.clearTimeout(timeout)
  })

  useEffect(() => stopSpeaking, [])

  if (step.step === 'intro') {
    return (
      <Screen
        tight
        footer={
          <div className={styles.actions}>
            <Button
              variant="primary"
              icon={
                <span className={styles.chili}>
                  <Icon name="chili" size={26} />
                </span>
              }
              onClick={() => {
                setStep({ step: 'read' })
                if (getPreferences().voiceOver) readAloud(allQuestions)
              }}
            >
              Sauce taken
            </Button>
            <Button onClick={() => onDone({ declined: true, picked: [] })}>
              Decline the sauce (back {FINAL_SAUCE} spaces)
            </Button>
          </div>
        }
      >
        <GameHeader
          title="Final challenge"
          subtitle={`${player.name} is on the finish line`}
          closeLabel="Quit to home"
          closeTo="/"
        />
        <section className={styles.envelope} aria-labelledby="envelope-title">
          <h2 id="envelope-title" className={styles.envelopeTitle}>
            The sealed envelope
          </h2>
          <ol className={styles.rules}>
            <li>{player.name} takes one dose of the Hell sauce.</li>
            <li>The others read {drawn.length} questions in a row, without stopping.</li>
            <li>{player.name} answers all of them, in order, from memory.</li>
          </ol>
          <p className={styles.stakes}>
            All right: {player.name} wins the game. Even one wrong: try again next turn.
          </p>
        </section>
      </Screen>
    )
  }

  if (step.step === 'read') {
    return (
      <Screen
        tight
        footer={
          <Button
            icon={<UiIcon name="skull" />}
            onClick={() => {
              stopSpeaking()
              startQuestion(0)
            }}
          >
            Answer the questions
          </Button>
        }
      >
        <GameHeader
          title="Final challenge"
          subtitle="Read the questions in a row, without stopping"
          closeLabel="Quit to home"
          closeTo="/"
        />
        <ol className={styles.questions}>
          {drawn.map((entry) => (
            <li key={entry.index}>{entry.card.question}</li>
          ))}
        </ol>
        {canSpeak && (
          <button type="button" className={styles.speak} onClick={() => speak(allQuestions)}>
            <LineIcon name="sound" size={22} />
            Read them aloud
          </button>
        )}
      </Screen>
    )
  }

  // Une question à la fois : seulement « Question N » et ses 4 réponses
  const number = answers.length
  const current = drawn[number]
  const order = answerOrder(gameId, current.index)
  const textToRead = answersToRead(number)

  return (
    <Screen tight>
      <GameHeader
        title={`${player.name} answers`}
        subtitle={`Final challenge · ${number + 1} of ${drawn.length}`}
        closeLabel="Quit to home"
        closeTo="/"
      />
      <GameCard
        key={current.index}
        card={current.card}
        order={order}
        flipped
        heading={`Question ${number + 1}`}
        picked={step.picked}
        onPick={step.picked === null ? (letter) => setStep({ ...step, picked: letter }) : undefined}
        showAnswer={false}
        controls={
          <QuestionControls
            textToRead={textToRead}
            seconds={timerSeconds}
            deadline={step.picked === null ? step.deadline : null}
          />
        }
      />
    </Screen>
  )
}

export default FinalChallenge
