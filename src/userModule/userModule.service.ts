import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import {
  AuthUserSchema,
  GetPositionsSchema,
  GetRolesSchema,
  GetUserProfileSchema,
  GetUsersSchema,
  UpdateUserProfileSchema,
} from './schema/userModule.schema'
import {
  ConfirmEmailCodeDto,
  CreateEmailConfirmCodeDto,
  GetUsersQuery,
  UpdateProfileDto,
  UserAuthDto,
} from './dto/userModule.dto'
import { genSaltSync, hashSync, compare } from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { NotFoundError } from 'src/errors/notFound'
import { BadRequestError } from 'src/errors/badRequest'
import { Prisma, user_sex } from '@prisma/client'
import { FilesService } from 'src/commonModule/files/files.service'
import { sendEmail } from 'src/services/notifier/common/sendEmail'
import * as moment from 'moment'
import { readFileSync } from 'fs'
import * as path from 'path'
import { intersection } from 'lodash'

const USER_SEX = {
  MALE: 'Мужской',
  FEMALE: 'Женский',
}

const ROLE_ADMIN_ID = 1
const ROLES_INSPECTOR_IDS = [2]
const ROLES_EMPLOYEE_IDS = [2, 3]
const ROLES_GAME_MASTER_IDS = [4]
const EMAIL_CONFIRM_TIMEOUT = 1000 * 60 * 60 //Минута

