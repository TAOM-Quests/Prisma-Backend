import { Injectable } from '@nestjs/common'
import {
  CheckCrosswordAnswerDto,
  GetCrosswordQuery,
  GetCrosswordWordsQuery,
  SaveCrosswordWordDto,
} from './dto/crossword.dto'
import {
  CheckCrosswordAnswerSchema,
  GetCrosswordAnswerSchema,
  GetCrosswordDifficultySchema,
  GetCrosswordWordSchema,
} from './schema/crossword.schema'
import { PrismaService } from 'src/prisma/prisma.service'
import * as moment from 'moment'
import { GamingService } from 'src/userModule/gaming.service'
import { Prisma } from '@prisma/client'

const EXPERIENCE_SOURCE = 'games:crossword'
// --- Маппинг визуально одинаковых букв (латиница <-> кириллица) ---
const letterMap: Record<string, string> = {
  A: 'A',
  А: 'A',
  B: 'B',
  В: 'B',
  C: 'C',
  С: 'C',
  E: 'E',
  Е: 'E',
  H: 'H',
  Н: 'H',
  K: 'K',
  К: 'K',
  M: 'M',
  М: 'M',
  O: 'O',
  О: 'O',
  P: 'P',
  Р: 'P',
  T: 'T',
  Т: 'T',
  X: 'X',
  Х: 'X',
}

@Injectable()
export class CrosswordService {
  constructor(
    private prisma: PrismaService,
    private gamingService: GamingService,
  ) {}

  async getAllowedDifficulties(
    userId: number,
  ): Promise<GetCrosswordDifficultySchema[]> {
    const foundCompleteCrosswords = await this.prisma.user_experience.count({
      where: { user_id: userId, source: EXPERIENCE_SOURCE },
    })
    const foundDifficulties =
      await this.prisma.game_crossword_difficulties.findMany({
        where: { id: { lte: foundCompleteCrosswords + 1 } },
      })

    return foundDifficulties.map((difficult) => ({
      id: difficult.id,
      name: difficult.name,
    }))
  }

  async getCrossword(
    query: GetCrosswordQuery,
  ): Promise<GetCrosswordAnswerSchema[]> {
    const day = moment(query.day).startOf('day')
    const words = await this.prisma.game_crossword_answers.findMany({
      where: {
        day: {
          gte: day.toDate(),
          lte: day.add(1, 'day').toDate(),
        },
        department_id: query.departmentId,
        difficulty_id: query.difficultyId,
      },
    })

    return words.map((word) => ({
      x: word.x,
      y: word.y,
      question: word.question,
      length: word.word.length,
      direction: word.direction,
    }))
  }

  async checkAnswer(
    answer: CheckCrosswordAnswerDto,
  ): Promise<CheckCrosswordAnswerSchema[]> {
    const correctAnswers = await this.prisma.game_crossword_answers.findMany({
      where: {
        department_id: answer.departmentId,
        difficulty_id: answer.difficultyId,
      },
    })

    const userAnswers = answer.words.map((word) => ({
      ...word,
      isCorrect: !!correctAnswers.find(
        (a) =>
          a.x === word.x &&
          a.y === word.y &&
          this.isWordsEqual(a.word, word.word),
      ),
    }))

    const isFirstComplete =
      (await this.prisma.user_experience.count({
        where: {
          user_id: answer.userId,
          source: EXPERIENCE_SOURCE,
          department_id: answer.departmentId,
          created_at: {
            gte: moment().startOf('day').subtract(1, 'day').toDate(),
            lte: moment().startOf('day').toDate(),
          },
        },
      })) >= answer.difficultyId
    const isCorrectAnswer = userAnswers.every((a) => a.isCorrect)

    if (isFirstComplete && isCorrectAnswer) {
      const foundDifficulty =
        await this.prisma.game_crossword_difficulties.findUnique({
          where: { id: answer.difficultyId },
        })

      await this.gamingService.addExperience(
        answer.userId,
        foundDifficulty.experience,
        EXPERIENCE_SOURCE,
        answer.departmentId,
      )
    }

    return userAnswers
  }

  async getWords(
    getQuery: GetCrosswordWordsQuery,
  ): Promise<GetCrosswordWordSchema[]> {
    const where: Prisma.game_crossword_wordsWhereInput = {}

    if (getQuery.departmentId) where.department_id = getQuery.departmentId
    if (getQuery.difficultyId) where.id_difficulty = getQuery.difficultyId

    const foundWords = await this.prisma.game_crossword_words.findMany({
      where,
    })

    return foundWords.map((word) => ({
      id: word.id,
      word: word.word,
      question: word.question,
      departmentId: word.department_id,
      difficultyId: word.id_difficulty,
    }))
  }

  async createWord(
    saveDto: SaveCrosswordWordDto,
  ): Promise<GetCrosswordWordSchema> {
    return this.saveWord(saveDto)
  }

  async updateWord(
    id: number,
    saveDto: SaveCrosswordWordDto,
  ): Promise<GetCrosswordWordSchema> {
    saveDto.id = id

    return this.saveWord(saveDto)
  }

  async deleteWord(id: number): Promise<void> {
    await this.prisma.game_crossword_words.delete({ where: { id } })
  }

  async getDifficulties(): Promise<GetCrosswordDifficultySchema[]> {
    const foundDifficulties =
      await this.prisma.game_crossword_difficulties.findMany()

    return foundDifficulties.map((difficult) => ({
      id: difficult.id,
      name: difficult.name,
    }))
  }

  private isWordsEqual(word1: string, word2: string): boolean {
    console.log(word1, word2)
    console.log(
      word1
        .split('')
        .map(
          (letter, index) =>
            word1[index] === word2[index] || letterMap[letter] === word2[index],
        ),
    )

    return (
      word1.length === word2.length &&
      word1
        .split('')
        .map(
          (letter, index) =>
            word1[index] === word2[index] || letterMap[letter] === word2[index],
        )
        .filter((isEqual) => isEqual).length === word1.length
    )
  }

  private async saveWord(
    saveDto: SaveCrosswordWordDto,
  ): Promise<GetCrosswordWordSchema> {
    const savedWord = await this.prisma.game_crossword_words.upsert({
      where: { id: saveDto.id ?? -1 },
      create: {
        word: saveDto.word,
        question: saveDto.question,
        department: { connect: { id: saveDto.departmentId ?? -1 } },
        difficulty: { connect: { id: saveDto.difficultyId ?? -1 } },
      },
      update: {
        word: saveDto.word,
        question: saveDto.question,
        difficulty: { connect: { id: saveDto.difficultyId ?? -1 } },
      },
    })

    return {
      id: savedWord.id,
      word: savedWord.word,
      question: savedWord.question,
      departmentId: savedWord.department_id,
      difficultyId: savedWord.id_difficulty,
    }
  }
}
