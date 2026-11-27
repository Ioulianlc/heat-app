import { useEffect, useRef, type ReactNode } from 'react'
import styles from './Modal.module.css'

type ModalProps = {
  labelledBy: string // id du titre de la fenêtre, lu par les lecteurs d'écran
  onClose: () => void // Échap, ou appui à côté si dismissible
  dismissible?: boolean // un appui sur le fond assombri ferme la fenêtre
  tone?: 'wine' | 'maroon' // couleur de fond de la maquette
  children: ReactNode
}

// Fenêtre par-dessus l'écran. Le parent l'affiche quand il en a besoin et la retire à la fermeture.
// showModal() : premier plan, reste de la page bloqué, Échap ferme, focus dans la fenêtre.
function Modal({ labelledBy, onClose, dismissible = false, tone = 'wine', children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.dialog} ${styles[tone]}`}
      data-surface="dark" // fond bordeaux dans les deux thèmes (voir tokens.css)
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={(event) => dismissible && event.target === event.currentTarget && onClose()}
    >
      <div className={styles.content}>{children}</div>
    </dialog>
  )
}

export default Modal
