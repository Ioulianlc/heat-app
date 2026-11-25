import { useEffect, useState } from 'react'
import styles from './App.module.css'
import Icon from './components/Icon'
import { iconPaths, type IconName } from './components/icons'
import Logo from './components/Logo'
import { fetchCards } from './lib/cards'
import type { Card } from './types/card'

const iconNames = Object.keys(iconPaths) as IconName[]

// Page de contrôle (connexion + charte), remplacée quand les maquettes arriveront
function App() {
  const [cards, setCards] = useState<Card[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [message, setMessage] = useState('')

  // [] = une seule fois, à l'affichage de la page
  useEffect(() => {
    fetchCards()
      .then((loaded) => {
        setCards(loaded)
        setStatus('ready')
      })
      .catch((error: { message: string }) => {
        setMessage(error.message)
        setStatus('error')
      })
  }, [])

  return (
    <main className={styles.page}>
      <h1 className={styles.logo}>
        <Logo />
      </h1>

      <section className={styles.panel}>
        <h2>Cards</h2>
        {status === 'loading' && <p>Loading cards...</p>}
        {status === 'error' && <p role="alert">Error: {message}</p>}
        {status === 'ready' && (
          <>
            <p>Cards loaded: {cards.length}</p>
            <ul>
              {cards.map((card) => (
                <li key={card.id}>{card.question}</li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className={styles.panel}>
        <h2>Colors</h2>
        <div className={styles.swatches}>
          <p className={styles.yellow}>Golden Poppy</p>
          <p className={styles.pink}>Pink Sparkle</p>
          <p className={styles.red}>Smooth Red</p>
          <p className={styles.maroon}>Strong Maroon</p>
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Icons</h2>
        <div className={styles.icons}>
          {iconNames.map((name) => (
            <Icon key={name} name={name} size={40} />
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
