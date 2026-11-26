import type { GameState } from '../game/types'
import { supabase } from './supabase'

// Une partie telle que l'accueil la liste
export type GameRow = {
  id: string
  status: 'playing' | 'finished'
  created_at: string
  updated_at: string
}

// Une partie complète, avec ses joueurs et ses réglages
export type Game = GameRow & { state: GameState }

// Les parties de ce compte, la plus récente en premier (la règle RLS filtre les autres)
export async function listGames(): Promise<GameRow[]> {
  const { data, error } = await supabase
    .from('games')
    .select('id, status, created_at, updated_at')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

// Enregistre une nouvelle partie et renvoie son identifiant.
// owner_id n'est pas envoyé : la base le remplit avec le compte connecté.
export async function createGame(state: GameState): Promise<string> {
  const { data, error } = await supabase.from('games').insert({ state }).select('id').single()
  if (error) throw error
  return data.id
}

// Une partie par son identifiant, ou null si elle n'existe pas (ou n'est pas à ce compte)
export async function getGame(id: string): Promise<Game | null> {
  const { data, error } = await supabase
    .from('games')
    .select('id, status, created_at, updated_at, state')
    .eq('id', id)
    .maybeSingle()
  if (error?.code === '22P02') return null // adresse avec un identifiant mal formé
  if (error) throw error
  if (!data) return null
  // Les parties créées avant le tour de jeu n'ont pas encore ces champs : valeurs de départ
  return { ...data, state: { firstAnswererId: null, deck: [], cursor: 0, turns: [], ...data.state } }
}

// Enregistre l'état de la partie après chaque tour
export async function saveGame(id: string, state: GameState) {
  const { error } = await supabase
    .from('games')
    .update({ state, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}
