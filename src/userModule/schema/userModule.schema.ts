import { GetDepartmentsSchema } from 'src/commonModule/departments/schema/GetDepartmentsSchema'
import { GetFileStatsSchema } from 'src/commonModule/files/schema/GetFileStatsSchema'
import { UserPosition } from 'src/models/userPosition'
import { UserRole } from 'src/models/userRole'

export class GetUsersSchema {
  id: number
  name: string
  image: GetFileStatsSchema
  position?: string
}

export class AuthUserSchema {
  id: number
  email: string
  token: string
  image: GetFileStatsSchema
  name?: string
  isAdmin?: boolean
  rolesIds?: number[]
  isEmployee?: boolean
  departmentId?: number
  isInspector?: boolean
  isGameMaster?: boolean
}

export class GetUserProfileSchema {
  id: number
  email: string
  image: GetFileStatsSchema
  sex?: string
  birthDate?: Date
  lastName?: string
  telegram?: string
  firstName?: string
  roles?: UserRole[]
  patronymic?: string
  phoneNumber?: string
  position?: UserPosition
  department?: GetDepartmentsSchema
  level: {
    name: string
    number: number
    experience: number
    experienceToNextLevel: number
  }
  achievements: {
    id: number
    name: string
    experience: number
    description: string
    image: GetFileStatsSchema
    isReceived?: boolean
  }[]
  notificationsSettings: GetUserNotificationSettingsItemSchema[]
}

export class UpdateUserProfileSchema {
  id: number
  image: GetFileStatsSchema
  sex?: string
  email?: string
  birthDate?: Date
  lastName?: string
  telegram?: string
  firstName?: string
  patronymic?: string
  phoneNumber?: string
}

export class GetRolesSchema {
  id: number
  name: string
}

export class GetPositionsSchema {
  id: number
  name: string
}

export class GetUserNotificationSettingsItemSchema {
  name: string
  email: boolean
  typeId: number
  telegram: boolean
}

export class GetUserExperienceSchema {
  rank: number
  experience: number
  user: GetUsersSchema
  department: GetDepartmentsSchema
}
