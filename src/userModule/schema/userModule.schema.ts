import { Department } from 'src/models/department'
import { QuestMinimize } from 'src/models/QuestMinimize'
import { UserRole } from 'src/models/userRole'

export class AuthUserSchema {
  id: number
  email: string
  token: string
  role?: UserRole
}

export class GetUserProfileSchema {
  id: number
  name: string
  surname: string
  email: string
  completeQuests: QuestMinimize[]
  role?: UserRole
  department?: Department
}
