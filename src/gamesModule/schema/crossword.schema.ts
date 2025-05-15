export interface GetCrosswordAnswerSchema {
  x: number
  y: number
  question: string
  direction: string
}

export interface CheckCrosswordAnswerSchema {
  words: {
    x: number
    y: number
    word: string
    direction: string
    isCorrect: boolean
  }[]
}
