import type { ReactNode } from 'react'
import styles from './Screen.module.css'

type ScreenProps = {
  children: ReactNode
  footer?: ReactNode // bouton collé en bas de l'écran (ex. « New game »)
  tight?: boolean // marges réduites : écrans de jeu, où la carte prend la place
}

// Le cadre commun à tous les écrans : fond à motifs, marges, pied de page
function Screen({ children, footer, tight = false }: ScreenProps) {
  return (
    <div className={styles.screen}>
      <main className={`${styles.content} ${tight ? styles.tight : ''}`}>{children}</main>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  )
}

export default Screen
