import { GetFormSchema } from '../GetFormSchema'

export const getFormSchemaExample: GetFormSchema = {
  id: 1,
  name: 'IT Open Doors',
  description: 'Thanks for your feedback',
  questions: [
    {
      type: 'free',
      question: 'What is your age?',
    },
  ],
}
