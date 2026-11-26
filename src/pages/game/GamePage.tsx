import { useEffect, useState, type ReactNode } from 'react'
import { useParams } from 'react-router'
import { Button } from '../../components/Button'
import Icon from '../../components/Icon'
import Screen from '../../components/Screen'
import UiIcon from '../../components/UiIcon'
import { answerOrder, buildDeck, drawCard, drawCards, trapAt } from '../../game/deck'
import { betName, TRAP_NAMES } from '../../game/options'
import {
  answeredBy,
  FINAL_QUESTIONS,
  rolesFor,
  spaceOf,
  standings,
  turnNumber,
} from '../../game/rules'
import type { Bet, FinalTurn, GameState, Letter, QuestionTurn, Trap } from '../../game/types'
import { answerText, fetchCards } from '../../lib/cards'
import { readableError } from '../../lib/errors'
import { playSound, vibrate } from '../../lib/feedback'
import { getGame, saveGame } from '../../lib/games'
import { useOnline } from '../../lib/online'
import { getPreferences } from '../../lib/preferences'
import { readAloud, stopSpeaking } from '../../lib/speech'
import type { Card } from '../../types/card'
import BetGauge from './BetGauge'
import BoardView from './BoardView'
import FinalChallenge from './FinalChallenge'
import FinalResultDialog from './FinalResultDialog'
import FirstPlayerPicker from './FirstPlayerPicker'
import GameCard, { FLIP_MS } from './GameCard'
import GameHeader from './GameHeader'
import GameOver from './GameOver'
import QuestionControls from './QuestionControls'
import ResultDialog from './ResultDialog'
import TrapFace from './TrapFace'
import styles from './GamePage.module.css'

// Ce qui se décide pendant un tour, avant la réponse
type Plan = {
  bet: Bet
  trap: Trap | null // le piège révélé, s'il y en a un
  card: Card // la carte de la question (après un piège : la nouvelle carte tirée)
  cardIndex: number // sa place dans le paquet
}

const ANSWER_DELAY = 450 // la réponse touchée reste en jaune un instant avant le résultat

// Les étapes d'un tour, dans l'ordre
type Phase =
  | { step: 'draw' } // dos de la carte (le poseur annonce le thème) ou carte piège
  | { step: 'bet'; value: Bet | null } // la jauge de pari
  | { step: 'reveal'; plan: Plan } // pari posé : toucher la carte pour la retourner
  | { step: 'question'; plan: Plan; picked: Letter | null; deadline: number | null }
  | {
      step: 'result'
      turn: QuestionTurn
      card: Card
      cardIndex: number
      timedOut: boolean
      reachedFinish: boolean
    }
  | { step: 'final'; playerId: string; askerId: string; bonus: boolean } // défi final juste après l'arrivée
  | { step: 'finalResult'; turn: FinalTurn; cards: Card[] }

type FinalStart = { playerId: string; askerId: string; bonus: boolean }

// Ce que lit la synthèse vocale : la question, puis les 4 réponses dans l'ordre affiché
function questionText(card: Card, order: Letter[]) {
  const answers = order.map((letter, index) => `${index + 1}: ${answerText(card, letter)}.`)
  return `${card.question} ${answers.join(' ')}`
}

