import { Injectable } from '@nestjs/common'
import { SaveAnswerDto, SaveQuestionDto } from './dto/questModule.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { Prisma } from '@prisma/client'
import { GetQuestQuestionSchema } from './schema/questModule.schema'
import {
  SingleCorrectAnswer,
  MultipleCorrectAnswer,
  ConnectionCorrectAnswer,
  BoxCorrectAnswer,
  FreeCorrectAnswer,
  QuestAnswer,
} from 'src/models/questAnswer'
import { NotFoundError } from 'src/errors/notFound'

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}
  async getById(id: number): Promise<GetQuestQuestionSchema> {
    const question = await this.prisma.questions.findUnique({ where: { id } })

    if (!question) {
      throw new NotFoundError(`Question with id ${id} not found`)
    }

    return {
      id: question.id,
      text: question.text,
      type: question.type,
      answer: await this.transformAnswer(question.id_answer),
    }
  }

  async getByQuestId(questId: number): Promise<GetQuestQuestionSchema[]> {
    const questions = await this.prisma.questions.findMany({
      where: { quest: { id: questId } },
    })

    return await Promise.all(
      questions.map(async (question) => await this.getById(question.id)),
    )
  }

  async createAndConnectToQuest(
    question: SaveQuestionDto,
    questId: number,
  ): Promise<GetQuestQuestionSchema> {
    return await this.saveQuestion(question, questId)
  }

  async updateQuestion(
    question: SaveQuestionDto,
  ): Promise<GetQuestQuestionSchema> {
    return await this.saveQuestion(question)
  }

  private async transformAnswer(answerId: number): Promise<QuestAnswer> {
    const answer = await this.prisma.answers.findUnique({
      where: { id: answerId },
    })

    let questionAnswer: QuestAnswer

    if (answer.id_single) {
      const singleAnswer = await this.prisma.answers_single.findUnique({
        where: { id: answer.id_single },
      })

      questionAnswer = {
        id: answer.id,
        options: singleAnswer.options,
        correctAnswer: singleAnswer.correct_answers,
      }
    }

    if (answer.id_multiple) {
      const multipleAnswer = await this.prisma.answers_multiple.findUnique({
        where: { id: answer.id_multiple },
      })
      questionAnswer = {
        id: answer.id,
        options: multipleAnswer.options,
        correctAnswer: multipleAnswer.correct_answers,
      }
    }

    if (answer.id_connection) {
      const connectionAnswer = await this.prisma.answers_connection.findUnique({
        where: { id: answer.id_connection },
      })
      questionAnswer = {
        id: answer.id,
        options: connectionAnswer.options,
        correctAnswer: connectionAnswer.correct_answers,
      }
    }

    if (answer.id_box_sorting) {
      const boxSortingAnswer = await this.prisma.answers_box_sorting.findUnique(
        { where: { id: answer.id_box_sorting } },
      )
      questionAnswer = {
        id: answer.id,
        options: boxSortingAnswer.options,
        correctAnswer: boxSortingAnswer.correct_answers as {
          [key: string]: number[]
        },
      }
    }

    if (answer.id_free) {
      const freeAnswer = await this.prisma.answers_free.findUnique({
        where: { id: answer.id_free },
      })
      questionAnswer = {
        id: answer.id,
        correctAnswer: freeAnswer.correct_answers,
      }
    }

    return questionAnswer
  }

  private async saveQuestion(
    question: SaveQuestionDto,
    questId?: number,
  ): Promise<GetQuestQuestionSchema> {
    const upsertQuestion: Prisma.questionsUpsertArgs = {
      where: { id: question.id ?? -1 },
      create: { quest: { connect: { id: questId } } },
      update: {},
    }
    const upsertData: Prisma.questionsUpdateInput = {}

    if (question.text) upsertData.text = question.text
    if (question.type) upsertData.type = question.type

    upsertQuestion.create = Object.assign(upsertQuestion.create, upsertData)
    upsertQuestion.update = upsertData

    const savedQuestion = await this.prisma.questions.upsert(upsertQuestion)
    await this.upsertAnswer(question.answer, question.type, savedQuestion.id)

    return this.getById(savedQuestion.id)
  }

  private async upsertAnswer(
    answer: SaveAnswerDto,
    type: string,
    questionId: number,
  ): Promise<void> {
    const foundAnswer = answer.id
      ? await this.prisma.answers.findUnique({ where: { id: answer.id } })
      : await this.prisma.answers.create({
          data: {
            questions: { connect: { id: questionId } },
          },
        })
    answer.id = foundAnswer.id

    if (type === 'single') {
      await this.upsertSingleAnswer(answer, foundAnswer.id_single)
    }
    if (type === 'multiple') {
      await this.upsertMultipleAnswer(answer, foundAnswer.id_multiple)
    }
    if (type === 'connection') {
      await this.upsertConnectionAnswer(answer, foundAnswer.id_connection)
    }
    if (type === 'boxSorting') {
      await this.upsertBoxSortingAnswer(answer, foundAnswer.id_box_sorting)
    }
    if (type === 'free') {
      await this.upsertFreeAnswer(answer, foundAnswer.id_free)
    }
  }

  private async upsertSingleAnswer(
    answer: SaveAnswerDto,
    singleId: number,
  ): Promise<void> {
    await this.prisma.answers_single.upsert({
      where: { id: singleId ?? -1 },
      create: {
        options: answer.options,
        answers: { connect: { id: answer.id } },
        correct_answers: answer.correctAnswer as SingleCorrectAnswer,
      },
      update: {
        options: answer.options,
        correct_answers: answer.correctAnswer as SingleCorrectAnswer,
      },
    })
  }

  private async upsertMultipleAnswer(
    answer: SaveAnswerDto,
    multipleId: number,
  ): Promise<void> {
    await this.prisma.answers_multiple.upsert({
      where: { id: multipleId ?? -1 },
      create: {
        options: answer.options,
        answers: { connect: { id: answer.id } },
        correct_answers: answer.correctAnswer as MultipleCorrectAnswer,
      },
      update: {
        options: answer.options,
        correct_answers: answer.correctAnswer as MultipleCorrectAnswer,
      },
    })
  }

  private async upsertConnectionAnswer(
    answer: SaveAnswerDto,
    connectionId: number,
  ): Promise<void> {
    await this.prisma.answers_connection.upsert({
      where: { id: connectionId ?? -1 },
      create: {
        options: answer.options,
        answers: { connect: { id: answer.id } },
        correct_answers: answer.correctAnswer as ConnectionCorrectAnswer,
      },
      update: {
        options: answer.options,
        correct_answers: answer.correctAnswer as ConnectionCorrectAnswer,
      },
    })
  }

  private async upsertBoxSortingAnswer(
    answer: SaveAnswerDto,
    boxSortingId: number,
  ): Promise<void> {
    await this.prisma.answers_box_sorting.upsert({
      where: { id: boxSortingId ?? -1 },
      create: {
        options: answer.options,
        answers: { connect: { id: answer.id } },
        correct_answers: answer.correctAnswer as BoxCorrectAnswer,
      },
      update: {
        options: answer.options,
        correct_answers: answer.correctAnswer as BoxCorrectAnswer,
      },
    })
  }

  private async upsertFreeAnswer(
    answer: SaveAnswerDto,
    freeId: number,
  ): Promise<void> {
    await this.prisma.answers_free.upsert({
      where: { id: freeId ?? -1 },
      create: {
        answers: { connect: { id: answer.id } },
        correct_answers: answer.correctAnswer as FreeCorrectAnswer,
      },
      update: {
        correct_answers: answer.correctAnswer as FreeCorrectAnswer,
      },
    })
  }
}
