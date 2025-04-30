export interface QuestAnswer {
  id: number
  options?: string[]
  correctAnswer?: CorrectAnswer
}

export type CorrectAnswer = SingleCorrectAnswer | MultipleCorrectAnswer | ConnectionCorrectAnswer |  BoxCorrectAnswer| FreeCorrectAnswer

type SingleCorrectAnswer = number
type MultipleCorrectAnswer = number[]
type ConnectionCorrectAnswer = string[]
type BoxCorrectAnswer = {[key: string]: number[]}
type FreeCorrectAnswer = string