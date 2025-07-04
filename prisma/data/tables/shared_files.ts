import { Prisma, PrismaClient } from '@prisma/client'
import { statSync } from 'fs'

const prisma = new PrismaClient()
const SHARED_FILES: { id: number; name: string }[] = [
  { id: 1, name: 'Default_avatar.png' },
  { id: 2, name: 'Level_up.png' },
  { id: 3, name: 'Events_experience.png' },
  { id: 4, name: 'Quests_experience.png' },
  { id: 5, name: 'Games_experience.png' },
  { id: 6, name: 'Achievements_experience.png' },
  { id: 7, name: 'First_event_achievement.png' },
  { id: 8, name: 'First_quest_achievement.png' },
  { id: 9, name: 'Publicrelations_department.png' },
  { id: 10, name: 'Informatics_department.png' },
  { id: 11, name: 'Economics_department.png' },
  { id: 12, name: 'Management_department.png' },
  { id: 13, name: 'Design_department.png' },
  { id: 14, name: 'Logo.png' },
  { id: 15, name: 'Taom_login.png' },
  { id: 16, name: 'Banner_event.png' },
  { id: 17, name: 'System_noty.png' },
  { id: 18, name: 'Games_crossword_experience.png' },
  { id: 19, name: 'Games_wordle_experience.png' },
  { id: 20, name: 'First_place_medal.png' },
  { id: 21, name: 'Second_place_medal.png' },
  { id: 22, name: 'Third_place_medal.png' },
]

export const sharedFiles = async (): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    for (let file of SHARED_FILES) {
      const foundFile = await statSync(
        `${process.cwd()}/public/default/${file.name}`,
      )
      const fileData: Prisma.shared_filesCreateManyInput = {
        id: file.id,
        name: file.name,
        original_name: file.name,
        size: foundFile.size,
        extension: file.name.split('.')[file.name.split('.').length - 1],
        path: '/public/default/' + file.name,
      }

      await tx.shared_files.upsert({
        where: { id: fileData.id },
        update: fileData,
        create: fileData,
      })
    }

    const maxId = await tx.shared_files.aggregate({
      _max: { id: true },
    })
    const nextId = maxId._max.id ? Math.max(maxId._max.id + 1, 10001) : 10001

    await tx.$executeRawUnsafe(
      `ALTER SEQUENCE shared_files_id_seq RESTART WITH ${nextId}`,
    )
  })
}
