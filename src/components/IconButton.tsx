import type { ReactNode } from 'react'
import { Link } from 'react-router'
import styles from './IconButton.module.css'

type IconButtonProps = {
  label: string // lu par les lecteurs d'écran, puisqu'il n'y a pas de texte visible
  children: ReactNode
  to?: string // si présent : lien vers un autre écran
  onClick?: () => void
}

// Le bouton rond de la maquette (profil, retour, fermer…)
function IconButton({ label, children, to, onClick }: IconButtonProps) {
  if (to) {
    return (
      <Link to={to} className={styles.iconButton} aria-label={label}>
        {children}
      </Link>
    )
  }
  return (
    <button type="button" className={styles.iconButton} aria-label={label} onClick={onClick}>
      {children}
    </button>
  )
}

export default IconButton
