import { GetFileStatsSchema } from 'src/commonModule/files/schema/GetFileStatsSchema'

export interface QuestAnswer {
  id: number
  options?: string[]
  optionsImages?: GetFileStatsSchema[]
  correctAnswer?: CorrectAnswer
}

export type CorrectAnswer =
  | SingleCorrectAnswer
  | MultipleCorrectAnswer
  | ConnectionCorrectAnswer
  | BoxCorrectAnswer
  | FreeCorrectAnswer

export type SingleCorrectAnswer = number
export type MultipleCorrectAnswer = number[]
export type ConnectionCorrectAnswer = string[]
export type BoxCorrectAnswer = { [key: string]: number[] }
export type FreeCorrectAnswer = string
