export class GetDepartmentsSchema {
  id: number
  name: string
}

export class GetFileStatsSchema {
  id: number
  url: string
  name: string
  size: number
  extension: string
  originalName: string
}