import { Department } from "src/models/department"
import { PlaceOffline, PlaceOnline } from "src/models/event"
import { EventStatus } from "src/models/eventStatus"
import { EventType } from "src/models/eventType"
import { Executor, Inspector, Participant } from "src/models/users"

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
  type: EventType
  status: EventStatus
  department: Department
}