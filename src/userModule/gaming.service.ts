import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { NotificationsGateway } from './notifications.gateway'
import { capitalize } from 'lodash'
import { FilesService } from 'src/commonModule/files/files.service'

type ExperienceSource = 'quests' | 'events' | 'games' | 'achievements'

export const ACHIEVEMENTS_MAP = {
  FIRST_EVENT_REGISTER: 1,
  FIRST_QUEST_COMPLETE: 2,
}

@Injectable()
export class GamingService {
  constructor(
    private prisma: PrismaService,
    private filesService: FilesService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async addExperience(
    userId: number,
    experience: number,
    experienceSource: ExperienceSource,
    departmentId?: number,
  ) {
    const foundUser = await this.prisma.users.findUnique({
      where: { id: userId },
    })
    const foundImage = await this.filesService.getFileStats({
      fileName: `${capitalize(experienceSource)}_experience.png`,
    })

    this.notificationsGateway.sendNotification({
      userId,
      type: experienceSource,
      name: 'Новый опыт',
      description: `Вы получили ${experience} опыта`,
      imageUrl: foundImage.url,
    })

    if (departmentId) {
      this.addExperienceByDepartment(userId, experience, departmentId)
    }

    let userLevel = foundUser.level_number
    let userExperience = foundUser.experience

    while (experience > 0) {
      const nextLevel = await this.prisma.user_levels.findUnique({
        where: { level: userLevel + 1 },
      })

      if (experience + userExperience >= nextLevel.experience) {
        await this.levelUp(userId, userLevel + 1)
        userLevel++
        userExperience = 0
        experience -= nextLevel.experience - userExperience
      } else {
        await this.prisma.users.update({
          where: { id: userId },
          data: {
            experience: userExperience + experience,
          },
        })
        experience = 0
      }
    }
  }

  async addAchievement(
    userId: number,
    achievement: keyof typeof ACHIEVEMENTS_MAP,
  ) {
    const achievementId = ACHIEVEMENTS_MAP[achievement]
    const userAchievements = await this.prisma.user_achievements.findMany({
      where: { users: { some: { id: userId } } },
    })
    const foundAchievement = await this.prisma.user_achievements.findUnique({
      where: { id: achievementId },
    })
    const foundImage = await this.filesService.getFileStats({
      id: foundAchievement.image_id,
    })

    if (!userAchievements.find((a) => a.id === achievementId)) {
      await this.prisma.users.update({
        where: { id: userId },
        data: {
          achievements: {
            connect: { id: achievementId },
          },
        },
      })

      this.notificationsGateway.sendNotification({
        userId,
        type: 'achievements',
        name: 'Получено достижение',
        description: `Вы получили достижение ${foundAchievement.name}`,
        imageUrl: foundImage.url,
      })

      await this.addExperience(
        userId,
        foundAchievement.experience,
        'achievements',
      )
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

    const foundImage = await this.filesService.getFileStats({
      fileName: 'Level_up.png',
    })

    this.notificationsGateway.sendNotification({
      userId,
      type: 'level_up',
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
    await this.prisma.user_experience.upsert({
      where: {
        user_id_department_id: { user_id: userId, department_id: departmentId },
      },
      create: { user_id: userId, department_id: departmentId, experience },
      update: {
        experience: { increment: experience },
      },
    })
  }
}
