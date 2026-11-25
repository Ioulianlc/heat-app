import type { Card } from '../types/card'
import { supabase } from './supabase'

// Demande toutes les cartes visibles à Supabase
export async function fetchCards(): Promise<Card[]> {
  const { data, error } = await supabase.from('cards').select('*').order('id')
  if (error) throw error
  return data
}
