export interface CrosswordWord {
  x: number
  y: number
  word: string
  question: string
  direction: CrosswordDirection
}

export type CrosswordDirection = 'horizontal' | 'vertical'
