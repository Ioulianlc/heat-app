import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Button } from '../../components/Button'
import Icon from '../../components/Icon'
import Screen from '../../components/Screen'
import UiIcon from '../../components/UiIcon'
import { answerOrder, buildDeck, drawCard } from '../../game/deck'
import { betName } from '../../game/options'
import { rolesFor, standings } from '../../game/rules'
import type { Bet, GameState, Letter, Turn } from '../../game/types'
import { answerText, fetchCards } from '../../lib/cards'
import { readableError } from '../../lib/errors'
import { getGame, saveGame } from '../../lib/games'
import { stopSpeaking } from '../../lib/speech'
import type { Card } from '../../types/card'
import BetGauge from './BetGauge'
import BoardView from './BoardView'
import FirstPlayerPicker from './FirstPlayerPicker'
import GameCard from './GameCard'
import GameHeader from './GameHeader'
import QuestionControls from './QuestionControls'
import ResultDialog from './ResultDialog'
import styles from './GamePage.module.css'

// Les étapes d'un tour, dans l'ordre
type Phase =
  | { step: 'draw' } // dos de la carte : le poseur annonce le thème
  | { step: 'bet'; value: Bet | null } // la jauge de pari
  | { step: 'reveal'; bet: Bet } // pari posé : toucher la carte pour la retourner
  | { step: 'question'; bet: Bet; picked: Letter | null; deadline: number | null }
  | { step: 'result'; turn: Turn; card: Card; cardIndex: number; timedOut: boolean }

