import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const DEPARTMENTS: Prisma.departmentsCreateManyInput[] = [
  { id: 1, name: 'Кафедра прикладной информатики и высшей математики' },
  { id: 2, name: 'Кафедра связей с общественностью' },
  { id: 3, name: 'Кафедра экономики и финансов' },
  { id: 4, name: 'Кафедра управления' },
  { id: 5, name: 'Кафедра дизайна' },
]

export const departments = async (): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    for (let department of DEPARTMENTS) {
      await tx.departments.upsert({
        where: { id: department.id },
        update: department,
        create: department,
      })
    }
  })
}
