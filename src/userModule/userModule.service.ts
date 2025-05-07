import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import {
  AuthUserSchema,
  GetUserProfileSchema,
  GetUsersSchema,
  UpdateUserProfileSchema,
} from './schema/userModule.schema'
import {
  GetUsersQuery,
  UpdateProfileDto,
  UserAuthDto,
} from './dto/userModule.dto'
import { genSaltSync, hashSync, compare } from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { NotFoundError } from 'src/errors/notFound'
import { BadRequestError } from 'src/errors/badRequest'
import { Prisma, user_sex } from '@prisma/client'
import { CommonModuleService } from 'src/commonModule/commonModule.service'

const USER_SEX = {
  MALE: 'Мужской',
  FEMALE: 'Женский',
}

@Injectable()
export class UserModuleService {
  constructor(
    private commonModuleService: CommonModuleService,
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async getUsers(getUsers: GetUsersQuery): Promise<GetUsersSchema[]> {
    const where: Prisma.usersWhereInput = {}

    if (getUsers.roleId) where.id_role = getUsers.roleId
    if (getUsers.positionId) where.id_position = getUsers.positionId
    if (getUsers.isAdmin) where.id_role = 1
    if (getUsers.isEmployee) where.id_role = { not: null }

    const users = await this.prisma.users.findMany({ where })

    return Promise.all(
      users.map(async (user) => {
        const resultUser: GetUsersSchema = {
          id: user.id,
          name: (user.first_name + ' ' + user.last_name).trim(),
          image: await this.commonModuleService.getFileStatsById(
            user.id_image_file,
          ),
        }

        if (user.id_position) {
          const foundPosition =
            await this.prisma.user_positions.findUniqueOrThrow({
              where: {
                id: user.id_position,
              },
            })

          resultUser.position = foundPosition.name
        }

        return resultUser
      }),
    )
  }

  async createUser(userAuth: UserAuthDto): Promise<AuthUserSchema> {
    const saltRounds = 10
    const salt = genSaltSync(saltRounds)
    const hashedPassword = hashSync(userAuth.password, salt)

    const token = await this.jwt.signAsync({
      sun: userAuth.email,
    })

    const foundUser = await this.prisma.users.findUnique({
      where: {
        email: userAuth.email,
      },
    })

    if (foundUser) {
      throw new BadRequestError(
        `User with email ${userAuth.email} already exist`,
      )
    }

    const createdUser = await this.prisma.users.create({
      data: {
        email: userAuth.email,
        password: hashedPassword,
        token,
      },
    })

    return {
      id: createdUser.id,
      email: createdUser.email,
      token,
      image: await this.commonModuleService.getFileStatsById(
        createdUser.id_image_file,
      ),
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
      name: `${foundUser.first_name ?? ''} ${foundUser.last_name ?? ''}`.trim(),
      image: await this.commonModuleService.getFileStatsById(
        foundUser.id_image_file,
      ),
    }

    if (foundUser.id_role) {
      authUser.isEmployee = true
      authUser.departmentId = foundUser.id_department
    }

    return authUser
  }

  async authUserByEmailAndPassword(
    userAuth: UserAuthDto,
  ): Promise<AuthUserSchema> {
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
        name: `${foundUser.first_name ?? ''} ${foundUser.last_name ?? ''}`.trim(),
        image: await this.commonModuleService.getFileStatsById(
          foundUser.id_image_file,
        ),
      }

      if (foundUser.id_role) {
        authUser.isEmployee = true
        authUser.departmentId = foundUser.id_department
      }

      return authUser
    } else {
      throw new BadRequestError(
        `Password not compare for user (${foundUser.id})`,
      )
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
      sex: USER_SEX[foundUser.sex],
      phoneNumber: foundUser.phone_number,
      telegram: foundUser.telegram,
      image: await this.commonModuleService.getFileStatsById(
        foundUser.id_image_file,
      ),
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

  async updateUserProfile(
    id: number,
    updateProfile: UpdateProfileDto,
  ): Promise<UpdateUserProfileSchema> {
    const foundUser = await this.prisma.users.findUnique({
      where: {
        id,
      },
    })

    if (!foundUser) {
      throw new NotFoundError(`User with id ${id} not found`)
    }

    const updatedUser = await this.prisma.users.update({
      data: {
        ...this.requestUpdateProfileToDbFields(updateProfile),
      },
      where: {
        id,
      },
    })

    const result: UpdateUserProfileSchema = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      patronymic: updatedUser.patronymic,
      birthDate: updatedUser.birth_date,
      sex: updatedUser.sex,
      phoneNumber: updatedUser.phone_number,
      telegram: updatedUser.telegram,
      image: await this.commonModuleService.getFileStatsById(
        updatedUser.id_image_file,
      ),
    }

    return result
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

  private requestUpdateProfileToDbFields(
    updateProfile: UpdateProfileDto,
  ): Prisma.usersUpdateInput {
    const result: Prisma.usersUpdateInput = {}
    const userSex = Object.keys(USER_SEX).find(
      (sex) => USER_SEX[sex] === updateProfile.sex,
    )
    const updatedFields = Object.keys(updateProfile)

    if (updateProfile.sex && !userSex) {
      throw new BadRequestError(`Sex ${updateProfile.sex} not found`)
    }

    if ('email' in updatedFields) {
      result.email = updateProfile.email
    }
    if ('firstName' in updatedFields) {
      result.first_name = updateProfile.firstName
    }
    if ('lastName' in updatedFields) {
      result.last_name = updateProfile.lastName
    }
    if ('patronymic' in updatedFields) {
      result.patronymic = updateProfile.patronymic
    }
    if ('birthDate' in updatedFields) {
      result.birth_date = updateProfile.birthDate
    }
    if ('sex' in updatedFields) {
      result.sex = userSex as user_sex
    }
    if ('phoneNumber' in updatedFields) {
      result.phone_number = updateProfile.phoneNumber
    }
    if ('telegram' in updatedFields) {
      result.telegram = updateProfile.telegram
    }
    if ('imageId' in updatedFields) {
      result.image = { connect: { id: updateProfile.imageId ?? 1 } }
    }

    return result
  }
}
