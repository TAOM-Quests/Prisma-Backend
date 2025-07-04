import { PrismaClient } from '@prisma/client'
import { eventStatuses } from './tables/event_statuses'
import { userRoles } from './tables/user_roles'
import { sharedFiles } from './tables/shared_files'
import { userPositions } from './tables/user_positions'
import { eventTypes } from './tables/event_types'
import { departments } from './tables/departments'
import { userLevels } from './tables/user_levels'
import { userAchievements } from './tables/user_achievements'
import { questDifficulties } from './tables/quest_difficulties'
import { crosswordWords } from './tables/game_crossword_words'
import { crosswordDifficulties } from './tables/game_crossword_difficulties'
import { notificationsTypes } from './tables/user_notifiactions_types'

const prisma = new PrismaClient()

export const main = async (): Promise<void> => {
  //Общие данные
  await sharedFiles()
  await departments()

  //Данные для пользователей
  await userRoles()
  await userPositions()
  await notificationsTypes()

  //Данные для геймификации
  await userLevels()
  await userAchievements()
  await crosswordDifficulties()
  await crosswordWords()

  //Данные для мероприятий
  await eventTypes()
  await eventStatuses()

  //Данные для квестов
  await questDifficulties()
}

main()
  .catch(async (e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => await prisma.$disconnect())
