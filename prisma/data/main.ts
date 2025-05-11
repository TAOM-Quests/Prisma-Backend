import { PrismaClient } from '@prisma/client'
import { eventStatuses } from './tables/event_statuses'
import { userRoles } from './tables/user_roles'
import { sharedFiles } from './tables/shared_files'
import { userPositions } from './tables/user_positions'
import { eventTypes } from './tables/event_types'
import { departments } from './tables/departments'

const prisma = new PrismaClient()

export const main = async (): Promise<void> => {
  await departments()
  await sharedFiles()

  await userRoles()
  await userPositions()

  await eventTypes()
  await eventStatuses()
}

main()
  .catch(async (e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => await prisma.$disconnect())
