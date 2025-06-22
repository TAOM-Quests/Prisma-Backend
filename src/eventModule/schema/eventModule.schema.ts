import { GetCommentsSchema } from 'src/commonModule/comments/schema/GetCommentsSchema'
import { GetDepartmentsSchema } from 'src/commonModule/departments/schema/GetDepartmentsSchema'
import { GetFileStatsSchema } from 'src/commonModule/files/schema/GetFileStatsSchema'
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
  schedule: ScheduleItem[]
  participantsCount: number
  department: GetDepartmentsSchema
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
