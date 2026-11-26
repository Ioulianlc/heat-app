import { useSyncExternalStore } from 'react'

function subscribe(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

// true tant que le téléphone a du réseau ; l'écran se met à jour quand il le perd ou le retrouve
export function useOnline() {
  return useSyncExternalStore(subscribe, () => navigator.onLine)
}
