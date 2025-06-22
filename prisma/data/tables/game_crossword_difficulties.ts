import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const CROSSWORD_DIFFICULTIES: Prisma.game_crossword_difficultiesCreateManyInput[] =
  [
    { id: 1, name: 'Легкий', experience: 300 },
    { id: 2, name: 'Средний', experience: 700 },
    { id: 3, name: 'Сложный', experience: 1200 },
  ]

export const crosswordDifficulties = async (): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    for (let difficulty of CROSSWORD_DIFFICULTIES) {
      await tx.game_crossword_difficulties.upsert({
        where: { id: difficulty.id },
        update: difficulty,
        create: difficulty,
      })
    }
  })
}
