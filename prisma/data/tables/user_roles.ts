import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()
const USER_ROLES: Prisma.user_rolesCreateManyInput[] = [{ id: 1, name: 'Администратор' }]

export const userRoles = async (): Promise<void> => {
  await prisma.$transaction(async tx => {
    for (let role of USER_ROLES) {
      await tx.user_roles.upsert({
        where: { id: role.id },
        update: role,
        create: role
      })
    }
  })
}