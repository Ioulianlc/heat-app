import type { Trap } from './types'

// Le texte imprimé sur les cartes pièges (maquettes V4 et V5).
// Pendant la partie, la carte Forced nomme le joueur ; dans les règles, elle parle à « you ».
export function trapCard(trap: Trap, answerer?: string) {
  if (trap === 'double')
    return { title: 'X2', text: 'Draw a new card, the sauce is now 2x spicier!' }
  if (trap === 'substitution') {
    return {
      title: 'Substitution',
      text: 'Draw a new card, the person on your right answers for you. You bet!',
    }
  }
  return {
    title: 'Forced',
    text: answerer
      ? `The person to ${answerer}’s left is betting in their place`
      : 'The person on your left is betting in your place',
  }
}
