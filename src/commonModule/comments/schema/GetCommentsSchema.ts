import { GetUsersSchema } from 'src/userModule/schema/userModule.schema'

export class GetCommentsSchema {
  text: string
  createdAt: Date
  user: GetUsersSchema
}