// Une partie en cours (maquettes « game », « Bet », « question », « True / False », « board »)
function GamePage() {
  const { id = '' } = useParams()
  const [state, setState] = useState<GameState | null>(null) // ce qui est enregistré dans Supabase
  const [cards, setCards] = useState<Map<number, Card> | null>(null)
  const [isMissing, setIsMissing] = useState(false)
  const [error, setError] = useState('')
  // synced : envoyé à Supabase · local : gardé sur le téléphone, envoyé au retour du réseau
  // failed : enregistré nulle part
  const [saveStatus, setSaveStatus] = useState<'synced' | 'local' | 'failed'>('synced')
  const online = useOnline()
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
          saveGame(id, loaded)
            .then(setSaveStatus)
            .catch(() => setSaveStatus('failed'))
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

  // Ce qui se déduit de l'état : la carte du tour, qui joue, le classement
  const draw = state && cards ? drawCard(state.deck, state.cursor, cards) : null
  // Piège (maquette V4) : il apparaît au tirage, avant le pari. La question vient de la carte suivante.
  const drawnTrap = draw ? trapAt(id, draw.index) : null
  const questionDraw =
    state && cards && draw && drawnTrap ? drawCard(state.deck, draw.index + 1, cards) : draw
  const roles = state ? rolesFor(state, turnNumber(state)) : null
  const ranking = state ? standings(state) : []

  // Un piège sort du paquet : petit son d'alerte (pas sur le défi final ni en fin de partie)
  const atFinish =
    state && roles ? spaceOf(state, roles.answerer.id) >= state.settings.boardSize : false
  const trapSoundIndex =
    phase.step === 'draw' &&
    drawnTrap &&
    draw &&
    state?.firstAnswererId &&
    !state.winnerId &&
    !atFinish
      ? draw.index
      : null
  useEffect(() => {
    if (trapSoundIndex !== null) playSound('trap')
  }, [trapSoundIndex])

  // L'écran change tout de suite, l'enregistrement suit en arrière-plan
  function persist(next: GameState) {
    setState(next)
    saveGame(id, next)
      .then(setSaveStatus)
      .catch(() => setSaveStatus('failed'))
  }

  // Toucher la carte : la question apparaît et le timer démarre (à la fin du retournement).
  // Préférence « Voice over » : la question est lue tout de suite.
  function reveal(plan: Plan) {
    if (!state) return
    playSound('flip')
    if (getPreferences().voiceOver) {
      readAloud(questionText(plan.card, answerOrder(id, plan.cardIndex)))
    }
    const deadline = Date.now() + FLIP_MS + state.settings.timerSeconds * 1000
    setPhase({ step: 'question', plan, picked: null, deadline })
  }

  // Fin du tour : réponse validée, ou timer écoulé (la réponse choisie, s'il y en a une, compte)
  function finishTurn(timedOut: boolean) {
    if (phase.step !== 'question' || !state || !roles) return
    stopSpeaking()
    const { plan, picked } = phase
    const correct = picked === plan.card.correct
    playSound(correct ? 'right' : 'wrong')
    if (!correct) vibrate(200)
    const turn: QuestionTurn = {
      kind: 'question',
      answererId: roles.answerer.id,
      askerId: roles.asker.id,
      cardId: plan.card.id,
      bet: plan.bet,
      picked,
      correct,
      trap: plan.trap,
      declined: false,
    }
    const next = { ...state, cursor: plan.cardIndex + 1, turns: [...state.turns, turn] }
    const size = state.settings.boardSize
    const reachedFinish =
      turn.correct &&
      spaceOf(state, turn.answererId) < size &&
      spaceOf(next, turn.answererId) >= size
    setPhase({
      step: 'result',
      turn,
      card: plan.card,
      cardIndex: plan.cardIndex,
      timedOut: timedOut && picked === null,
      reachedFinish,
    })
    setShowBoard(false)
    persist(next)
  }

  // Refuser la sauce : on corrige le tour qui vient d'être enregistré
  function declineSauce() {
    if (phase.step !== 'result' || !state) return
    const turn = { ...phase.turn, declined: true }
    setPhase({ ...phase, turn })
    persist({ ...state, turns: [...state.turns.slice(0, -1), turn] })
  }

  // Fin du défi final : victoire, échec ou sauce refusée
  function finishFinal(
    start: FinalStart,
    drawn: { card: Card; index: number }[],
    result: { declined: boolean; picked: (Letter | null)[] },
  ) {
    if (!state) return
    const used = result.declined ? [] : drawn
    const won =
      !result.declined && used.every((entry, index) => result.picked[index] === entry.card.correct)
    const turn: FinalTurn = {
      kind: 'final',
      answererId: start.playerId,
      askerId: start.askerId,
      cardIds: used.map((entry) => entry.card.id),
      picked: result.picked,
      won,
      declined: result.declined,
      bonus: start.bonus,
    }
    if (!result.declined) playSound(won ? 'win' : 'wrong')
    const cursor = used.length > 0 ? used[used.length - 1].index + 1 : state.cursor
    setPhase({ step: 'finalResult', turn, cards: used.map((entry) => entry.card) })
    persist({
      ...state,
      cursor,
      turns: [...state.turns, turn],
      winnerId: won ? start.playerId : null,
    })
  }

  // Réponse touchée : le résultat arrive juste après. Sinon, fin du tour à l'heure de fin du timer.
  // Sans liste de dépendances : reprogrammé à chaque affichage, avec la version à jour de finishTurn.
  useEffect(() => {
    if (phase.step !== 'question') return
    if (phase.picked !== null) {
      const timeout = window.setTimeout(() => finishTurn(false), ANSWER_DELAY)
      return () => window.clearTimeout(timeout)
    }
    if (phase.deadline === null) return
    const timeout = window.setTimeout(
      () => finishTurn(true),
      Math.max(0, phase.deadline - Date.now()),
    )
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
  if (!state || !roles || !cards) {
    return (
      <Screen>
        <p>Loading the game…</p>
      </Screen>
    )
  }
  if (!draw || !questionDraw) {
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

  const size = state.settings.boardSize
  const findPlayer = (playerId: string) =>
    state.players.find((player) => player.id === playerId) ?? roles.answerer
  // Hors ligne, le bandeau de l'écran suffit. Avec du réseau, on signale ce qui n'est pas parti.
  let saveAlert: ReactNode = null
  if (saveStatus === 'failed' || (saveStatus === 'local' && online)) {
    saveAlert = (
      <p className={styles.saveAlert} role="alert">
        {saveStatus === 'failed'
          ? 'Not saved: check your connection.'
          : 'Saved on this phone only.'}
        <button type="button" onClick={() => persist(state)}>
          Retry
        </button>
      </p>
    )
  }

  // Résultat du défi final, puis fin de partie s'il y a un gagnant
  if (phase.step === 'finalResult') {
    const player = findPlayer(phase.turn.answererId)
    const dialog = (
      <FinalResultDialog
        player={player}
        turn={phase.turn}
        cards={phase.cards}
        onClose={() => setPhase({ step: 'draw' })}
      />
    )
    if (state.winnerId) {
      return <GameOver ranking={ranking} boardSize={size} alert={saveAlert} dialog={dialog} />
    }
    return (
      <Screen tight>
        <GameHeader title="Final challenge" closeLabel="Quit to home" closeTo="/" />
        {saveAlert}
        {dialog}
      </Screen>
    )
  }
  if (state.winnerId) {
    return <GameOver ranking={ranking} boardSize={size} alert={saveAlert} />
  }

  if (showBoard) {
    return (
      <BoardView
        state={state}
        currentId={roles.answerer.id}
        onClose={() => setShowBoard(false)}
        onSave={(changes) =>
          persist({
            ...state,
            edits: [
              ...state.edits,
              ...changes.map((change) => ({ atTurn: state.turns.length, ...change })),
            ],
          })
        }
      />
    )
  }

  // Défi final : juste après l'arrivée (bonus), ou au tour d'un joueur resté sur la ligne d'arrivée
  let finalStart: FinalStart | null = null
  if (phase.step === 'final') finalStart = phase
  else if (phase.step === 'draw' && spaceOf(state, roles.answerer.id) >= size) {
    finalStart = { playerId: roles.answerer.id, askerId: roles.asker.id, bonus: false }
  }
  if (finalStart) {
    const start = finalStart
    const drawn = drawCards(state.deck, state.cursor, cards, FINAL_QUESTIONS)
    return (
      <FinalChallenge
        key={`final-${state.turns.length}`}
        gameId={id}
        player={findPlayer(start.playerId)}
        drawn={drawn}
        timerSeconds={state.settings.timerSeconds}
        onDone={(result) => finishFinal(start, drawn, result)}
      />
    )
  }

  // Pendant le résultat, on montre encore le tour qui vient de se finir (pas le suivant)
  const isResult = phase.step === 'result'
  const plan = 'plan' in phase ? phase.plan : null
  const answerer = isResult ? findPlayer(phase.turn.answererId) : roles.answerer
  const asker = isResult ? findPlayer(phase.turn.askerId) : roles.asker
  const card = isResult ? phase.card : (plan?.card ?? draw.card)
  const cardIndex = isResult ? phase.cardIndex : (plan?.cardIndex ?? draw.index)
  const bet = isResult ? phase.turn.bet : (plan?.bet ?? null)
  // Avant le pari, le piège vient du tirage ; ensuite, il est dans le plan du tour
  const trap = isResult ? phase.turn.trap : plan ? plan.trap : drawnTrap
  const order = answerOrder(id, cardIndex)

  // Substitution : une fois la nouvelle carte tirée, c'est le poseur qui répond
  const substituted =
    trap === 'substitution' && (phase.step === 'question' || phase.step === 'result')
  let subtitle = `${asker.name} asks`
  if (substituted && bet)
    subtitle = `Substitution for ${answerer.name} · ${betName(bet)} bet (+${bet})`
  else if (bet && trap) subtitle = `${TRAP_NAMES[trap]} · ${betName(bet)} bet (+${bet})`
  else if (bet) subtitle = `${asker.name} asks · ${betName(bet)} bet (+${bet})`

  const header = (
    <GameHeader
      title={`${substituted ? asker.name : answerer.name} answers`}
      subtitle={subtitle}
      closeLabel="Quit to home"
      closeTo="/"
      onBoard={() => setShowBoard(true)}
    />
  )

  // La jauge de pari (maquette « iphone 17 - 25 »)
  function betScreen(
    title: string,
    note: string | null,
    value: Bet | null,
    onChange: (bet: Bet) => void,
    onConfirm: (bet: Bet) => void,
  ) {
    return (
      <Screen
        tight
        footer={
          <Button
            icon={<UiIcon name="skull" />}
            disabled={value === null}
            onClick={() => value && onConfirm(value)}
          >
            Go to the question
          </Button>
        }
      >
        {header}
        {saveAlert}
        <h2 className={styles.betTitle}>{title}</h2>
        {note && <p className={styles.note}>{note}</p>}
        <BetGauge value={value} onChange={onChange} />
      </Screen>
    )
  }

  // Après un piège, la carte de la question est la suivante du paquet : elle arrive face cachée
  if (phase.step === 'bet') {
    return betScreen(
      'Bet your peppers',
      drawnTrap === 'forced' ? `${roles.left.name} bets for ${answerer.name}.` : null,
      phase.value,
      (value) => setPhase({ step: 'bet', value }),
      (chosen) =>
        setPhase({
          step: 'reveal',
          plan: {
            bet: chosen,
            trap: drawnTrap,
            card: questionDraw.card,
            cardIndex: questionDraw.index,
          },
        }),
    )
  }

  // Sous la carte piège : l'effet avec le nom des joueurs
  const trapHints: Record<Trap, string> = {
    substitution: `${answerer.name} bets, ${asker.name} answers. Right: ${answerer.name} moves. Wrong: ${asker.name} takes the sauce.`,
    double: `Right: ${answerer.name} moves as usual. Wrong: ${answerer.name} takes the sauce twice.`,
    forced: `${roles.left.name} chooses the bet for ${answerer.name}.`,
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
  }

  // Le piège montré au tirage (une seule fois par tour)
  const trapShown = phase.step === 'draw' ? drawnTrap : null

  let hint = ''
  if (phase.step === 'draw') {
    hint = trapShown ? trapHints[trapShown] : `${asker.name}, read the topic out loud.`
  }
  if (phase.step === 'reveal') {
    hint = phase.plan.trap
      ? `${asker.name}, read the new topic, then tap the card.`
      : 'Tap the card to reveal the question.'
  }

  const textToRead = questionText(card, order)

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
          flipped={trapShown !== null || phase.step === 'question' || isResult}
          onFlip={phase.step === 'reveal' ? () => reveal(phase.plan) : undefined}
          picked={phase.step === 'question' ? phase.picked : isResult ? phase.turn.picked : null}
          onPick={
            phase.step === 'question' && phase.picked === null
              ? (letter) => setPhase({ ...phase, picked: letter })
              : undefined
          }
          showAnswer={isResult}
          trap={trapShown ? <TrapFace trap={trapShown} answerer={answerer.name} /> : undefined}
          controls={
            <QuestionControls
              textToRead={textToRead}
              seconds={state.settings.timerSeconds}
              deadline={phase.step === 'question' && phase.picked === null ? phase.deadline : null}
            />
          }
        />
      </div>
      {hint && <p className={styles.hint}>{hint}</p>}

      {isResult && (
        <ResultDialog
          answerer={answerer}
          answeredBy={findPlayer(answeredBy(phase.turn))}
          turn={phase.turn}
          card={phase.card}
          timedOut={phase.timedOut}
          reachedFinish={phase.reachedFinish}
          ranking={ranking}
          boardSize={size}
          onNext={() => setPhase({ step: 'draw' })}
          onDecline={declineSauce}
          onFinal={() =>
            setPhase({
              step: 'final',
              playerId: phase.turn.answererId,
              askerId: phase.turn.askerId,
              bonus: true,
            })
          }
        />
      )}
    </Screen>
  )
}

export default GamePage
