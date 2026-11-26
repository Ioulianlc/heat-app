// Lecture à voix haute avec la synthèse vocale du téléphone (aucun service externe)
export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

export function speak(text: string) {
  if (!canSpeak) return
  const synth = window.speechSynthesis
  if (synth.speaking) {
    synth.cancel() // deuxième appui : on arrête
    return
  }
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US' // les questions sont en anglais
  utterance.rate = 0.95
  synth.speak(utterance)
}

export function stopSpeaking() {
  if (canSpeak) window.speechSynthesis.cancel()
}
