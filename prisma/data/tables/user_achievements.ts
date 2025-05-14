import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const USER_ACHIEVEMENTS: Prisma.user_achievementsCreateManyInput[] = [
  {
    id: 1,
    name: 'Первое мероприятие',
    description: 'Зарегистрироваться на первое мероприятие',
    image_id: 7,
    experience: 500,
  },
  {
    id: 2,
    name: 'Первый квест',
    description: 'Пройти первый квест',
    image_id: 8,
    experience: 1000,
  },
]

export const userAchievements = async (): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    for (let achievement of USER_ACHIEVEMENTS) {
      await tx.user_achievements.upsert({
        where: { id: achievement.id },
        update: achievement,
        create: achievement,
      })
    }
  })
}
