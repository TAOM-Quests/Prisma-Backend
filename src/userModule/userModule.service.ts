import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateUserSchema, GetUserProfileSchema } from "./userModule.schema";
import { UserAuthDto } from "./userModule.dto";
import { genSaltSync, hashSync } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserModuleService {
    constructor (
        private prisma: PrismaService,
        private jwt: JwtService
    ){}

    async createUser(userAuth: UserAuthDto): Promise<CreateUserSchema> {
        const saltRounds = 10
        const salt = genSaltSync(saltRounds)
        const hashedPassword = hashSync(userAuth.password, salt)

        const createdUser = await this.prisma.users.create({
            data: {
                email: userAuth.email,
                password: hashedPassword,
            }
        })

        const token = await this.jwt.signAsync({
            sun: createdUser.id,
            username: createdUser.email
        })

        return {
            id: createdUser.id,
            email: createdUser.email,
            token
        }
    }

    async getUserProfileById(id: number): Promise<GetUserProfileSchema> {
        const foundUser = await this.prisma.users.findUniqueOrThrow({
            where: {
                id
            }
        })
        const foundDepartment = await this.prisma.departments.findUnique({
            where: {
                id: foundUser.id_department
            }
        })
        const foundUserRole = await this.prisma.user_roles.findUnique({
            where: {
                id: foundUser.id_role
            }
        })

        return {
            id: foundUser.id,
            name: foundUser.name,
            surname: foundUser.surname,
            email: foundUser.email,
            department: {
                id: foundDepartment.id,
                name: foundDepartment.name
            },
            role: {
                id: foundUserRole.id,
                name: foundUserRole.name
            },
            completeQuests: []
        }
    }
}