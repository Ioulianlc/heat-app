import { createClient } from '@supabase/supabase-js'

// Vite lit ces deux valeurs dans le fichier .env.local
const url = import.meta.env.VITE_SUPABASE_URL
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !publishableKey) {
  throw new Error('Supabase: fill in the two values in app/.env.local')
}

// Une clé secrète dans le navigateur serait visible par tout le monde
if (publishableKey.startsWith('sb_secret_')) {
  throw new Error('Supabase: never use a secret key in the app')
}

// L'unique connexion, partagée par toute l'app
export const supabase = createClient(url, publishableKey)
