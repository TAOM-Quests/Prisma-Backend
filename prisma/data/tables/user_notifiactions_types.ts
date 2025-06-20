import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const NOTIFICATIONS_TYPES: Prisma.user_notifications_typesCreateManyInput[] = [
  { id: 1, name: 'Напоминание о мероприятии за день' },
  { id: 2, name: 'Напоминание об обратной связи' },
  { id: 3, name: 'Напоминание о проверке мероприятия', roles: [1, 3] },
  { id: 4, name: 'Напоминание об отклоненном мероприятии', roles: [1, 2, 3] },
]

export const notificationsTypes = async (): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    for (let type of NOTIFICATIONS_TYPES) {
      await tx.user_notifications_types.upsert({
        where: { id: type.id },
        update: type,
        create: type,
      })
    }
  })
}
