import type { ComponentProps, ReactNode } from 'react'
import { Link } from 'react-router'
import styles from './Button.module.css'

type Variant = 'light' | 'primary' // blanc ou jaune, comme le composant de la maquette

type ButtonProps = ComponentProps<'button'> & {
  variant?: Variant
  icon?: ReactNode
}

// Un vrai bouton : il déclenche une action
export function Button({ variant = 'light', icon, children, ...rest }: ButtonProps) {
  return (
    <button className={`${styles.button} ${styles[variant]}`} {...rest}>
      {icon}
      {children}
    </button>
  )
}

type ButtonLinkProps = {
  to: string
  variant?: Variant
  icon?: ReactNode
  children: ReactNode
}

// Un lien qui a l'air d'un bouton : il change d'écran
export function ButtonLink({ to, variant = 'light', icon, children }: ButtonLinkProps) {
  return (
    <Link to={to} className={`${styles.button} ${styles[variant]}`}>
      {icon}
      {children}
    </Link>
  )
}
