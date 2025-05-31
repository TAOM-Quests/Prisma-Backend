import { GetFormQuestionSchema } from './GetFormQuestionSchema'

export class GetFormSchema {
  id: number
  name: string
  description: string
  questions: GetFormQuestionSchema[]
}
