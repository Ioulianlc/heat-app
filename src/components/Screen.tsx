import type { ReactNode } from 'react'
import { useOnline } from '../lib/online'
import styles from './Screen.module.css'

type ScreenProps = {
  children: ReactNode
  footer?: ReactNode // bouton collé en bas de l'écran (ex. « New game »)
  tight?: boolean // marges réduites : écrans de jeu, où la carte prend la place
}

// Le cadre commun à tous les écrans : fond à motifs, marges, pied de page.
// Sans réseau, un bandeau prévient que tout est gardé sur le téléphone.
function Screen({ children, footer, tight = false }: ScreenProps) {
  const online = useOnline()
  return (
    <div className={styles.screen}>
      <main className={`${styles.content} ${tight ? styles.tight : ''}`}>
        {!online && (
          <p className={styles.offline} role="status">
            Offline: the game goes on and is saved on this phone.
          </p>
        )}
        {children}
      </main>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  )
}

export default Screen
