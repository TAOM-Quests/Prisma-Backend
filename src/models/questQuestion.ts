import { QuestAnswer } from "./questAnswer"

export interface QuestQuestion {
  id: number
  text: string
  type: string
  answer: QuestAnswer
}