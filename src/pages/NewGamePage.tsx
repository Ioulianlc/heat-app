import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useProfile } from '../account/profileContext'
import { Button } from '../components/Button'
import type { IconName } from '../components/icons'
import IconButton from '../components/IconButton'
import PlayerBadge from '../components/PlayerBadge'
import PlayerDialog from '../components/PlayerDialog'
import Screen from '../components/Screen'
import Stepper from '../components/Stepper'
import UiIcon from '../components/UiIcon'
import {
  BOARD_OPTIONS,
  DEFAULT_SETTINGS,
  DIFFICULTY_LABELS,
  DIFFICULTY_OPTIONS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  TIMER_OPTIONS,
} from '../game/options'
import type { GameSettings, Player } from '../game/types'
import { readableError } from '../lib/errors'
import { createGame } from '../lib/games'
import styles from './NewGamePage.module.css'

// Identifiant d'un invité, unique dans la partie.
// (crypto.randomUUID() ne marche qu'en HTTPS : il planterait sur un téléphone testé en Wi-Fi local.)
function newPlayerId() {
  return `guest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

// Création de partie (maquette « game settings V2 »)
function NewGamePage() {
  const profile = useProfile()
  const navigate = useNavigate()

  // Le titulaire du compte est toujours le joueur 01
  const [players, setPlayers] = useState<Player[]>(() => [
    { id: profile.id, name: profile.name, icon: 'chili', isOwner: true },
  ])
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS)
  const [editing, setEditing] = useState<Player | 'new' | null>(null) // la fenêtre ouverte
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState('')

  const missing = MIN_PLAYERS - players.length
  const freeSlots = MAX_PLAYERS - players.length

  function savePlayer(name: string, icon: IconName) {
    if (editing === 'new') {
      setPlayers([...players, { id: newPlayerId(), name, icon, isOwner: false }])
    } else if (editing) {
      setPlayers(players.map((p) => (p.id === editing.id ? { ...p, name, icon } : p)))
    }
    setEditing(null)
  }

  // Un seul réglage change, les autres restent tels quels
  function changeSetting<K extends keyof GameSettings>(key: K, value: GameSettings[K]) {
    setSettings({ ...settings, [key]: value })
  }

  async function startGame() {
    setIsStarting(true)
    setError('')
    try {
      const id = await createGame({ version: 1, settings, players })
      navigate(`/game/${id}`)
    } catch (caught) {
      setError(readableError(caught))
      setIsStarting(false)
    }
  }

  let startLabel = isStarting ? 'Starting…' : 'Start game'
  if (missing > 0) startLabel = `Add ${missing} more player${missing > 1 ? 's' : ''}`

  return (
    <Screen
      footer={
        <Button
          icon={<UiIcon name="skull" />}
          disabled={missing > 0 || isStarting}
          onClick={startGame}
        >
          {startLabel}
        </Button>
      }
    >
      <section className={styles.top} aria-labelledby="players-title">
        <div className={styles.headerRow}>
          <IconButton to="/" label="Back">
            <UiIcon name="back" />
          </IconButton>
          <p>
            {MIN_PLAYERS} to {MAX_PLAYERS} players
          </p>
        </div>
        <h1 id="players-title">Who’s playing ?</h1>

        <ul className={styles.players}>
          {players.map((player, index) => (
            <li key={player.id} className={styles.tile}>
              <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
              <PlayerBadge icon={player.icon} />
              <button
                type="button"
                className={styles.edit}
                aria-label={`Edit ${player.name}`}
                onClick={() => setEditing(player)}
              >
                <span className={styles.name}>{player.name}</span>
              </button>
              {!player.isOwner && (
                <button
                  type="button"
                  className={styles.remove}
                  aria-label={`Remove ${player.name}`}
                  onClick={() => setPlayers(players.filter((p) => p.id !== player.id))}
                >
                  ×
                </button>
              )}
            </li>
          ))}
          {Array.from({ length: freeSlots }, (_, index) => (
            <li key={`free-${index}`}>
              <button type="button" className={styles.add} onClick={() => setEditing('new')}>
                <span className={styles.plus} aria-hidden="true">
                  +
                </span>
                Add
              </button>
            </li>
          ))}
        </ul>
        <p className={styles.hint}>Add players in the order they sit, going left.</p>
      </section>

      <section className={styles.settings} aria-labelledby="settings-title">
        <h2 id="settings-title" className={styles.sectionTitle}>
          Settings
        </h2>
        <Stepper
          label="Timer"
          hint="per question"
          options={TIMER_OPTIONS}
          value={settings.timerSeconds}
          format={(seconds) => `${seconds} s`}
          onChange={(seconds) => changeSetting('timerSeconds', seconds)}
        />
        <Stepper
          label="Difficulty"
          hint={`${settings.difficulty}/3`}
          options={DIFFICULTY_OPTIONS}
          value={settings.difficulty}
          format={(level) => DIFFICULTY_LABELS[level]}
          onChange={(level) => changeSetting('difficulty', level)}
        />
        <Stepper
          label="Board"
          hint="Size"
          options={BOARD_OPTIONS}
          value={settings.boardSize}
          format={(spaces) => `${spaces} spaces`}
          onChange={(spaces) => changeSetting('boardSize', spaces)}
        />
      </section>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {editing && (
        <PlayerDialog
          player={editing === 'new' ? null : editing}
          others={players.filter((p) => editing === 'new' || p.id !== editing.id)}
          onSave={savePlayer}
          onClose={() => setEditing(null)}
        />
      )}
    </Screen>
  )
}

export default NewGamePage
