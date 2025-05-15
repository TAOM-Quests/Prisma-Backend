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
