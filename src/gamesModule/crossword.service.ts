import { Injectable } from '@nestjs/common'
import { CheckCrosswordAnswerDto, GetCrosswordQuery } from './dto/crossword.dto'
import {
  CheckCrosswordAnswerSchema,
  GetCrosswordAnswerSchema,
} from './schema/crossword.schema'
import { PrismaService } from 'src/prisma/prisma.service'
import * as moment from 'moment'
import { GamingService } from 'src/userModule/gaming.service'

const EXPERIENCE_SOURCE = 'games:crossword'

@Injectable()
export class CrosswordService {
  constructor(
    private prisma: PrismaService,
    private gamingService: GamingService,
  ) {}

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
    const userAnswers = answer.words.map((word, index) => ({
      x: word.x,
      y: word.y,
      word: word.word,
      direction: word.direction,
      isCorrect: !!correctAnswers.find(
        (a) =>
          a.x === word.x &&
          a.y === word.y &&
          a.word === word.word &&
          a.direction === word.direction,
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
    const isCorrectAnswer =
      userAnswers.filter((a) => a.isCorrect).length === answer.words.length

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
}
