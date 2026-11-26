import { useId } from 'react'
import styles from './Switch.module.css'

type SwitchProps = {
  label: string
  description?: string // lu par les lecteurs d'écran, pas affiché (la maquette n'a que l'intitulé)
  checked: boolean
  onChange: (checked: boolean) => void
}

// Une ligne « intitulé + interrupteur » (maquette V4, section « Preference »).
// C'est une vraie case à cocher, avec role="switch" : clavier et lecteurs d'écran la comprennent.
function Switch({ label, description, checked, onChange }: SwitchProps) {
  const id = useId()
  return (
    <div className={styles.row}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        type="checkbox"
        role="switch"
        className={styles.switch}
        checked={checked}
        aria-describedby={description ? `${id}-description` : undefined}
        onChange={(event) => onChange(event.target.checked)}
      />
      {description && (
        <span id={`${id}-description`} className="visually-hidden">
          {description}
        </span>
      )}
    </div>
  )
}

export default Switch
