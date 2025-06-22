import { Prisma } from '@prisma/client'
import { CROSSWORD_WORDS_IT_1 } from './department_IT/difficulty_1'
import { CROSSWORD_WORDS_IT_2 } from './department_IT/difficulty_2'
import { CROSSWORD_WORDS_IT_3 } from './department_IT/difficulty_3'

export const CROSSWORD_WORDS_IT: Prisma.game_crossword_wordsCreateManyInput[] =
  [...CROSSWORD_WORDS_IT_1, ...CROSSWORD_WORDS_IT_2, ...CROSSWORD_WORDS_IT_3]
