import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const EVENT_STATUSES: Prisma.event_statusesCreateManyInput[] = [
  { id: 1, name: 'Черновик' },
  { id: 2, name: 'Ожидает нормального названия статуса' },
  { id: 3, name: 'На утверждении' },
  { id: 4, name: 'На доработке' },
  { id: 5, name: 'Утверждено' },
  { id: 6, name: 'Архив' },
]

export const eventStatuses = async (): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    for (let status of EVENT_STATUSES) {
      await tx.event_statuses.upsert({
        where: { id: status.id },
        update: status,
        create: status,
      })
    }
  })
}
