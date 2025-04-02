export interface Event {
  id: number
  name: string
  description: string
  date: Date
  seatsNumber: number
  inspectorComments: string[]
  places: Place[]
  schedule: ScheduleItem[]
  executorsIds: number[]
  participantsIds: number[]
  inspectorId: number
  statusId: number
  typeId: number
  departmentId: number
}

export interface Place {
  isOnline: boolean
}

export interface PlaceOnline
extends Place {
  connectionLink: string
  identifier: string
  accessCode: string
  recordLink: string
}

export interface PlaceOffline
extends Place {
  address: string
  officeNumber: string
  floor: number
}

export interface ScheduleItem {
  timeStart: Date
  timeEnd: Date
}