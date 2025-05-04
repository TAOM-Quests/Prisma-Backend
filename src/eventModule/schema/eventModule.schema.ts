import { GetFileStatsSchema } from 'src/commonModule/schema/commonModule.schema'
import { Department } from 'src/models/department'
import { PlaceOffline, PlaceOnline, ScheduleItem } from 'src/models/event'
import { EventStatus } from 'src/models/eventStatus'
import { EventType } from 'src/models/eventType'
import { Executor, Inspector, Participant } from 'src/models/users'

export class GetEventMinimizeSchema {
  id: number
  status: EventStatus
  schedule: ScheduleItem[]
  places: (PlaceOffline | PlaceOnline)[]
  date?: Date
  name?: string
  type?: EventType
  image?: GetFileStatsSchema
}

export class GetEventSchema extends GetEventMinimizeSchema {
  executors: Executor[]
  department: Department
  files: GetFileStatsSchema[]
  participants: Participant[]
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
