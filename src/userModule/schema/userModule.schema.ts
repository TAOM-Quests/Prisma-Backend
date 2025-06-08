import { GetFileStatsSchema } from 'src/commonModule/files/schema/GetFileStatsSchema'
import { Department } from 'src/models/department'
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
  roleId?: number
  isAdmin?: boolean
  isEmployee?: boolean
  departmentId?: number
}

export class GetUserProfileSchema {
  id: number
  email: string
  image: GetFileStatsSchema
  sex?: string
  role?: UserRole
  birthDate?: Date
  lastName?: string
  telegram?: string
  firstName?: string
  patronymic?: string
  phoneNumber?: string
  department?: Department
  position?: UserPosition
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
