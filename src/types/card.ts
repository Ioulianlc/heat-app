// La forme d'une carte : une ligne de la table `cards` dans Supabase.
// Les questions viennent de l'Excel (voir sql/questions-to-sql.py).
// Les pièges ne sont pas des cartes de la base : l'app les mélange elle-même au paquet.
export type Card = {
  id: number
  code: string // l'ID de la question dans l'Excel, ex. « SM-01 »
  theme: string
  difficulty: 1 | 2 | 3 | 4 // 1 Easy, 2 Medium, 3 Hard, 4 Very Hot
  question: string
  answer_a: string
  answer_b: string
  answer_c: string
  answer_d: string
  correct: 'A' | 'B' | 'C' | 'D'
  explanation: string | null // vide tant que l'Excel n'a pas de colonne Explanation
  is_active: boolean
}
