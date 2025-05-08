import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const USER_POSITIONS: Prisma.user_positionsCreateManyInput[] = [
  { id: 1, name: 'Заведующий кафедрой', description: '' },
  { id: 2, name: 'Преподаватель', description: '' },
]

export const userPositions = async (): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    for (let position of USER_POSITIONS) {
      await tx.user_positions.upsert({
        where: { id: position.id },
        update: position,
        create: position,
      })
    }
  })
}
