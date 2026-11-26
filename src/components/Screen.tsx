import type { ReactNode } from 'react'
import styles from './Screen.module.css'

type ScreenProps = {
  children: ReactNode
  footer?: ReactNode // bouton collé en bas de l'écran (ex. « New game »)
}

// Le cadre commun à tous les écrans : fond à motifs, marges, pied de page
function Screen({ children, footer }: ScreenProps) {
  return (
    <div className={styles.screen}>
      <main className={styles.content}>{children}</main>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  )
}

export default Screen
