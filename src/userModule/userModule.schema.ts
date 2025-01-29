import { Department, UserRole } from "@prisma/client"
import { QuestMinimize } from "src/models/QuestMinimize"

export interface GetUserProfileSchema {
    id: number
    name: string,
    surname: string,
    email: string,
    department: Department,
    role: UserRole,
    completeQuests: QuestMinimize[]
}