import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const wordleWarp = async () => {
  const departments = await prisma.departments.findMany()

  for (let departmentId of departments.map((d) => d.id)) {
    const word = await getRandomWordByDepartmentId(departmentId)

    await prisma.game_wordle_answers.create({
      data: {
        word,
        department_id: departmentId,
      },
    })
  }
}

async function getRandomWordByDepartmentId(
  departmentId: number,
): Promise<string | null> {
  const count = await prisma.game_wordle.count()

  if (count === 0) return null

  const randomIndex = Math.floor(Math.random() * count)
  const rows = await prisma.game_wordle.findFirst({
    skip: randomIndex,
    where: { department_id: departmentId },
  })

  return rows.word
}
