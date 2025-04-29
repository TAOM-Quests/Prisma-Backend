import { GetFileStatsSchema } from "src/commonModule/schema/commonModule.schema"
import { QuestAnswer } from "src/models/questAnswer"
import { QuestDifficult } from "src/models/questDifficult"
import { QuestGroup } from "src/models/questGroup"
import { QuestQuestion } from "src/models/questQuestion"
import { QuestTag } from "src/models/questTag"
import { Employee } from "src/models/users"

export class GetQuestMinimizeSchema {
  id: number
  name?: string
  time?: string
  tags?: QuestTag[]
  group?: QuestGroup
  description?: string
  image?: GetFileStatsSchema
  difficult?: QuestDifficult
}

export class GetQuestSchema {
  id: number
  executor: Employee
  name?: string
  tags?: QuestTag[]
  group?: QuestGroup
  difficult?: QuestDifficult
  questions?: QuestQuestion[]
}

export class GetQuestQuestionSchema {
  id: number
  text: string
  type: string
  answer: QuestAnswer
}

export class GetQuestDifficultiesSchema {
  id: number
  name: string
}

export class GetQuestGroupsSchema {
  id: number
  name: string
}

export class GetQuestTagsSchema {
  id: number
  name: string
}