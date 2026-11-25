import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Polices embarquées dans l'app : elles marchent aussi sans réseau
import '@fontsource/bebas-neue/latin-400.css'
import '@fontsource-variable/red-hat-display/wght.css'
import './styles/tokens.css'
import './styles/base.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
