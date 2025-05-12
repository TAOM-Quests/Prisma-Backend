import {
  GetCommentsSchema,
  GetFileStatsSchema,
} from 'src/commonModule/schema/commonModule.schema'
import { Department } from 'src/models/department'
import { PlaceOffline, PlaceOnline, ScheduleItem } from 'src/models/event'
import { EventStatus } from 'src/models/eventStatus'
import { EventTag } from 'src/models/eventTag'
import { EventType } from 'src/models/eventType'
import { Executor, Inspector, Participant } from 'src/models/users'

export class GetEventMinimizeSchema {
  id: number
  tags: EventTag[]
  status: EventStatus
  department: Department
  schedule: ScheduleItem[]
  participantsCount: number
  places: (PlaceOffline | PlaceOnline)[]
  date?: Date
  name?: string
  type?: EventType
  image?: GetFileStatsSchema
}

export class GetEventSchema extends GetEventMinimizeSchema {
  executors: Executor[]
  files: GetFileStatsSchema[]
  participants: Participant[]
  inspectorComments: GetCommentsSchema[]
  description?: string
  seatsNumber?: number
  inspector?: Inspector
}

export class GetEventTypeSchema {
  id: number
  name: string
}

export class GetEventStatusSchema {
  id: number
  name: string
}

export class GetEventTagSchema {
  id: number
  name: string
}
