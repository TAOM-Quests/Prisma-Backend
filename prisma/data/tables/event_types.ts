import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const EVENT_TYPES: Prisma.event_statusesCreateManyInput[] = [
  { id: 1, name: 'Конкурс' },
  { id: 2, name: 'День открытых дверей' },
  { id: 3, name: 'Экспресс-курс' },
  { id: 4, name: 'Олимпиада' },
  { id: 5, name: 'Чемпионат' },
  { id: 6, name: 'Бизнес-игра' },
  { id: 7, name: 'Мастер-класс' },
]

export const eventTypes = async (): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    for (let type of EVENT_TYPES) {
      await tx.event_types.upsert({
        where: { id: type.id },
        update: type,
        create: type,
      })
    }
  })
}
