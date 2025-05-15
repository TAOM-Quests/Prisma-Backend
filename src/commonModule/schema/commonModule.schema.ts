import { User } from 'src/models/users'
import { GetUsersSchema } from 'src/userModule/schema/userModule.schema'

export class GetDepartmentsSchema {
  id: number
  name: string
}

export class GetCommentsSchema {
  text: string
  createdAt: Date
  user: GetUsersSchema
}

export class GetFileStatsSchema {
  id: number
  url: string
  name: string
  size: number
  extension: string
  originalName: string
}
