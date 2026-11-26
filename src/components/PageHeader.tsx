import IconButton from './IconButton'
import UiIcon from './UiIcon'
import styles from './PageHeader.module.css'

type PageHeaderProps = {
  title: string
  backTo: string
}

// En-tête des écrans secondaires : bouton retour + titre centré (maquette « user profile V2 »)
function PageHeader({ title, backTo }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <IconButton to={backTo} label="Back">
        <UiIcon name="back" />
      </IconButton>
      <h1 className={styles.title}>{title}</h1>
      <span className={styles.spacer} aria-hidden="true" />
    </header>
  )
}

export default PageHeader
