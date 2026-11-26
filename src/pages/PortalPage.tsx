import { useState, type FormEvent } from 'react'
import { Button } from '../components/Button'
import Logo from '../components/Logo'
import Screen from '../components/Screen'
import { readableError } from '../lib/errors'
import { createProfile, NAME_MAX_LENGTH, type Profile } from '../lib/profile'
import styles from './PortalPage.module.css'

type PortalPageProps = {
  onCreated: (profile: Profile) => void
}

// Premier lancement : un nom, la confirmation 18+, et c'est parti
function PortalPage({ onCreated }: PortalPageProps) {
  const [name, setName] = useState('')
  const [isAdult, setIsAdult] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = name.trim().length > 0 && isAdult && !isSaving

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault() // sinon le navigateur recharge la page
    if (!canSubmit) return
    setIsSaving(true)
    setError('')
    try {
      onCreated(await createProfile(name))
    } catch (caught) {
      setError(readableError(caught))
      setIsSaving(false)
    }
  }

  return (
    <Screen
      footer={
        <Button type="submit" form="portal" variant="primary" disabled={!canSubmit}>
          {isSaving ? 'Creating…' : 'Create my profile'}
        </Button>
      }
    >
      <form id="portal" className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.logo}>
          <Logo width={150} />
        </div>

        <div className={styles.intro}>
          <h1>Who are you ?</h1>
          <p>Pick your name. It's for good: you can't change it later.</p>
        </div>

        <label className={styles.field}>
          First name
          <input
            className={styles.input}
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={NAME_MAX_LENGTH}
            placeholder="ex : Lea"
            autoComplete="given-name"
            required
          />
        </label>

        <section className={styles.warning} aria-labelledby="warning-title">
          <h3 id="warning-title">Extremely hot sauces</h3>
          <p>
            Heat makes players eat very spicy sauces. Adults only. Do not play if you are pregnant or
            breastfeeding, or have heart, blood pressure, asthma, stomach or allergy problems.
          </p>
        </section>

        <label className={styles.check}>
          <input
            type="checkbox"
            checked={isAdult}
            onChange={(event) => setIsAdult(event.target.checked)}
            required
          />
          I'm 18 or older
        </label>

        <p className={styles.note}>
          Your name and your games are saved online for this phone. No password, no email: if you
          clear this browser's data, your profile is lost.
        </p>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </form>
    </Screen>
  )
}

export default PortalPage
