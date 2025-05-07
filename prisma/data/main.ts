import { PrismaClient } from '@prisma/client'
import { eventStatuses } from './tables/event_statuses'
import { userRoles } from './tables/user_roles'
import { sharedFiles } from './tables/shared_files'

const prisma = new PrismaClient()

export const main = async (): Promise<void> => {
  await userRoles()
  await eventStatuses()
  await sharedFiles()
}

main()
  .catch(async (e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => await prisma.$disconnect())
