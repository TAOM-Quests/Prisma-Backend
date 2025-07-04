import { GetFileStatsSchema } from 'src/commonModule/files/schema/GetFileStatsSchema'

export interface User {
  id: number
  name: string
  image?: GetFileStatsSchema
}

export interface Participant extends User {}

export interface Employee extends User {
  position: string
}

export interface Inspector extends Employee {}

export interface Executor extends Employee {}
