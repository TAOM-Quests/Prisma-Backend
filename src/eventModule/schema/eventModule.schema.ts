import { JsonArray } from "@prisma/client/runtime/library"
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
}

export class GetEventSchema {
  id: number
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
}

export class PostEventSchema {
  name: string
  description: string
  date: Date
  seatsNumber: number
  places: (PlaceOnline | PlaceOffline)[]
  schedule: ScheduleItem[]
  executorsIds: number[]
  statusId: number
  type: number
  departmentId: number
}

export class GetEventTypeSchema {
  id: number
  name: string
}

export class GetEventStatusSchema {
  id: number
  name: string
}