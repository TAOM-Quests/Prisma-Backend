export interface QuestAnswer {
  id: number
  answers?: string[]
  correctAnswer?: SingleCorrectAnswer | MultipleCorrectAnswer | ConnectionCorrectAnswer | FreeCorrectAnswer
}

type SingleCorrectAnswer = number
type MultipleCorrectAnswer = number[]
type ConnectionCorrectAnswer = string[]
// type BoxCorrectAnswer = number
type FreeCorrectAnswer = string