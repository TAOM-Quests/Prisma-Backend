import { Department } from "src/models/department"
import { QuestMinimize } from "src/models/QuestMinimize"
import { UserRole } from "src/models/userRole"

export interface CreateUserSchema {
    id: number
    email: string
    token: string
}

export interface GetUserProfileSchema {
    id: number
    name: string,
    surname: string,
    email: string,
    department: Department,
    role: UserRole,
    completeQuests: QuestMinimize[]
}