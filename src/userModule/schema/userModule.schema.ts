import { Department } from 'src/models/department'
import { QuestMinimize } from 'src/models/QuestMinimize'
import { UserPosition } from 'src/models/userPosition'
import { UserRole } from 'src/models/userRole'

export class AuthUserSchema {
  id: number
  email: string
  token: string
  role?: UserRole
}

export class GetUserProfileSchema {
  id: number
  email: string
  firstName: string
  lastName: string
  patronymic: string
  birthDate: Date
  sex: string
  phoneNumber: string
  completeQuests: QuestMinimize[]
  role?: UserRole
  position?: UserPosition
  department?: Department
}

export class UpdateUserProfileSchema {
  id: number
  email: string
  firstName: string
  lastName: string
  patronymic: string
  birthDate: Date
  sex: string
  phoneNumber: string
}