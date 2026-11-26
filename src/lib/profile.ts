import { supabase } from './supabase'

export type Profile = {
  id: string
  name: string
}

export const NAME_MAX_LENGTH = 20 // même limite que dans la base

// Le profil de ce téléphone, ou null si personne ne s'est encore inscrit ici
export async function getCurrentProfile(): Promise<Profile | null> {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  if (!data.session) return null

  // La règle RLS ne renvoie que la ligne de ce compte
  const result = await supabase.from('profiles').select('id, name').maybeSingle()
  if (result.error) throw result.error
  return result.data
}

// Crée le compte anonyme (une seule fois par téléphone), puis le profil avec le nom
export async function createProfile(name: string): Promise<Profile> {
  const { data } = await supabase.auth.getSession()
  if (!data.session) {
    const signIn = await supabase.auth.signInAnonymously()
    if (signIn.error) throw signIn.error
  }

  const result = await supabase
    .from('profiles')
    .insert({ name: name.trim() })
    .select('id, name')
    .single()

  // 23505 = le profil existe déjà (double appui sur le bouton) : on le récupère
  if (result.error?.code === '23505') {
    const existing = await getCurrentProfile()
    if (existing) return existing
  }
  if (result.error) throw result.error
  return result.data
}
