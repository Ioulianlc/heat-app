import PlayerBadge from '../../components/PlayerBadge'
import Screen from '../../components/Screen'
import type { Player } from '../../game/types'
import GameHeader from './GameHeader'
import styles from './FirstPlayerPicker.module.css'

type FirstPlayerPickerProps = {
  players: Player[]
  onPick: (playerId: string) => void
}

// Début de partie, règle du PDF : celui qui a mangé épicé en dernier répond en premier
function FirstPlayerPicker({ players, onPick }: FirstPlayerPickerProps) {
  return (
    <Screen tight>
      <GameHeader title="Who starts ?" closeLabel="Quit to home" closeTo="/" />
      <p>Who last ate something spicy? They answer first, and the player on their right asks.</p>
      <ul className={styles.list}>
        {players.map((player) => (
          <li key={player.id}>
            <button type="button" className={styles.player} onClick={() => onPick(player.id)}>
              <PlayerBadge icon={player.icon} />
              {player.name}
            </button>
          </li>
        ))}
      </ul>
    </Screen>
  )
}

export default FirstPlayerPicker
