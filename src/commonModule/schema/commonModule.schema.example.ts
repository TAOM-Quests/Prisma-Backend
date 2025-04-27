import { GetFileStatsSchema } from "./commonModule.schema";

export const getDepartmentsSchemaExample = [
  {
    id: 1,
    name: 'IT',
  },
  {
    id: 2,
    name: 'Design',
  },
]

export const getFileStatsSchemaExample: GetFileStatsSchema = {
  name: '1744810610173-320802287.png',
  size: 1024,
  extension: 'png',
  id: 1,
  originalName: 'test',
  url: 'https://localhost:3000/commonModule/file?fileName=1744810610173-320802287.png'
}