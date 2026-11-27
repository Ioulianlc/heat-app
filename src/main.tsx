import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
// Polices embarquées dans l'app : elles marchent aussi sans réseau
import '@fontsource/bebas-neue/latin-400.css'
import '@fontsource-variable/red-hat-display/wght.css'
import './styles/tokens.css'
import './styles/base.css'
import App from './App.tsx'
import { getPreferences } from './lib/preferences'
import { applyTheme } from './lib/theme'

// Mode hors ligne : le service worker garde l'app sur le téléphone (version publiée seulement,
// pas pendant « npm run dev » où il gênerait le rechargement automatique)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined)
  })
}

// Le thème est déjà posé par index.html ; on le confirme ici (utile pendant « npm run dev »)
applyTheme(getPreferences().darkMode)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Le routeur relie chaque adresse (/, /profile…) à un écran */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
