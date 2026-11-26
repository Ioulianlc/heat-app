import type { Letter } from '../game/types'
import type { Card } from '../types/card'
import { supabase } from './supabase'

// Toutes les questions actives (la règle RLS cache les désactivées)
export async function fetchCards(): Promise<Card[]> {
  const { data, error } = await supabase.from('cards').select('*').order('id')
  if (error) throw error
  return data
}

const ANSWER_COLUMNS = { A: 'answer_a', B: 'answer_b', C: 'answer_c', D: 'answer_d' } as const

// Le texte d'une réponse à partir de sa lettre
export function answerText(card: Card, letter: Letter): string {
  return card[ANSWER_COLUMNS[letter]]
}
