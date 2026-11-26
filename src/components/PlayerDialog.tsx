import { useState, type FormEvent } from 'react'
import { PLAYER_ICONS, PLAYER_NAME_MAX_LENGTH } from '../game/options'
import type { Player } from '../game/types'
import { Button } from './Button'
import type { IconName } from './icons'
import Modal from './Modal'
import PlayerBadge from './PlayerBadge'
import TextInput from './TextInput'
import styles from './PlayerDialog.module.css'

type PlayerDialogProps = {
  player: Player | null // null : nouveau joueur
  others: Player[] // les autres joueurs : leurs noms et icônes sont déjà pris
  onSave: (name: string, icon: IconName) => void
  onClose: () => void
}

// Fenêtre « Add a player » (maquette « add player pop up V2 »)
function PlayerDialog({ player, others, onSave, onClose }: PlayerDialogProps) {
  const takenIcons = others.map((other) => other.icon)
  const takenNames = others.map((other) => other.name.toLowerCase())

  const [name, setName] = useState(player?.name ?? '')
  // Icône déjà choisie, sinon la première encore libre
  const [icon, setIcon] = useState<IconName | undefined>(
    player?.icon ?? PLAYER_ICONS.find((option) => !takenIcons.includes(option.name))?.name,
  )

  const trimmed = name.trim()
  const nameTaken = takenNames.includes(trimmed.toLowerCase())
  const canSave = trimmed.length > 0 && !nameTaken && icon !== undefined

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (canSave && icon) onSave(trimmed, icon)
  }

  return (
    <Modal labelledBy="player-dialog-title" onClose={onClose} dismissible>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 id="player-dialog-title" className={styles.title}>
          {player ? 'Edit player' : 'Add a player'}
        </h2>

        <label className={styles.field}>
          First name
          <TextInput
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={PLAYER_NAME_MAX_LENGTH}
            placeholder="ex : Lea"
            autoComplete="off"
            readOnly={player?.isOwner}
          />
        </label>
        {player?.isOwner && <p className={styles.note}>Your profile name can't be changed.</p>}
        {nameTaken && (
          <p className={styles.error} aria-live="polite">
            Someone already has this name.
          </p>
        )}

        <fieldset className={styles.icons}>
          <legend className={styles.legend}>Pick an icon</legend>
          <div className={styles.iconList}>
            {PLAYER_ICONS.map((option) => {
              const taken = takenIcons.includes(option.name)
              return (
                <label key={option.name} className={styles.iconOption}>
                  <input
                    type="radio"
                    name="icon"
                    className={styles.radio}
                    value={option.name}
                    checked={icon === option.name}
                    disabled={taken}
                    onChange={() => setIcon(option.name)}
                    aria-label={taken ? `${option.label}, already taken` : option.label}
                  />
                  <PlayerBadge icon={option.name} size={45} />
                </label>
              )
            })}
          </div>
        </fieldset>

        <div className={styles.actions}>
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!canSave}>
            {player ? 'Save' : 'Add player'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default PlayerDialog
