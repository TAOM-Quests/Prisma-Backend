import { JsonArray } from "@prisma/client/runtime/library"
import { GetFileStatsSchema } from "src/commonModule/schema/commonModule.schema"
import { Department } from "src/models/department"
import { PlaceOffline, PlaceOnline, ScheduleItem } from "src/models/event"
import { EventStatus } from "src/models/eventStatus"
import { EventType } from "src/models/eventType"
import { Executor, Inspector, Participant } from "src/models/users"

export class GetEventMinimizeSchema {
  id: number
  name: string
  date: Date
  places: JsonArray
  status: EventStatus
  type: EventType
  image: GetFileStatsSchema
  schedule: ScheduleItem[]
}

export class GetEventSchema {
  id: number
  department: Department
  name: string
  description: string
  date: Date
  seatsNumber: number
  inspector: Inspector
  executors: Executor[]
  participants: Participant[]
  places: (PlaceOffline | PlaceOnline)[]
  schedule: ScheduleItem[]
  type: EventType
  status: EventStatus
  image: GetFileStatsSchema
  files: GetFileStatsSchema[]
}

export class GetEventTypeSchema {
  id: number
  name: string
}

export class GetEventStatusSchema {
  id: number
  name: string
}