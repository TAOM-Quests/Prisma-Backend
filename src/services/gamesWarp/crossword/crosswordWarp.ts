import { PrismaClient } from '@prisma/client'
import { generateCrossword } from './crosswordCreate'
import { CrosswordWord } from 'src/models/crosswordWord'

const MAX_TRY_COUNT_TO_GENERATE = 10
const WORD_COUNT_INTERVAL_START = 10
const WORD_COUNT_INTERVAL_END = 15

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
  let tryCount = 1
  let words: string[] = []
  let questions: string[] = []
  let crossword: Omit<CrosswordWord, 'question'>[] = []

  while (
    tryCount < MAX_TRY_COUNT_TO_GENERATE &&
    crossword.length < WORD_COUNT_INTERVAL_START
  ) {
    const randomPairs = await getRandomWordsAndQuestions(
      departmentId,
      difficultyId,
      wordsCount,
    )

    if (!randomPairs) return

    try {
      words = randomPairs.words
      questions = randomPairs.questions
      crossword = generateCrossword(randomPairs.words)
    } catch {
      tryCount++
    }
  }

  if (crossword.length < WORD_COUNT_INTERVAL_START) return

  crossword.forEach(async (answer) => {
    if (!words.includes(answer.word)) return

    const question = questions[words.indexOf(answer.word)]

    console.log(question, answer.word)

    await prisma.game_crossword_answers.create({
      data: {
        x: answer.x,
        y: answer.y,
        word: answer.word,
        question: question,
        direction: answer.direction,
        department: { connect: { id: departmentId } },
        difficulty: { connect: { id: difficultyId } },
      },
    })
  })
}

async function getRandomWordsAndQuestions(
  departmentId: number,
  difficultyId: number,
  wordsCount: number,
) {
  const words: string[] = []
  const questions: string[] = []

  for (let i = 0; i < wordsCount; i++) {
    const randomWord = await getRandomWordAndQuestion(
      departmentId,
      difficultyId,
    )

    if (!randomWord) {
      console.log(
        `[CROSSWORD_WARP] No such words for department ${departmentId}, difficulty ${difficultyId}`,
      )
      return
    }

    const { word, question } = randomWord

    if (!words.includes(word)) {
      words.push(word)
      questions.push(question)
    }
  }

  return { words, questions }
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