// Une partie en cours (maquettes « game », « Bet », « question », « True / False », « board »)
function GamePage() {
  const { id = '' } = useParams()
  const [state, setState] = useState<GameState | null>(null) // ce qui est enregistré dans Supabase
  const [cards, setCards] = useState<Map<number, Card> | null>(null)
  const [isMissing, setIsMissing] = useState(false)
  const [error, setError] = useState('')
  const [saveFailed, setSaveFailed] = useState(false)
  const [phase, setPhase] = useState<Phase>({ step: 'draw' }) // l'étape du tour, en mémoire seulement
  const [showBoard, setShowBoard] = useState(false)

  // Chargement : la partie et toutes les questions
  useEffect(() => {
    let cancelled = false
    Promise.all([getGame(id), fetchCards()])
      .then(([game, cardList]) => {
        if (cancelled) return
        if (!game) {
          setIsMissing(true)
          return
        }
        let loaded = game.state
        if (loaded.deck.length === 0) {
          // Première ouverture : le paquet est mélangé une fois pour toutes, puis enregistré
          loaded = { ...loaded, deck: buildDeck(cardList, loaded.settings.difficulty) }
          saveGame(id, loaded).catch(() => setSaveFailed(true))
        }
        setCards(new Map(cardList.map((card) => [card.id, card])))
        setState(loaded)
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(readableError(caught))
      })
    return () => {
      cancelled = true
      stopSpeaking()
    }
  }, [id])

  // Ce qui se déduit de l'état : la carte du tour et qui joue
  const draw = state && cards ? drawCard(state.deck, state.cursor, cards) : null
  const roles = state ? rolesFor(state, state.turns.length) : null

  // L'écran change tout de suite, l'enregistrement suit en arrière-plan
  function persist(next: GameState) {
    setState(next)
    saveGame(id, next)
      .then(() => setSaveFailed(false))
      .catch(() => setSaveFailed(true))
  }

  // Fin du tour : réponse validée, ou timer écoulé (la réponse choisie, s'il y en a une, compte)
  function finishTurn(timedOut: boolean) {
    if (phase.step !== 'question' || !state || !draw || !roles) return
    stopSpeaking()
    if (timedOut) navigator.vibrate?.(200)
    const turn: Turn = {
      answererId: roles.answerer.id,
      askerId: roles.asker.id,
      cardId: draw.card.id,
      bet: phase.bet,
      picked: phase.picked,
      correct: phase.picked === draw.card.correct,
    }
    setPhase({
      step: 'result',
      turn,
      card: draw.card,
      cardIndex: draw.index,
      timedOut: timedOut && phase.picked === null,
    })
    setShowBoard(false)
    persist({ ...state, cursor: draw.index + 1, turns: [...state.turns, turn] })
  }

  // Timer lancé : on programme la fin du tour à l'heure de fin.
  // Sans liste de dépendances : reprogrammé à chaque affichage, avec la version à jour de finishTurn.
  useEffect(() => {
    if (phase.step !== 'question' || phase.deadline === null) return
    const timeout = window.setTimeout(() => finishTurn(true), Math.max(0, phase.deadline - Date.now()))
    return () => window.clearTimeout(timeout)
  })

  if (error) {
    return (
      <Screen>
        <p role="alert">{error}</p>
      </Screen>
    )
  }
  if (isMissing) {
    return (
      <Screen tight>
        <GameHeader title="Game" closeLabel="Back to home" closeTo="/" />
        <p>This game doesn't exist.</p>
      </Screen>
    )
  }
  if (!state || !roles) {
    return (
      <Screen>
        <p>Loading the game…</p>
      </Screen>
    )
  }
  if (!draw) {
    return (
      <Screen>
        <p role="alert">No questions available.</p>
      </Screen>
    )
  }

  if (!state.firstAnswererId) {
    return (
      <FirstPlayerPicker
        players={state.players}
        onPick={(playerId) => persist({ ...state, firstAnswererId: playerId })}
      />
    )
  }
  if (showBoard) {
    return <BoardView state={state} currentId={roles.answerer.id} onClose={() => setShowBoard(false)} />
  }

  // Pendant le résultat, on montre encore le tour qui vient de se finir (pas le suivant)
  const isResult = phase.step === 'result'
  const findPlayer = (playerId: string) => state.players.find((player) => player.id === playerId)
  const answerer = (isResult && findPlayer(phase.turn.answererId)) || roles.answerer
  const asker = (isResult && findPlayer(phase.turn.askerId)) || roles.asker
  const card = isResult ? phase.card : draw.card
  const cardIndex = isResult ? phase.cardIndex : draw.index
  const order = answerOrder(id, cardIndex)
  let bet: Bet | null = null
  if (phase.step === 'reveal' || phase.step === 'question') bet = phase.bet
  if (isResult) bet = phase.turn.bet

  const header = (
    <GameHeader
      title={`${answerer.name} answers`}
      subtitle={bet ? `${asker.name} asks · ${betName(bet)} bet (+${bet})` : `${asker.name} asks`}
      closeLabel="Quit to home"
      closeTo="/"
      onBoard={() => setShowBoard(true)}
    />
  )
  const saveAlert = saveFailed && (
    <p className={styles.saveAlert} role="alert">
      Not saved: check your connection.
      <button type="button" onClick={() => persist(state)}>
        Retry
      </button>
    </p>
  )

  // Étape « pari » : la jauge remplace la carte
  if (phase.step === 'bet') {
    return (
      <Screen
        tight
        footer={
          <Button
            icon={<UiIcon name="skull" />}
            disabled={phase.value === null}
            onClick={() => phase.value && setPhase({ step: 'reveal', bet: phase.value })}
          >
            Place bet
          </Button>
        }
      >
        {header}
        {saveAlert}
        <h2 className={styles.betTitle}>Bet your peppers</h2>
        <BetGauge value={phase.value} onChange={(value) => setPhase({ step: 'bet', value })} />
      </Screen>
    )
  }

  let footer = null
  if (phase.step === 'draw') {
    footer = (
      <Button
        variant="primary"
        icon={
          <span className={styles.chiliIcon}>
            <Icon name="chili" size={26} />
          </span>
        }
        onClick={() => setPhase({ step: 'bet', value: null })}
      >
        Place your bet
      </Button>
    )
  } else if (phase.step === 'question') {
    footer = (
      <Button
        icon={<UiIcon name="skull" />}
        disabled={phase.picked === null}
        onClick={() => finishTurn(false)}
      >
        Submit answer
      </Button>
    )
  }

  let hint = ''
  if (phase.step === 'draw') hint = `${asker.name}, read the topic out loud.`
  if (phase.step === 'reveal') hint = 'Tap the card to reveal the question.'

  const textToRead = `${card.question} ${order
    .map((letter, index) => `${index + 1}: ${answerText(card, letter)}.`)
    .join(' ')}`

  return (
    <Screen tight footer={footer}>
      {header}
      {saveAlert}
      <div className={styles.stage}>
        {/* key : une nouvelle carte à chaque tour, sans animation de retour */}
        <GameCard
          key={cardIndex}
          card={card}
          order={order}
          flipped={phase.step === 'question' || isResult}
          onFlip={
            phase.step === 'reveal'
              ? () => setPhase({ step: 'question', bet: phase.bet, picked: null, deadline: null })
              : undefined
          }
          picked={phase.step === 'question' ? phase.picked : isResult ? phase.turn.picked : null}
          onPick={phase.step === 'question' ? (letter) => setPhase({ ...phase, picked: letter }) : undefined}
          showAnswer={isResult}
          controls={
            <QuestionControls
              textToRead={textToRead}
              seconds={state.settings.timerSeconds}
              deadline={phase.step === 'question' ? phase.deadline : null}
              onStart={
                phase.step === 'question'
                  ? () => setPhase({ ...phase, deadline: Date.now() + state.settings.timerSeconds * 1000 })
                  : undefined
              }
            />
          }
        />
      </div>
      {hint && <p className={styles.hint}>{hint}</p>}

      {isResult && (
        <ResultDialog
          answerer={answerer}
          turn={phase.turn}
          card={phase.card}
          timedOut={phase.timedOut}
          standings={standings(state)}
          boardSize={state.settings.boardSize}
          onNext={() => setPhase({ step: 'draw' })}
        />
      )}
    </Screen>
  )
}

export default GamePage
