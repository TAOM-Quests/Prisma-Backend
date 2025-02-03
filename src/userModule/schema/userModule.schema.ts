import { Department } from "src/models/department"
import { QuestMinimize } from "src/models/QuestMinimize"
import { UserRole } from "src/models/userRole"

export class CreateUserSchema {
    id: number
    email: string
    token: string
}

export class GetUserProfileSchema {
    id: number
    name: string
    surname: string
    email: string
    department: Department
    role: UserRole
    completeQuests: QuestMinimize[]
}