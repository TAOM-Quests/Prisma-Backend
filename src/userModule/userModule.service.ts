import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import {
  AuthUserSchema,
  GetUserProfileSchema,
} from './schema/userModule.schema'
import { UserAuthDto } from './dto/userModule.dto'
import { genSaltSync, hashSync, compare } from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { NotFoundError } from 'src/errors/notFound'
import { BadRequestError } from 'src/errors/badRequest'

@Injectable()
export class UserModuleService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async createUser(userAuth: UserAuthDto): Promise<AuthUserSchema> {
    const saltRounds = 10
    const salt = genSaltSync(saltRounds)
    const hashedPassword = hashSync(userAuth.password, salt)
    
    const token = await this.jwt.signAsync({
      sun: userAuth.email
    })

    const foundUser = await this.prisma.users.findUnique({
      where: {
        email: userAuth.email,
      },
    })

    if (foundUser) {
      throw new BadRequestError(`User with email ${userAuth.email} already exist`)
    }

    const createdUser = await this.prisma.users.create({
      data: {
        email: userAuth.email,
        password: hashedPassword,
        token
      },
    })

    return {
      id: createdUser.id,
      email: createdUser.email,
      token,
    }
  }

  async authUser(userAuth: UserAuthDto): Promise<AuthUserSchema> {
    const foundUser = await this.prisma.users.findUnique({
      where: {
        email: userAuth.email,
      },
    })

    if (!foundUser) {
      throw new NotFoundError(`User with  email ${userAuth.email} not found`)
    }

    if (await compare(foundUser.password, userAuth.password)) {
      return foundUser as AuthUserSchema
    } else {
      throw new BadRequestError(`Password not compare for user (${foundUser.id})`)
    }    
  }

  async getUserProfileById(id: number): Promise<GetUserProfileSchema> {
    const foundUser = await this.prisma.users.findUniqueOrThrow({
      where: {
        id,
      },
    })
    const foundDepartment = await this.prisma.departments.findUnique({
      where: {
        id: foundUser.id_department,
      },
    })
    const foundUserRole = await this.prisma.user_roles.findUnique({
      where: {
        id: foundUser.id_role,
      },
    })

    return {
      id: foundUser.id,
      name: foundUser.name,
      surname: foundUser.surname,
      email: foundUser.email,
      department: {
        id: foundDepartment.id,
        name: foundDepartment.name,
      },
      role: {
        id: foundUserRole.id,
        name: foundUserRole.name,
      },
      completeQuests: [],
    }
  }
}