@Injectable()
export class UserModuleService {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
    private filesService: FilesService,
  ) {}

  async getUsers(getUsers: GetUsersQuery): Promise<GetUsersSchema[]> {
    const where: Prisma.usersWhereInput = {}

    if (getUsers.id) where.id = getUsers.id
    if (getUsers.email) where.email = getUsers.email
    if (getUsers.rolesIds)
      where.roles = { some: { id: { in: getUsers.rolesIds } } }
    if (getUsers.positionId) where.id_position = getUsers.positionId
    if (getUsers.departmentId) where.id_department = getUsers.departmentId
    if (getUsers.isAdmin) where.roles = { some: { id: ROLE_ADMIN_ID } }
    if (getUsers.isEmployee)
      where.roles = { some: { id: { in: ROLES_EMPLOYEE_IDS } } }

    const users = await this.prisma.users.findMany({
      where,
      take: getUsers.limit,
      skip: getUsers.offset,
    })

    return Promise.all(
      users.map(async (user) => {
        const resultUser: GetUsersSchema = {
          id: user.id,
          name: (user.first_name + ' ' + user.last_name).trim(),
          image: await this.filesService.getFileStats({
            id: user.id_image_file,
          }),
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

  async sendConfirmationEmail({
    email,
  }: CreateEmailConfirmCodeDto): Promise<void> {
    const code = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')
    const letterText = readFileSync(
      path.join(process.cwd(), 'src/views/email/emailConfirmView.txt'),
      'utf8',
    ).replace('%confirmation_code%', code)
    const letterHtml = readFileSync(
      path.join(process.cwd(), 'src/views/email/emailConfirmView.html'),
      'utf8',
    ).replace('%confirmation_code%', code)

    await this.prisma.user_email_confirm.create({
      data: {
        email,
        code,
      },
    })

    await sendEmail({
      to: email,
      subject: 'Confirmation code',
      text: letterText,
      html: letterHtml,
    })
  }

  async confirmEmail({ email, code }: ConfirmEmailCodeDto): Promise<boolean> {
    const foundCode = await this.prisma.user_email_confirm.findFirst({
      where: {
        email,
        created_at: {
          gte: moment().subtract(EMAIL_CONFIRM_TIMEOUT).toDate(),
          lte: moment().toDate(),
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    return foundCode?.code === code.toString().padStart(4, '0')
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
      image: await this.filesService.getFileStats({
        id: createdUser.id_image_file,
      }),
      name: `${createdUser.first_name ?? ''} ${createdUser.last_name ?? ''}`.trim(),
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
      image: await this.filesService.getFileStats({
        id: foundUser.id_image_file,
      }),
    }

    const foundRoles = await this.prisma.user_roles.findMany({
      where: { users: { some: { id: foundUser.id } } },
    })

    if (foundRoles.length) {
      const rolesIds = foundRoles.map((role) => role.id)

      authUser.rolesIds = rolesIds
      authUser.departmentId = foundUser.id_department
      authUser.isAdmin = rolesIds.includes(ROLE_ADMIN_ID)
      authUser.isEmployee = !!intersection(rolesIds, ROLES_EMPLOYEE_IDS).length
      authUser.isGameMaster = !!intersection(rolesIds, ROLES_GAME_MASTER_IDS)
        .length
      authUser.isInspector = !!intersection(rolesIds, ROLES_INSPECTOR_IDS)
        .length
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
        image: await this.filesService.getFileStats({
          id: foundUser.id_image_file,
        }),
      }

      const foundRoles = await this.prisma.user_roles.findMany({
        where: { users: { some: { id: foundUser.id } } },
      })

      if (foundRoles.length) {
        const rolesIds = foundRoles.map((role) => role.id)

        authUser.rolesIds = rolesIds
        authUser.departmentId = foundUser.id_department
        authUser.isAdmin = rolesIds.includes(ROLE_ADMIN_ID)
        authUser.isEmployee = !!intersection(rolesIds, ROLES_EMPLOYEE_IDS)
          .length
        authUser.isGameMaster = !!intersection(rolesIds, ROLES_GAME_MASTER_IDS)
          .length
        authUser.isInspector = !!intersection(rolesIds, ROLES_INSPECTOR_IDS)
          .length
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
    const foundLevel = await this.prisma.user_levels.findUnique({
      where: { level: foundUser.level_number },
    })
    const foundNextLevel = await this.prisma.user_levels.findUnique({
      where: { level: foundUser.level_number + 1 },
    })
    const foundAchievements = await this.prisma.user_achievements.findMany({
      where: { users: { some: { id: foundUser.id } } },
    })
    const foundRoles = await this.prisma.user_roles.findMany({
      where: { users: { some: { id: foundUser.id } } },
    })

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
      image: await this.filesService.getFileStats({
        id: foundUser.id_image_file,
      }),
      level: {
        name: foundLevel.name,
        number: foundLevel.level,
        experience: foundUser.experience,
        experienceToNextLevel: foundNextLevel.experience,
      },
      achievements: await Promise.all(
        (await this.prisma.user_achievements.findMany()).map(async (ach) => ({
          id: ach.id,
          name: ach.name,
          experience: ach.experience,
          description: ach.description,
          image: await this.filesService.getFileStats({ id: ach.image_id }),
          isReceived: !!foundAchievements.find((a) => a.id === ach.id),
        })),
      ),
    }

    if (foundRoles.length) {
      profile.roles = foundRoles.map((role) => ({
        id: role.id,
        name: role.name,
      }))

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

    return this.getUserProfileById(id)
  }

  async getRoles(): Promise<GetRolesSchema[]> {
    const foundRoles = await this.prisma.user_roles.findMany()

    return foundRoles.map((role) => ({
      id: role.id,
      name: role.name,
    }))
  }

  async getPositions(): Promise<GetPositionsSchema[]> {
    const foundPositions = await this.prisma.user_positions.findMany()

    return foundPositions.map((position) => ({
      id: position.id,
      name: position.name,
    }))
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

    if (updatedFields.includes('email')) {
      result.email = updateProfile.email
    }
    if (updatedFields.includes('firstName')) {
      result.first_name = updateProfile.firstName
    }
    if (updatedFields.includes('lastName')) {
      result.last_name = updateProfile.lastName
    }
    if (updatedFields.includes('patronymic')) {
      result.patronymic = updateProfile.patronymic
    }
    if (updatedFields.includes('birthDate')) {
      result.birth_date = updateProfile.birthDate
    }
    if (updatedFields.includes('sex')) {
      if (updateProfile.sex) {
        result.sex = userSex as user_sex
      } else {
        result.sex = null
      }
    }
    if (updatedFields.includes('phoneNumber')) {
      result.phone_number = updateProfile.phoneNumber
    }
    if (updatedFields.includes('telegram')) {
      result.telegram = updateProfile.telegram
    }
    if (updatedFields.includes('imageId')) {
      result.image = { connect: { id: updateProfile.imageId ?? 1 } }
    }
    if (updatedFields.includes('rolesIds')) {
      result.roles = { set: updateProfile.rolesIds.map((id) => ({ id })) }
    }
    if (updatedFields.includes('positionId')) {
      if (updateProfile.positionId) {
        result.position = { connect: { id: updateProfile.positionId } }
      } else {
        result.position = { disconnect: true }
      }
    }
    if (updatedFields.includes('departmentId')) {
      if (updateProfile.departmentId) {
        result.department = { connect: { id: updateProfile.departmentId } }
      } else {
        result.department = { disconnect: true }
      }
    }

    return result
  }
}
