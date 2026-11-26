// Lecture à voix haute avec la synthèse vocale du téléphone (aucun service externe)
export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

function say(text: string) {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US' // les questions sont en anglais
  utterance.rate = 0.95
  window.speechSynthesis.speak(utterance)
}

// Le bouton haut-parleur : un appui lit, un deuxième appui arrête
export function speak(text: string) {
  if (!canSpeak) return
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel()
    return
  }
  say(text)
}

// Lecture automatique (préférence « Voice over ») : on coupe ce qui est en cours, puis on lit
export function readAloud(text: string) {
  if (!canSpeak) return
  window.speechSynthesis.cancel()
  say(text)
}

export function stopSpeaking() {
  if (canSpeak) window.speechSynthesis.cancel()
}
