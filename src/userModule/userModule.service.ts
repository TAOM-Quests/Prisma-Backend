import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { GetUserProfileSchema } from "./userModule.schema";

@Injectable()
export class UserModuleService {
    constructor (
        private prisma: PrismaService
    ){}

    async getUserProfileById(id: number): Promise<GetUserProfileSchema> {
        const foundUser = await this.prisma.user.findUniqueOrThrow({
            where: {
                id
            }
        })
        const foundDepartment = await this.prisma.department.findUnique({
            where: {
                id: foundUser.departmentId
            }
        })
        const foundUserRole = await this.prisma.userRole.findUnique({
            where: {
                id: foundUser.roleId
            }
        })

        return {
            id: foundUser.id,
            name: foundUser.name,
            surname: foundUser.surname,
            email: foundUser.email,
            department: foundDepartment,
            role: foundUserRole,
            completeQuests: []
        }
    }
}