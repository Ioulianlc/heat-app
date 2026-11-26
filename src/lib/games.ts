import type { GameState, Turn } from '../game/types'
import { isOffline } from './errors'
import { keysStartingWith, readJson, removeKey, writeJson } from './storage'
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

// ---------------------------------------------------------------------------------------------
// Hors ligne : chaque partie a une copie sur le téléphone.
// « dirty » = des changements pas encore envoyés à Supabase ; « isNew » = la partie n'existe
// pas encore dans Supabase (créée hors ligne). Le téléphone qui joue est le seul à modifier
// sa partie : sa copie non envoyée est donc toujours la plus récente.
// ---------------------------------------------------------------------------------------------
type LocalCopy = { game: Game; dirty: boolean; isNew: boolean }

const PREFIX = 'heat.game.'
const KEEP = 10 // parties gardées sur le téléphone, en plus de celles pas encore envoyées
const READ_TIMEOUT = 6000 // réseau trop lent : au-delà, on se sert de la copie du téléphone
const COLUMNS = 'id, status, created_at, updated_at, state'

const byRecent = (a: Game, b: Game) => Date.parse(b.updated_at) - Date.parse(a.updated_at)

function readLocal(id: string): LocalCopy | null {
  const copy = readJson<LocalCopy>(PREFIX + id)
  return copy ? { ...copy, game: { ...copy.game, state: normalize(copy.game.state) } } : null
}

function writeLocal(copy: LocalCopy) {
  return writeJson(PREFIX + copy.game.id, copy)
}

function localCopies(): LocalCopy[] {
  return keysStartingWith(PREFIX)
    .map((key) => readLocal(key.slice(PREFIX.length)))
    .filter((copy) => copy !== null)
}

// On ne garde que les plus récentes, sauf celles qui attendent d'être envoyées
function prune() {
  localCopies()
    .filter((copy) => !copy.dirty)
    .map((copy) => copy.game)
    .sort(byRecent)
    .slice(KEEP)
    .forEach((game) => removeKey(PREFIX + game.id))
}

// Les envois partent un par un, dans l'ordre : un vieil état ne peut pas écraser un plus récent
let queue: Promise<unknown> = Promise.resolve()
function inOrder<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task)
  queue = run.catch(() => undefined)
  return run
}

// Envoie la partie à Supabase : « upsert » = la crée si elle n'existe pas, sinon la met à jour
async function push(copy: LocalCopy) {
  const { game } = copy
  // created_at seulement à la création : sinon on garderait la date de Supabase
  const row: Partial<GameRow> & { state: GameState } = {
    id: game.id,
    state: game.state,
    status: game.status,
    updated_at: game.updated_at,
  }
  if (copy.isNew) row.created_at = game.created_at
  const { error } = await supabase.from('games').upsert(row)
  if (error) throw error
}

// Envoi réussi : la copie est à jour, sauf si un tour a été joué pendant l'envoi
function markSent(sent: Game) {
  const copy = readLocal(sent.id)
  if (!copy) return
  writeLocal({ ...copy, dirty: copy.game.updated_at !== sent.updated_at, isNew: false })
}

// Identifiant créé sur le téléphone (possible hors ligne). randomUUID n'existe qu'en https :
// sinon on le fabrique avec getRandomValues, au même format (UUID v4).
function newId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

// Les parties de ce compte, la plus récente en premier (la règle RLS filtre les autres).
// Hors ligne : celles gardées sur le téléphone.
export async function listGames(): Promise<Game[]> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select(COLUMNS)
      .order('updated_at', { ascending: false })
      .abortSignal(AbortSignal.timeout(READ_TIMEOUT))
    if (error) throw error
    const games = new Map<string, Game>()
    for (const row of data) {
      const game = { ...row, state: normalize(row.state) }
      games.set(game.id, game)
    }
    // Les copies pas encore envoyées remplacent la version de Supabase (ou s'ajoutent)
    for (const copy of localCopies()) if (copy.dirty) games.set(copy.game.id, copy.game)
    const list = [...games.values()].sort(byRecent)
    list.slice(0, KEEP).forEach((game) => {
      if (!readLocal(game.id)?.dirty) writeLocal({ game, dirty: false, isNew: false })
    })
    prune()
    return list
  } catch (error) {
    if (!isOffline(error)) throw error
    return localCopies()
      .map((copy) => copy.game)
      .sort(byRecent)
  }
}

// Enregistre une nouvelle partie et renvoie son identifiant.
// Hors ligne, elle est créée sur le téléphone et envoyée au retour du réseau.
// owner_id n'est jamais envoyé : la base le remplit avec le compte connecté.
export async function createGame(state: GameState): Promise<string> {
  const now = new Date().toISOString()
  const copy: LocalCopy = {
    game: { id: newId(), status: 'playing', created_at: now, updated_at: now, state },
    dirty: true,
    isNew: true,
  }
  const kept = writeLocal(copy)
  try {
    await inOrder(() => push(copy))
    markSent(copy.game)
  } catch (error) {
    // Impossible de la garder sur le téléphone, ou refusée par Supabase : on abandonne
    if (!kept || !isOffline(error)) {
      removeKey(PREFIX + copy.game.id)
      throw error
    }
  }
  prune()
  return copy.game.id
}

// Une partie par son identifiant, ou null si elle n'existe pas (ou n'est pas à ce compte)
export async function getGame(id: string): Promise<Game | null> {
  const local = readLocal(id)
  if (local?.dirty) return local.game // pas encore envoyée : la version du téléphone est la bonne
  try {
    const { data, error } = await supabase
      .from('games')
      .select(COLUMNS)
      .eq('id', id)
      .abortSignal(AbortSignal.timeout(READ_TIMEOUT))
      .maybeSingle()
    if (error?.code === '22P02') return null // adresse avec un identifiant mal formé
    if (error) throw error
    if (!data) return null
    const game = { ...data, state: normalize(data.state) }
    writeLocal({ game, dirty: false, isNew: false })
    prune()
    return game
  } catch (error) {
    if (local && isOffline(error)) return local.game
    throw error
  }
}

// Enregistre l'état de la partie après chaque action : d'abord sur le téléphone, puis dans
// Supabase. « synced » = envoyée ; « local » = gardée sur le téléphone, envoyée plus tard.
// La colonne status suit l'état : « finished » dès qu'il y a un gagnant.
export async function saveGame(id: string, state: GameState): Promise<'synced' | 'local'> {
  const previous = readLocal(id)
  const now = new Date().toISOString()
  const copy: LocalCopy = {
    game: {
      id,
      status: state.winnerId ? 'finished' : 'playing',
      created_at: previous?.game.created_at ?? now,
      updated_at: now,
      state,
    },
    dirty: true,
    isNew: previous?.isNew ?? false,
  }
  const kept = writeLocal(copy)
  try {
    await inOrder(() => push(copy))
  } catch (error) {
    if (kept) return 'local'
    throw error
  }
  markSent(copy.game)
  return 'synced'
}

// Au lancement et au retour du réseau : on envoie les parties jouées hors ligne
let syncing = false
export async function syncPendingGames() {
  if (syncing) return
  syncing = true
  try {
    for (const copy of localCopies()) {
      if (!copy.dirty) continue
      await inOrder(() => push(copy))
      markSent(copy.game)
    }
  } catch {
    // toujours pas de réseau : on réessaiera au prochain retour du réseau
  } finally {
    syncing = false
  }
}
