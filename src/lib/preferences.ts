import { useSyncExternalStore } from 'react'
import { readJson, writeJson } from './storage'
import { applyTheme } from './theme'

// Les réglages de ce téléphone (page Profil, section « Preference »).
// Ils décrivent l'appareil (son, vibreur, écran) : on les garde sur le téléphone, pas dans Supabase.
export type Preferences = {
  voiceOver: boolean // lire chaque question à voix haute dès qu'elle apparaît
  soundEffects: boolean
  vibrations: boolean
  darkMode: boolean // thème sombre ; le clair est celui de la maquette V5
}

const KEY = 'heat.preferences'
const DEFAULTS: Preferences = {
  voiceOver: false,
  soundEffects: true,
  vibrations: true,
  darkMode: false,
}

let current: Preferences = { ...DEFAULTS, ...(readJson<Partial<Preferences>>(KEY) ?? {}) }
const listeners = new Set<() => void>()

// Pour le code hors React (sons, vibrations, lecture)
export function getPreferences() {
  return current
}

export function setPreference(key: keyof Preferences, value: boolean) {
  current = { ...current, [key]: value }
  writeJson(KEY, current)
  if (key === 'darkMode') applyTheme(value)
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

// Pour les écrans : ils se mettent à jour dès qu'un réglage change
export function usePreferences() {
  return useSyncExternalStore(subscribe, getPreferences)
}
