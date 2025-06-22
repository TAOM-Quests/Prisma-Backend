import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const DEPARTMENTS: Prisma.departmentsCreateManyInput[] = [
  {
    id: 1,
    name: 'Кафедра прикладной информатики и высшей математики',
    description:
      'Обучаем созданию и внедрению современных IT-решений, цифровой трансформации и аналитике данных с опорой на фундаментальные математические знания.',
    id_image: 10,
  },
  {
    id: 2,
    name: 'Кафедра связей с общественностью',
    description:
      'Формируем профессионалов в области коммуникаций, PR и корпоративных медиа для эффективного взаимодействия с аудиторией и построения репутации организаций.',
    id_image: 9,
  },
  {
    id: 3,
    name: 'Кафедра экономики и финансов',
    description:
      'Готовим специалистов для анализа, планирования и управления финансовыми потоками в бизнесе и государственном секторе с учётом современных экономических реалий.',
    id_image: 11,
  },
  {
    id: 4,
    name: 'Кафедра управления',
    description:
      'Развиваем управленческие компетенции для эффективного руководства проектами, командами и организациями в условиях динамичного рынка.',
    id_image: 12,
  },
  {
    id: 5,
    name: 'Кафедра дизайна',
    description:
      'Формируем творческих профессионалов в области графического, цифрового и коммуникационного дизайна, способных создавать современные визуальные решения.',
    id_image: 13,
  },
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
