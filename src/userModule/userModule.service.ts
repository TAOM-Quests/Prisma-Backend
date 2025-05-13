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
import { NotificationsGateway } from './notifications.gateway'

const USER_SEX = {
  MALE: 'Мужской',
  FEMALE: 'Женский',
}

@Injectable()
export class UserModuleService {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
    private commonModuleService: CommonModuleService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async getUsers(getUsers: GetUsersQuery): Promise<GetUsersSchema[]> {
    const where: Prisma.usersWhereInput = {}

    if (getUsers.id) where.id = getUsers.id
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
      authUser.roleId = foundUser.id_role
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
        authUser.roleId = foundUser.id_role
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
    const foundLevel = await this.prisma.user_levels.findUnique({
      where: { level: foundUser.level_number },
    })
    const foundAchievements = await this.prisma.user_achievements.findMany({
      where: { users: { some: { id: foundUser.id } } },
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
      level: {
        name: foundLevel.name,
        number: foundLevel.level,
        experience: foundUser.experience,
      },
      achievements: await Promise.all(
        (await this.prisma.user_achievements.findMany()).map(async (ach) => ({
          id: ach.id,
          name: ach.name,
          experience: ach.experience,
          description: ach.description,
          image: await this.commonModuleService.getFileStatsById(ach.image_id),
          isReceived: !!foundAchievements.find((a) => a.id === ach.id),
        })),
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

  async addExperience(id: number, experience: number, departmentId?: number) {
    const foundUser = await this.prisma.users.findUnique({
      where: { id },
    })
    const currentLevel = await this.prisma.user_levels.findUnique({
      where: { level: foundUser.level_number },
    })
    const nextLevel = await this.prisma.user_levels.findUnique({
      where: { level: foundUser.level_number + 1 },
    })

    await this.prisma.users.update({
      data: {
        level_number: foundUser.level_number + 1,
        experience: 0,
      },
      where: { id },
    })

    if (departmentId) {
      const foundExperienceByDepartment =
        await this.prisma.user_experience.findUnique({
          where: {
            user_id_department_id: { user_id: id, department_id: departmentId },
          },
        })

      await this.prisma.user_experience.upsert({
        where: {
          user_id_department_id: { user_id: id, department_id: departmentId },
        },
        create: { user_id: id, department_id: departmentId, experience },
        update: {
          experience: foundExperienceByDepartment.experience + experience,
        },
      })
    }

    if (experience + foundUser.experience >= nextLevel.experience) {
      const nextExperience =
        experience + foundUser.experience - nextLevel.experience
      const foundImage =
        await this.commonModuleService.getFileStats('level_up.png')

      this.notificationsGateway.sendNotification({
        type: 'levelUp',
        name: 'Новый уровень',
        description: `Ваш уровень повышен до ${foundUser.level_number + 1}${currentLevel.name !== nextLevel.name ? `, теперь вы ${nextLevel.name}` : ''}`,
        imageUrl: foundImage.url,
      })

      await this.addExperience(id, nextExperience, departmentId)
    }
  }

  async addAchievement(id: number, achievementId: number) {
    const userAchievements = await this.prisma.user_achievements.findMany({
      where: { users: { some: { id } } },
    })
    const foundAchievement = await this.prisma.user_achievements.findUnique({
      where: { id: achievementId },
    })
    const foundImage = await this.commonModuleService.getFileStatsById(
      foundAchievement.image_id,
    )

    if (!userAchievements.find((a) => a.id === achievementId)) {
      await this.prisma.users.update({
        where: { id },
        data: {
          achievements: {
            connect: { id: achievementId },
          },
        },
      })

      this.notificationsGateway.sendNotification({
        type: 'achievement',
        name: 'Получено достижение',
        description: `Вы получили достижение ${foundAchievement.name}`,
        imageUrl: foundImage.url,
      })

      await this.addExperience(id, foundAchievement.experience)
    }
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
      result.sex = userSex as user_sex
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

    return result
  }
}
