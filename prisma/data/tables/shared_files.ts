import { Prisma, PrismaClient } from '@prisma/client'
import { statSync } from 'fs'

const prisma = new PrismaClient()
const SHARED_FILES_NAMES: string[] = ['Default_avatar.png']

export const sharedFiles = async (): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    let nextId = 1

    for (let fileName of SHARED_FILES_NAMES) {
      const file = await statSync(`${process.cwd()}/public/${fileName}`)
      const fileData: Prisma.shared_filesCreateManyInput = {
        id: nextId++,
        name: fileName,
        original_name: fileName,
        size: file.size,
        extension: fileName.split('.')[fileName.split('.').length - 1],
        path: '/public/' + fileName,
      }

      await tx.shared_files.upsert({
        where: { id: fileData.id },
        update: fileData,
        create: fileData,
      })
    }
  })
}
