import { supabase } from './supabase'

// Une partie telle que l'accueil la liste. Le contenu (joueurs, tours) arrive à l'étape du tour de jeu.
export type GameRow = {
  id: string
  status: 'playing' | 'finished'
  created_at: string
  updated_at: string
}

// Les parties de ce compte, la plus récente en premier (la règle RLS filtre les autres)
export async function listGames(): Promise<GameRow[]> {
  const { data, error } = await supabase
    .from('games')
    .select('id, status, created_at, updated_at')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}
