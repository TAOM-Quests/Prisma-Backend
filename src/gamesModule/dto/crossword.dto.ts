export interface GetCrosswordQuery {
  day: string
  departmentId: number
  difficultyId: number
}

export interface CheckCrosswordAnswerDto {
  words: {
    x: number
    y: number
    word: string
    direction: string
  }[]
  userId: number
  departmentId: number
  difficultyId: number
}

export interface GetCrosswordWordsQuery {
  departmentId: number
  difficultyId: number
}

export interface SaveCrosswordWordDto {
  word: string
  question: string
  departmentId: number
  difficultyId: number
  id?: number
}
