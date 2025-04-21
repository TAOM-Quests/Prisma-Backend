export interface Event {
  id: number
  name: string
  description: string
  date: Date
  seatsNumber: number
  inspectorComments: string[]
  places: (PlaceOnline | PlaceOffline)[]
  schedule: ScheduleItem[]
  executorsIds: number[]
  participantsIds: number[]
  inspectorId: number
  statusId: number
  typeId: number
  departmentId: number
}

interface Place {
  isOnline: boolean
}

export interface PlaceOnline extends Place {
  connectionLink: string
  identifier: string
  accessCode: string
  recordLink: string
  platform: string
}

export interface PlaceOffline extends Place {
  address: string
  officeNumber: string
  floor: number
}

export interface ScheduleItem {
  timeStart: Date
  timeEnd: Date
}
