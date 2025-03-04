import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export async function main(): Promise<void> {
  await prisma.$transaction(async tx => {
    await tx.user_roles.createMany({
      data: [
        { id: 1, name: 'Пользователь' },
        { id: 2, name: 'Администратор' }
      ]
    })
  })
}