import { Injectable } from '@nestjs/common'
import moment from 'moment'
import { PrismaService } from 'src/prisma/prisma.service'
import { GetWordleUserAttemptSchema } from './schema/gamesModule.schema'
import { GamingService } from 'src/userModule/gaming.service'

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
    date: Date,
    departmentId: number,
  ): Promise<GetWordleUserAttemptSchema[]> {
    const day = moment(date).startOf('day').toDate()
    const attempts = await this.prisma.game_wordle_attempts.findMany({
      where: {
        user: { id: userId },
        day: {
          gte: day,
          lte: moment(date).add(1, 'day').toDate(),
        },
      },
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
    const todayWord = await this.getWordByDate(new Date(), departmentId)
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

      await this.prisma.user_experience.create({
        data: {
          source: EXPERIENCE_SOURCE,
          user: { connect: { id: userId } },
          experience: EXPERIENCE_CORRECT_ANSWER,
          department: { connect: { id: departmentId } },
        },
      })
    }

    return attemptResult
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
    date: Date,
    departmentId: number,
  ): Promise<string> {
    const day = moment(date).startOf('day').toDate()
    const { word } = await this.prisma.game_wordle_answers.findFirst({
      where: {
        day: {
          gte: day,
          lte: moment(date).add(1, 'day').toDate(),
        },
        department_id: departmentId,
      },
    })

    return word
  }
}
