import { PrismaClient } from '@prisma/client'

const WORD_COUNT_INTERVAL_START = 7
const WORD_COUNT_INTERVAL_END = 12

const prisma = new PrismaClient()

export const crosswordWarp = async () => {
  const departments = await prisma.departments.findMany()
  const crosswordDifficulties =
    await prisma.game_crossword_difficulties.findMany()

  for (let departmentId of departments.map((d) => d.id)) {
    for (let difficultyId of crosswordDifficulties.map((d) => d.id)) {
      const wordCount = Math.floor(
        Math.random() * (WORD_COUNT_INTERVAL_END - WORD_COUNT_INTERVAL_START) +
          WORD_COUNT_INTERVAL_START,
      )

      await createCrossword(departmentId, difficultyId, wordCount)
    }
  }
}

async function createCrossword(
  departmentId: number,
  difficultyId: number,
  wordsCount: number,
): Promise<void> {
  const words: string[] = []
  const questions: string[] = []

  for (let i = 0; i < wordsCount; i++) {
    const { word, question } = await getRandomWordAndQuestion(
      departmentId,
      difficultyId,
    )

    if (!word) {
      console.log(
        `[CROSSWORD_WARP] No such words for department ${departmentId}, difficulty ${difficultyId}`,
      )
      return
    }

    if (!words.includes(word)) {
      words.push(word)
      questions.push(question)
    }
  }

  const crossword = buildCrossword(words)

  crossword.forEach(async (answer, index) => {
    await prisma.game_crossword_answers.create({
      data: {
        x: answer.x,
        y: answer.y,
        word: answer.word,
        direction: answer.direction,
        question: questions[index],
        department: { connect: { id: departmentId } },
        difficulty: { connect: { id: difficultyId } },
      },
    })
  })
}

async function getRandomWordAndQuestion(
  departmentId: number,
  difficultyId: number,
): Promise<{ word: string; question: string } | null> {
  const count = await prisma.game_crossword_words.count({
    where: { department_id: departmentId, id_difficulty: difficultyId },
  })

  if (count === 0) return null

  const randomIndex = Math.floor(Math.random() * count)
  const row = await prisma.game_crossword_words.findFirst({
    skip: randomIndex,
    where: { department_id: departmentId, id_difficulty: difficultyId },
  })

  if (!row) return null

  return { word: row.word, question: row.question }
}
