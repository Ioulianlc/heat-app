// Erreur de réseau (hors ligne, réseau trop lent) plutôt qu'un refus du serveur
export function isOffline(error: unknown): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true
  if (error instanceof TypeError) return true
  const { name = '', message = '' } = (error ?? {}) as { name?: string; message?: string }
  return /fetch|network|load failed|abort|timed? ?out/i.test(`${name} ${message}`)
}

// Transforme une erreur technique en phrase lisible pour le joueur
export function readableError(error: unknown): string {
  const status = (error as { status?: number }).status
  if (status === 429) {
    return 'Too many new profiles on this network. Try again in a few minutes.'
  }
  if (isOffline(error)) {
    return 'No connection. Check your network and try again.'
  }
  const message = (error as { message?: string }).message
  return message ? `Something went wrong: ${message}` : 'Something went wrong. Try again.'
}
