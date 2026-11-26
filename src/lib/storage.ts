// Lire et écrire dans la mémoire du téléphone (localStorage), au format JSON.
// Elle peut être pleine, bloquée (navigation privée) ou vidée par le joueur :
// on ne plante jamais, on renvoie null ou false.

export function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? null : (JSON.parse(raw) as T)
  } catch {
    return null
  }
}

export function writeJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeKey(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    // rien à supprimer
  }
}

export function keysStartingWith(prefix: string): string[] {
  try {
    return Object.keys(localStorage).filter((key) => key.startsWith(prefix))
  } catch {
    return []
  }
}
