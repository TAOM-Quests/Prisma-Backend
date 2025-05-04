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

export class GetEventSchema {
  id: number
  status: EventStatus
  executors: Executor[]
  department: Department
  schedule: ScheduleItem[]
  files: GetFileStatsSchema[]
  participants: Participant[]
  places: (PlaceOffline | PlaceOnline)[]
  date?: Date
  name?: string
  type?: EventType
  description?: string
  seatsNumber?: number
  inspector?: Inspector
  image?: GetFileStatsSchema
}

export class GetEventTypeSchema {
  id: number
  name: string
}

export class GetEventStatusSchema {
  id: number
  name: string
}
