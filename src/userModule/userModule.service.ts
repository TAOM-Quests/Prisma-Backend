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
  
  async authUserByToken(token: string): Promise<AuthUserSchema> {
    const foundUser = await this.prisma.users.findUnique({
      where: {
        token,
      },
    })

    if (!foundUser) {
      throw new NotFoundError(`User with token ${token} not found`)
    }

    const authUser: AuthUserSchema = {
      id: foundUser.id,
      email: foundUser.email,
      token: foundUser.token,
    }

    if (foundUser.id_role) {
      this.setRole(authUser, foundUser.id_role)
    }

    return authUser
  }

  async authUserByEmailAndPassword(userAuth: UserAuthDto): Promise<AuthUserSchema> {
    const foundUser = await this.prisma.users.findUnique({
      where: {
        email: userAuth.email,
      },
    })

    if (!foundUser) {
      throw new NotFoundError(`User with email ${userAuth.email} not found`)
    }

    if (await compare(userAuth.password, foundUser.password)) {
      const authUser: AuthUserSchema = {
        id: foundUser.id,
        email: foundUser.email,
        token: foundUser.token,
      }
  
      if (foundUser.id_role) {
        this.setRole(authUser, foundUser.id_role)
      }
  
      return authUser
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

    const isEmployee = !!foundUser.id_role

    const profile: GetUserProfileSchema = {
      id: foundUser.id,
      email: foundUser.email,
      firstName: foundUser.first_name,
      lastName: foundUser.last_name,
      patronymic: foundUser.patronymic,
      birthDate: foundUser.birth_date,
      sex: foundUser.sex,
      phoneNumber: foundUser.phone_number,
      completeQuests: [],
    }

    if (isEmployee) {
      this.setRole(profile, foundUser.id_role)

      const foundDepartment = await this.prisma.departments.findUnique({
        where: {
          id: foundUser.id_department,
        },
      })
      const foundPosition = await this.prisma.user_positions.findUnique({
        where: {
          id: foundUser.id_position,
        },
      })

      profile.department = {
        id: foundDepartment.id,
        name: foundDepartment.name,
      }

      profile.position = {
        id: foundPosition.id,
        name: foundPosition.name,
      }
    }

    return profile
  }

  private async setRole(entity, roleId) {
    const role = await this.prisma.user_roles.findUnique({
      where: {
        id: roleId,
      },
    })

    entity.role = {
      id: role.id,
      name: role.name,
    }
  }
}
