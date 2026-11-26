import { useCallback, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { ProfileContext } from './account/profileContext'
import { Button } from './components/Button'
import Screen from './components/Screen'
import { readableError } from './lib/errors'
import { getCurrentProfile, type Profile } from './lib/profile'
import HomePage from './pages/HomePage'
import HowToPlayPage from './pages/HowToPlayPage'
import NewGamePage from './pages/NewGamePage'
import PortalPage from './pages/PortalPage'
import ProfilePage from './pages/ProfilePage'

// Les 4 états possibles du compte au lancement de l'app
type AccountState =
  | { status: 'loading' }
  | { status: 'missing' } // personne inscrit sur ce téléphone : on montre le portail
  | { status: 'ready'; profile: Profile }
  | { status: 'error'; message: string }

function App() {
  const [account, setAccount] = useState<AccountState>({ status: 'loading' })

  const loadAccount = useCallback(() => {
    getCurrentProfile()
      .then((profile) =>
        setAccount(profile ? { status: 'ready', profile } : { status: 'missing' }),
      )
      .catch((caught: unknown) => setAccount({ status: 'error', message: readableError(caught) }))
  }, [])

  useEffect(loadAccount, [loadAccount])

  if (account.status === 'loading') {
    return (
      <Screen>
        <p>Loading…</p>
      </Screen>
    )
  }

  if (account.status === 'error') {
    return (
      <Screen
        footer={
          <Button
            variant="primary"
            onClick={() => {
              setAccount({ status: 'loading' })
              loadAccount()
            }}
          >
            Try again
          </Button>
        }
      >
        <p role="alert">{account.message}</p>
      </Screen>
    )
  }

  if (account.status === 'missing') {
    return <PortalPage onCreated={(profile) => setAccount({ status: 'ready', profile })} />
  }

  // Compte prêt : chaque adresse affiche son écran
  return (
    <ProfileContext value={account.profile}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/how-to-play" element={<HowToPlayPage />} />
        <Route path="/new" element={<NewGamePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ProfileContext>
  )
}

export default App
