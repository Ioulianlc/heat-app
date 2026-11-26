import type { CSSProperties } from 'react'
import { BETS } from '../../game/options'
import type { Bet } from '../../game/types'
import styles from './BetGauge.module.css'

// Le piment de la maquette « Bet V2 » (tracé et position repris du Figma)
const CHILI = 'M409.4 30L371.9 0L334.5 30L278 21L190.2 125.9L142.1 132.6L70.6 92.6L5.6 118.7L0 156.3L31.2 142.3L55 142.1L171.3 229.2L289.2 213.5L387.8 154L409.4 101.1L386.9 74.9L409.4 30Z'
const CHILI_TRANSFORM = 'matrix(0.4091 -0.9125 0.9125 0.4091 -91 598.574)'

// Les 4 tranches du piment, de haut (Hell) en bas (Mild), et les pointillés entre elles
const ZONES: { level: Bet; top: number; bottom: number }[] = [
  { level: 4, top: 225, bottom: 337 },
  { level: 3, top: 337, bottom: 437 },
  { level: 2, top: 437, bottom: 533 },
  { level: 1, top: 533, bottom: 695 },
]
const LINES = [
  { y: 337, x1: 53, x2: 211 },
  { y: 437, x1: 83, x2: 217 },
  { y: 533, x1: 75, x2: 189 },
]

type BetGaugeProps = {
  value: Bet | null
  onChange: (bet: Bet) => void
}

// La jauge de pari : le piment se remplit du bas jusqu'au niveau choisi
function BetGauge({ value, onChange }: BetGaugeProps) {
  return (
    <div className={styles.gauge}>
      <svg className={styles.chili} viewBox="0 225 290 470" aria-hidden="true">
        <defs>
          <linearGradient
            id="heat-chili-gradient"
            gradientUnits="userSpaceOnUse"
            x1="409"
            y1="0"
            x2="5"
            y2="0"
          >
            <stop offset="0" stopColor="#c20a20" />
            <stop offset="1" stopColor="#ffc502" />
          </linearGradient>
          {ZONES.map((zone) => (
            <clipPath key={zone.level} id={`heat-zone-${zone.level}`}>
              <rect x="-100" y={zone.top} width="400" height={zone.bottom - zone.top} />
            </clipPath>
          ))}
        </defs>

        {/* Une tranche = le piment entier, découpé à la hauteur de la tranche */}
        {ZONES.map((zone) => (
          <g
            key={zone.level}
            clipPath={`url(#heat-zone-${zone.level})`}
            className={`${styles.zone} ${value !== null && zone.level <= value ? styles.lit : ''}`}
            style={{ '--delay': `${(zone.level - 1) * 70}ms` } as CSSProperties}
            onClick={() => onChange(zone.level)}
          >
            <path transform={CHILI_TRANSFORM} d={CHILI} fill="url(#heat-chili-gradient)" />
          </g>
        ))}

        {LINES.map((line) => (
          <line key={line.y} className={styles.line} x1={line.x1} x2={line.x2} y1={line.y} y2={line.y} />
        ))}
      </svg>

      {/* Les vrais boutons radio : clavier et lecteurs d'écran fonctionnent */}
      <fieldset className={styles.levels}>
        <legend className="visually-hidden">Your bet</legend>
        {ZONES.map((zone) => (
          <label
            key={zone.level}
            className={`${styles.level} ${value === zone.level ? styles.selected : ''} ${zone.level === 1 ? styles.mild : ''}`}
          >
            <input
              type="radio"
              name="bet"
              className="visually-hidden"
              checked={value === zone.level}
              onChange={() => onChange(zone.level)}
            />
            <span className={styles.levelName}>{BETS[zone.level - 1].name}</span>
            <span className={styles.levelGain}>
              +{zone.level} space{zone.level > 1 ? 's' : ''}
            </span>
          </label>
        ))}
      </fieldset>
    </div>
  )
}

export default BetGauge
