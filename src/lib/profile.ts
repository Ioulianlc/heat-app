import { isOffline } from './errors'
import { readJson, removeKey, writeJson } from './storage'
import { supabase } from './supabase'

export type Profile = {
  id: string
  name: string
}

export const NAME_MAX_LENGTH = 20 // même limite que dans la base

const PROFILE_KEY = 'heat.profile' // copie du profil sur le téléphone, pour s'ouvrir hors ligne

// Le profil de ce téléphone, ou null si personne ne s'est encore inscrit ici.
// Hors ligne : la copie gardée sur le téléphone.
export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    if (!data.session) {
      removeKey(PROFILE_KEY)
      return null
    }

    // La règle RLS ne renvoie que la ligne de ce compte
    const result = await supabase
      .from('profiles')
      .select('id, name')
      .abortSignal(AbortSignal.timeout(6000))
      .maybeSingle()
    if (result.error) throw result.error
    if (result.data) writeJson(PROFILE_KEY, result.data)
    return result.data
  } catch (error) {
    const saved = readJson<Profile>(PROFILE_KEY)
    if (saved && isOffline(error)) return saved
    throw error
  }
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
  writeJson(PROFILE_KEY, result.data)
  return result.data
}
