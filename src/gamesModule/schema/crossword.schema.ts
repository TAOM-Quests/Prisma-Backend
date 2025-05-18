export interface GetCrosswordAnswerSchema {
  x: number
  y: number
  length: number
  question: string
  direction: string
}

export interface CheckCrosswordAnswerSchema {
  x: number
  y: number
  word: string
  direction: string
  isCorrect: boolean
}

export interface GetCrosswordWordSchema {
  id: number
  word: string
  question: string
  departmentId: number
  difficultyId: number
}

export interface GetCrosswordDifficultySchema {
  id: number
  name: string
}
