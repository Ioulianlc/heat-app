import { createContext, useContext } from 'react'
import type { Profile } from '../lib/profile'

// Le profil connecté, disponible dans tous les écrans sans le passer de composant en composant
export const ProfileContext = createContext<Profile | null>(null)

export function useProfile(): Profile {
  const profile = useContext(ProfileContext)
  if (!profile) throw new Error('useProfile must be used after the account is ready')
  return profile
}
