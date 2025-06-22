import { Prisma, PrismaClient } from '@prisma/client'
import { CROSSWORD_WORDS_IT } from './game_crossword_words/department_1'

const prisma = new PrismaClient()
const CROSSWORD_WORDS: Prisma.game_crossword_wordsCreateManyInput[] = [
  ...CROSSWORD_WORDS_IT,
]

export const crosswordWords = async (): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    for (let crossword of CROSSWORD_WORDS) {
      await tx.game_crossword_words.upsert({
        where: { id: crossword.id },
        update: crossword,
        create: crossword,
      })
    }
  })
}
