import { Injectable } from '@nestjs/common'
import * as moment from 'moment'
import { PrismaService } from 'src/prisma/prisma.service'
import {
  GetWordleUserAttemptSchema,
  GetWordleWordSchema,
} from './schema/gamesModule.schema'
import { GamingService } from 'src/userModule/gaming.service'
import { NotFoundError } from 'src/errors/notFound'
import { upperCase } from 'lodash'
import { SaveWordleWordDto } from './dto/gamesModule.dto'

const EXPERIENCE_SOURCE = 'games'
const EXPERIENCE_CORRECT_ANSWER = 100

@Injectable()
export class WordleService {
  constructor(
    private prisma: PrismaService,
    private gamingService: GamingService,
  ) {}

  async getUserAttempts(
    userId: number,
    date: string,
    departmentId: number,
  ): Promise<GetWordleUserAttemptSchema[]> {
    const day = moment(date).startOf('day')
    const attempts = await this.prisma.game_wordle_attempts.findMany({
      where: {
        user: { id: userId },
        day: {
          gte: day.toDate(),
          lte: day.add(1, 'day').toDate(),
        },
      },
      orderBy: { day: 'asc' },
    })

    const todayWord = await this.getWordByDate(date, departmentId)

    return Promise.all(
      attempts
        .map((a) => a.word)
        .map(async (attempt) => await this.checkAttempt(todayWord, attempt)),
    )
  }

  async createAttempt(
    attempt: string,
    userId: number,
    departmentId: number,
  ): Promise<GetWordleUserAttemptSchema> {
    const isWordExist = await this.prisma.game_wordle.findFirst({
      where: { word: upperCase(attempt) },
    })

    if (!isWordExist) throw new NotFoundError('Word does not exist')

    const todayWord = await this.getWordByDate(
      moment().format('YYYY-MM-DD'),
      departmentId,
    )
    const attemptResult = await this.checkAttempt(todayWord, attempt)

    await this.prisma.game_wordle_attempts.create({
      data: { user: { connect: { id: userId } }, word: attempt },
    })

    if (
      attemptResult.letters.filter((l) => l.status === 'correct').length === 5
    ) {
      await this.gamingService.addExperience(
        userId,
        EXPERIENCE_CORRECT_ANSWER,
        EXPERIENCE_SOURCE,
        departmentId,
      )
    }

    return attemptResult
  }

  async getWordByDepartment(
    departmentId: number,
  ): Promise<GetWordleWordSchema[]> {
    const foundWords = await this.prisma.game_wordle.findMany({
      where: { department_id: departmentId },
    })

    return foundWords.map((word) => ({
      id: word.id,
      word: word.word,
      departmentId: word.department_id,
    }))
  }

  async createWord(
    word: string,
    departmentId: number,
  ): Promise<GetWordleWordSchema> {
    return await this.saveWord({ word, departmentId })
  }

  async updateWord(word: string, id: number): Promise<GetWordleWordSchema> {
    return await this.saveWord({ word, id })
  }

  async deleteWord(id: number): Promise<void> {
    await this.prisma.game_wordle.delete({ where: { id } })
  }

  private async checkAttempt(
    solution: string,
    attempt: string,
  ): Promise<GetWordleUserAttemptSchema> {
    const guessArr = attempt.split('')
    const solutionArr = solution.split('')
    const solutionLetterCount: Record<string, number> = {}
    const statuses: ('correct' | 'present' | 'absent')[] = []

    // Сначала считаем количество каждой буквы в правильном слове
    for (const letter of solutionArr) {
      solutionLetterCount[letter] = (solutionLetterCount[letter] || 0) + 1
    }

    // Первый проход: отмечаем 'correct' и уменьшаем счетчик букв
    for (let i = 0; i < guessArr.length; i++) {
      if (guessArr[i] === solutionArr[i]) {
        statuses[i] = 'correct'
        solutionLetterCount[guessArr[i]]--
      }
    }

    // Второй проход: отмечаем 'present' и 'absent'
    for (let i = 0; i < guessArr.length; i++) {
      if (statuses[i]) continue // Уже отмечено как 'correct'
      const letter = guessArr[i]
      if (solutionLetterCount[letter] > 0) {
        statuses[i] = 'present'
        solutionLetterCount[letter]--
      } else {
        statuses[i] = 'absent'
      }
    }

    return {
      letters: guessArr.map((letter, index) => ({
        name: letter,
        status: statuses[index],
      })),
    }
  }

  private async getWordByDate(
    date: string,
    departmentId: number,
  ): Promise<string> {
    const day = moment(date).startOf('day')
    const { word } = await this.prisma.game_wordle_answers.findFirst({
      where: {
        day: {
          gte: day.toDate(),
          lte: day.add(1, 'day').toDate(),
        },
        department_id: departmentId,
      },
    })

    return word
  }

  private async saveWord({
    word,
    departmentId,
    id,
  }: SaveWordleWordDto): Promise<GetWordleWordSchema> {
    const savedWord = await this.prisma.game_wordle.upsert({
      where: { id: id ?? -1 },
      create: { word, department: { connect: { id: departmentId ?? -1 } } },
      update: { word },
    })

    return {
      id: savedWord.id,
      word: savedWord.word,
      departmentId: savedWord.department_id,
    }
  }
}
