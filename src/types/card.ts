// La forme d'une carte : une ligne de la table `cards` dans Supabase.
export type Card = {
  id: number
  kind: 'question' | 'special' | 'final'
  theme: string | null
  question: string
  answer_a: string | null
  answer_b: string | null
  answer_c: string | null
  answer_d: string | null
  correct: 'A' | 'B' | 'C' | 'D' | null
  explanation: string | null
  effect: string | null
  is_active: boolean
}
