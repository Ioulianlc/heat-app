import PlayerBadge from '../../components/PlayerBadge'
import type { Standing } from '../../game/rules'
import styles from './RankingList.module.css'

type RankingListProps = {
  ranking: Standing[]
  boardSize: number
  numbered?: boolean // la place devant chaque ligne (fenêtre « Game over »)
}

// Le classement à contour jaune des maquettes « True » et « False »
function RankingList({ ranking, boardSize, numbered = false }: RankingListProps) {
  return (
    <ol className={styles.ranking} aria-label="Ranking">
      {ranking.map(({ player, space }, index) => (
        <li key={player.id} className={styles.row}>
          <span className={styles.who}>
            {numbered && <span className={styles.place}>{index + 1}</span>}
            <PlayerBadge icon={player.icon} />
            {player.name}
          </span>
          <span className={styles.space}>
            {space === 0 ? 'Start' : space >= boardSize ? 'Finish' : `Space ${space}`}
          </span>
        </li>
      ))}
    </ol>
  )
}

export default RankingList
