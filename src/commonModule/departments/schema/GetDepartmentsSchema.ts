import { GetFileStatsSchema } from 'src/commonModule/files/schema/GetFileStatsSchema'

export class GetDepartmentsSchema {
  id: number
  name: string
  description: string
  image: GetFileStatsSchema
}
