import { QuestAnswer } from "./questAnswer"
import { QuestQuestionType } from "./questQuestionType"

export interface QuestQuestion {
  id: number
  text?: string
  type?: QuestQuestionType
  answer?: QuestAnswer
}