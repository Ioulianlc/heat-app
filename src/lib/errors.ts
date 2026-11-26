// Transforme une erreur technique en phrase lisible pour le joueur
export function readableError(error: unknown): string {
  const status = (error as { status?: number }).status
  if (status === 429) {
    return 'Too many new profiles on this network. Try again in a few minutes.'
  }
  if (error instanceof TypeError) {
    return 'No connection. Check your network and try again.'
  }
  const message = (error as { message?: string }).message
  return message ? `Something went wrong: ${message}` : 'Something went wrong. Try again.'
}
