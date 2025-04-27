import { Prisma, PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const QUESTION_TYPES: Prisma.questions_typesCreateManyInput[] = [
  { id: 1, name: 'Одиночный выбор' },
  { id: 2, name: 'Множественный выбор' },
  { id: 3, name: 'Связывание' },
  { id: 4, name: 'Сортировка' },
  { id: 5, name: 'Свободный ответ' },
]

export const questionsTypes = async (): Promise<void> => {
  await prisma.$transaction(async tx => {
    for (let type of QUESTION_TYPES) {
      await tx.questions_types.upsert({
        where: { id: type.id },
        update: type,
        create: type
      })
    }
  })
}