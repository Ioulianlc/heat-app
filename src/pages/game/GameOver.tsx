import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '../../components/Button'
import Modal from '../../components/Modal'
import Podium from '../../components/Podium'
import Screen from '../../components/Screen'
import type { Standing } from '../../game/rules'
import GameHeader from './GameHeader'
import RankingList from './RankingList'
import styles from './GameOver.module.css'

type GameOverProps = {
  ranking: Standing[] // le gagnant en premier
  boardSize: number
  alert?: ReactNode // message « Not saved » si l'enregistrement a échoué
  dialog?: ReactNode // le résultat du défi final, affiché par-dessus juste après la victoire
}

// Fin de partie : la fenêtre « Game over ! » de la maquette V4 (podium + classement numéroté)
function GameOver({ ranking, boardSize, alert, dialog }: GameOverProps) {
  const navigate = useNavigate()

  return (
    <Screen tight>
      <GameHeader title="Game over" closeLabel="Back to home" closeTo="/" />
      {alert}
      {/* La fenêtre de fin n'apparaît qu'une fois le résultat du défi final fermé */}
      {dialog ?? (
        <Modal labelledBy="game-over-title" onClose={() => navigate('/')} tone="maroon">
          <div className={styles.body}>
            <h2 id="game-over-title">Game over !</h2>
            <Podium players={ranking.map((standing) => standing.player)} />
            <RankingList ranking={ranking} boardSize={boardSize} numbered />
            <Button variant="primary" onClick={() => navigate('/new')}>
              New game
            </Button>
          </div>
        </Modal>
      )}
    </Screen>
  )
}

export default GameOver
