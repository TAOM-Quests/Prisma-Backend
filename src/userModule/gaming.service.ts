import { Injectable } from '@nestjs/common'
import { CommonModuleService } from 'src/commonModule/commonModule.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { NotificationsGateway } from './notifications.gateway'
import e from 'express'

type ExperienceSource = 'quests' | 'events' | 'games' | 'achievements'

export const ACHIEVEMENTS_MAP = {
  FIRST_EVENT_REGISTER: 1,
  FIRST_QUEST_COMPLETE: 2,
}

@Injectable()
export class GamingService {
  constructor(
    private prisma: PrismaService,
    private commonModuleService: CommonModuleService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async addExperience(
    id: number,
    experience: number,
    experienceSource: ExperienceSource,
    departmentId?: number,
  ) {
    const foundUser = await this.prisma.users.findUnique({
      where: { id },
    })
    let userExperience = foundUser.experience
    const foundImage =
      await this.commonModuleService.getFileStats('add_experience.png')

    this.notificationsGateway.sendNotification({
      type: experienceSource,
      name: 'Новый опыт',
      description: `Вы получили ${experience} опыта`,
      imageUrl: foundImage.url,
    })

    if (departmentId) {
      this.addExperienceByDepartment(id, experience, departmentId)
    }

    while (experience > 0) {
      const nextLevel = await this.prisma.user_levels.findUnique({
        where: { level: foundUser.level_number + 1 },
      })

      if (experience + userExperience >= nextLevel.experience) {
        await this.levelUp(id, foundUser.level_number + 1)
        userExperience = 0
        experience -= nextLevel.experience
      } else {
        await this.prisma.users.update({
          where: { id },
          data: {
            experience: userExperience + experience,
          },
        })
        experience = 0
      }
    }
  }

  async addAchievement(id: number, achievement: keyof typeof ACHIEVEMENTS_MAP) {
    const achievementId = ACHIEVEMENTS_MAP[achievement]
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

      await this.addExperience(id, foundAchievement.experience, 'achievements')
    }
  }

  private async levelUp(userId: number, nextLevelNumber: number) {
    const currentLevel = await this.prisma.user_levels.findUnique({
      where: { level: nextLevelNumber - 1 },
    })
    const nextLevel = await this.prisma.user_levels.findUnique({
      where: { level: nextLevelNumber },
    })

    await this.prisma.users.update({
      where: { id: userId },
      data: {
        level_number: nextLevelNumber,
        experience: 0,
      },
    })

    const foundImage =
      await this.commonModuleService.getFileStats('level_up.png')

    this.notificationsGateway.sendNotification({
      type: 'levelUp',
      name: 'Новый уровень',
      description: `Ваш уровень повышен до ${nextLevelNumber}
        ${currentLevel.name !== nextLevel.name ? `, теперь вы ${nextLevel.name}` : ''}`,
      imageUrl: foundImage.url,
    })
  }

  private async addExperienceByDepartment(
    userId: number,
    experience: number,
    departmentId: number,
  ) {
    const foundExperienceByDepartment =
      await this.prisma.user_experience.findUnique({
        where: {
          user_id_department_id: {
            user_id: userId,
            department_id: departmentId,
          },
        },
      })

    await this.prisma.user_experience.upsert({
      where: {
        user_id_department_id: { user_id: userId, department_id: departmentId },
      },
      create: { user_id: userId, department_id: departmentId, experience },
      update: {
        experience: foundExperienceByDepartment.experience + experience,
      },
    })
  }
}
