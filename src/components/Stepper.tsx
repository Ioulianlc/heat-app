import UiIcon from './UiIcon'
import styles from './Stepper.module.css'

type StepperProps<T> = {
  label: string // « Timer »
  hint: string // « per question »
  options: readonly T[] // les valeurs possibles, dans l'ordre
  value: T
  format: (value: T) => string // comment afficher la valeur (« 30 s »)
  onChange: (value: T) => void
}

// Une ligne de réglage avec ses flèches (maquette « game settings V2 »).
// <T> : le même composant sert pour des nombres (timer) ou des niveaux (difficulté).
function Stepper<T>({ label, hint, options, value, format, onChange }: StepperProps<T>) {
  const index = options.indexOf(value)

  return (
    <div className={styles.row} role="group" aria-label={label}>
      <div className={styles.text}>
        <span className={styles.label}>{label}</span>
        <span>{hint}</span>
      </div>
      <div className={styles.control}>
        <button
          type="button"
          className={styles.arrow}
          aria-label={`${label}: less`}
          disabled={index <= 0}
          onClick={() => onChange(options[index - 1])}
        >
          <UiIcon name="back" />
        </button>
        <output className={styles.value} aria-live="polite">
          {format(value)}
        </output>
        <button
          type="button"
          className={styles.arrow}
          aria-label={`${label}: more`}
          disabled={index >= options.length - 1}
          onClick={() => onChange(options[index + 1])}
        >
          <UiIcon name="back" flip />
        </button>
      </div>
    </div>
  )
}

export default Stepper
