import { QuestDifficult } from "src/models/questDifficult"
import { QuestGroup } from "src/models/questGroup"
import { QuestQuestion } from "src/models/questQuestion"
import { QuestTag } from "src/models/questTag"
import { Employee } from "src/models/users"

export class GetQuestMinimizeSchema {
  id: number
  name?: string
  group?: QuestGroup
  tags?: QuestTag[]
  difficult?: QuestDifficult
}

export class GetQuestSchema {
  id: number
  executor: Employee
  name?: string
  group?: QuestGroup
  tags?: QuestTag[]
  difficult?: QuestDifficult
  questions?: QuestQuestion[]
}

export class GetQuestionSchema {
  id: number
}