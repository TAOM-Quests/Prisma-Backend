import { GetFileStatsSchema } from 'src/commonModule/files/schema/GetFileStatsSchema'
import { QuestAnswer } from 'src/models/questAnswer'
import { Employee } from 'src/models/users'

export class GetQuestMinimizeSchema {
  id: number
  tags: GetQuestTagsSchema[]
  name?: string
  time?: string
  completeId?: number
  description?: string
  completedCount?: number
  image?: GetFileStatsSchema
  group?: GetQuestGroupsSchema
  difficult?: GetQuestDifficultiesSchema
}

export class GetQuestSchema extends GetQuestMinimizeSchema {
  executor: Employee
  results?: GetQuestResultSchema[]
  questions?: GetQuestQuestionSchema[]
}

export class GetQuestQuestionSchema {
  id: number
  text: string
  type: string
  answer: QuestAnswer
}

export class GetQuestResultSchema {
  id: number
  name: string
  minPoints: number
  description: string
  image?: GetFileStatsSchema
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
