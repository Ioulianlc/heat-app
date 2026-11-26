import type { GameState, Turn } from '../game/types'
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

// Ce qu'une version plus ancienne de l'app a pu enregistrer : certains champs manquent
type SavedState = Pick<GameState, 'version' | 'settings' | 'players'> &
  Partial<Omit<GameState, 'turns'>> & { turns?: Partial<Turn>[] }

// On complète avec les valeurs de départ, pour que le reste de l'app voie toujours la forme actuelle
function normalize(saved: SavedState): GameState {
  const state = {
    firstAnswererId: null,
    deck: [],
    cursor: 0,
    turns: [],
    edits: [],
    winnerId: null,
    ...saved,
  }
  const turns = state.turns.map(
    (turn) => ({ kind: 'question', trap: null, declined: false, ...turn }) as Turn,
  )
  return { ...state, turns }
}

// Les parties de ce compte, la plus récente en premier (la règle RLS filtre les autres)
export async function listGames(): Promise<Game[]> {
  const { data, error } = await supabase
    .from('games')
    .select('id, status, created_at, updated_at, state')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data.map((game) => ({ ...game, state: normalize(game.state) }))
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
  return { ...data, state: normalize(data.state) }
}

// Enregistre l'état de la partie après chaque tour.
// La colonne status suit l'état : « finished » dès qu'il y a un gagnant.
export async function saveGame(id: string, state: GameState) {
  const status = state.winnerId ? 'finished' : 'playing'
  const { error } = await supabase
    .from('games')
    .update({ state, status, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}
