import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const USER_LEVELS: (Prisma.user_levelsCreateManyInput & { step?: number })[] = [
  { level: 1, name: 'Новичок', experience: 0, step: 100 },
  { level: 6, name: 'Продвинутый', experience: 600 },
  { level: 7, name: 'Продвинутый', experience: 700, step: 300 },
  { level: 10, name: 'Продвинутый', experience: 1500 },
  { level: 11, name: 'Эксперт', experience: 2000, step: 1000 },
  { level: 15, name: 'Эксперт', experience: 7000 },
  { level: 16, name: 'Мастер', experience: 8000 },
  { level: 17, name: 'Мастер', experience: 10_000, step: 5000 },
  { level: 20, name: 'Мастер', experience: 30_000 },
  { level: 21, name: 'Легенда Академии', experience: 40_000, step: 10_000 },
  { level: 23, name: 'Легенда Академии', experience: 80_000 },
  { level: 24, name: 'Легенда Академии', experience: 100_000, step: 40_000 },
  { level: 26, name: 'Грандмастер Академии', experience: 180_000 },
  {
    level: 27,
    name: 'Грандмастер Академии',
    experience: 250_000,
    step: 50_000,
  },
  {
    level: 30,
    name: 'Грандмастер Академии',
    experience: 500_000,
  },
]

export const userLevels = async (): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    let currentStep: number
    let nextLevelName: string
    let nextLevelExperience: number

    for (
      let levelNumber = 1;
      levelNumber <= Math.max(...USER_LEVELS.map((level) => level.level));
      levelNumber++
    ) {
      const nextLevel = USER_LEVELS.find((level) => level.level === levelNumber)

      if (nextLevel) {
        nextLevelName = nextLevel.name
        nextLevelExperience = nextLevel.experience
        currentStep = nextLevel.step ?? 0
      } else {
        nextLevelExperience += currentStep
      }

      await tx.user_levels.upsert({
        where: { level: levelNumber },
        update: { name: nextLevelName, experience: nextLevelExperience },
        create: {
          level: levelNumber,
          name: nextLevelName,
          experience: nextLevelExperience,
        },
      })
    }
  })
}
