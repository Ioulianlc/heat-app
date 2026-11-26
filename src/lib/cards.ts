import type { Letter } from '../game/types'
import type { Card } from '../types/card'
import { isOffline } from './errors'
import { readJson, writeJson } from './storage'
import { supabase } from './supabase'

const CARDS_KEY = 'heat.cards' // copie des questions sur le téléphone, pour jouer hors ligne

// Toutes les questions actives (la règle RLS cache les désactivées).
// Hors ligne : la dernière copie gardée sur le téléphone.
export async function fetchCards(): Promise<Card[]> {
  try {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('id')
      .abortSignal(AbortSignal.timeout(6000))
    if (error) throw error
    writeJson(CARDS_KEY, data)
    return data
  } catch (error) {
    const saved = readJson<Card[]>(CARDS_KEY)
    if (saved && isOffline(error)) return saved
    throw error
  }
}

const ANSWER_COLUMNS = { A: 'answer_a', B: 'answer_b', C: 'answer_c', D: 'answer_d' } as const

// Le texte d'une réponse à partir de sa lettre
export function answerText(card: Card, letter: Letter): string {
  return card[ANSWER_COLUMNS[letter]]
}
