import type { ComponentProps } from 'react'
import styles from './TextInput.module.css'

// Le champ texte de la maquette (fenêtre « Add a player »), utilisé partout
function TextInput(props: ComponentProps<'input'>) {
  return <input className={styles.input} {...props} />
}

export default TextInput
