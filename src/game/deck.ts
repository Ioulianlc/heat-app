import type { Card } from '../types/card'
import type { Difficulty, Letter } from './types'

// Mélange de Fisher-Yates : chaque ordre a la même chance de sortir
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const swap = result[i]
    result[i] = result[j]
    result[j] = swap
  }
  return result
}

// Le paquet de la partie, construit une seule fois puis enregistré :
// 1. le niveau choisi + les Very Hot, mélangés ensemble
// 2. puis les niveaux voisins, puis les plus éloignés (pour ne répéter qu'en dernier recours)
export function buildDeck(cards: Card[], difficulty: Difficulty): number[] {
  const pile = (keep: (card: Card) => boolean) =>
    shuffle(cards.filter(keep).map((card) => card.id))
  const distance = (card: Card) => Math.abs(card.difficulty - difficulty)
  return [
    ...pile((card) => card.difficulty === difficulty || card.difficulty === 4),
    ...pile((card) => card.difficulty !== 4 && distance(card) === 1),
    ...pile((card) => card.difficulty !== 4 && distance(card) === 2),
  ]
}

// La carte du tour : la prochaine du paquet qui existe encore
// (une question retirée de l'Excel entre-temps est sautée). Le paquet recommence une fois fini.
export function drawCard(deck: number[], cursor: number, cards: Map<number, Card>) {
  for (let step = 0; step < deck.length; step++) {
    const index = cursor + step
    const card = cards.get(deck[index % deck.length])
    if (card) return { card, index }
  }
  return null
}

// Générateur « à graine » : la même graine donne toujours la même suite de nombres
function seededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hash(text: string) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return h >>> 0
}

// L'ordre d'affichage des 4 réponses : mélangé (40 % des bonnes réponses sont B dans l'Excel),
// mais toujours le même pour une carte donnée d'une partie, même après un rechargement
export function answerOrder(gameId: string, cardIndex: number): Letter[] {
  return shuffle<Letter>(['A', 'B', 'C', 'D'], seededRandom(hash(`${gameId}:${cardIndex}`)))
}
