import { GetDepartmentsSchema } from '../GetDepartmentsSchema'

export const getDepartmentsSchemaExample: GetDepartmentsSchema[] = [
  {
    id: 1,
    name: 'IT',
    image: {
      id: 1,
      name: 'image.png',
      size: 12345,
      originalName: 'image.png',
      extension: 'png',
      url: 'https://localhost:3000/commonModule/file?fileName=image.png',
    },
    description: 'IT department',
  },
  {
    id: 2,
    name: 'IT',
    image: {
      id: 1,
      name: 'image.png',
      size: 12345,
      originalName: 'image.png',
      extension: 'png',
      url: 'https://localhost:3000/commonModule/file?fileName=image.png',
    },
    description: 'IT department',
  },
]
