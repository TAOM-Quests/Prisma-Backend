import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { GetFormParameters } from './dto/GetFormParameters'
import { GetFormSchema } from './schema/GetFormSchema'
import { GetFormQuestionSchema } from './schema/GetFormQuestionSchema'
import { SaveFormDto } from './dto/SaveFormDto'
import { Prisma } from '@prisma/client'
import { GetAnswerQuery } from './dto/GetAnswerQuery'
import { GetAnswerSchema } from './schema/GetAnswerSchema'
import { SaveAnswerDto } from './dto/SaveAnswerDto'

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async getForm({
    entityId,
    entityName,
  }: GetFormParameters): Promise<GetFormSchema> {
    const foundForm = await this.prisma.feedback_forms.findFirst({
      where: {
        entity_id: entityId,
        entity_name: entityName,
      },
    })

    return {
      id: foundForm.id,
      name: foundForm.name,
      description: foundForm.description,
      questions: foundForm.questions as unknown as GetFormQuestionSchema[],
    }
  }

  async createForm(form: SaveFormDto): Promise<GetFormSchema> {
    return this.saveForm(form)
  }

  async updateForm(id: number, form: SaveFormDto): Promise<GetFormSchema> {
    form.id = id

    return this.saveForm(form)
  }

  async getAnswer(query: GetAnswerQuery): Promise<GetAnswerSchema[]> {
    const where: Prisma.feedback_answersWhereInput = {}

    if (query.id) where.id = query.id
    if (query.userId) where.user_id = query.userId
    if (query.entityId && query.entityName) {
      const foundForm = await this.prisma.feedback_forms.findFirst({
        where: {
          entity_id: query.entityId,
          entity_name: query.entityName,
        },
      })

      where.form_id = foundForm.id
    }

    const foundAnswers = await this.prisma.feedback_answers.findMany({ where })

    return foundAnswers.map((answer) => ({
      id: answer.id,
      userId: answer.user_id,
      answers: answer.answers,
    }))
  }

  async createAnswer(answer: SaveAnswerDto): Promise<GetAnswerSchema> {
    return this.saveAnswer(answer)
  }

  private async saveForm(form: SaveFormDto): Promise<GetFormSchema> {
    const upsertForm: Prisma.feedback_formsUpsertArgs = {
      where: { id: form.id ?? -1 },
      create: {
        name: form.name,
        entity_id: form.entityId,
        entity_name: form.entityName,
        description: form.description,
        questions: form.questions as unknown as Prisma.JsonArray,
      },
      update: {
        questions: form.questions as unknown as Prisma.JsonArray,
      },
    }
    const upsertData: Prisma.feedback_formsUpdateInput = {}

    if (form.name) upsertData.name = form.name
    if (form.description) upsertData.description = form.description

    upsertForm.create = Object.assign(upsertForm.create, upsertData)
    upsertForm.update = upsertData

    if (form.id) {
      await this.prisma.feedback_forms.update({
        where: { id: form.id },
        data: upsertForm.update,
      })
    } else {
      await this.prisma.feedback_forms.create({
        data: upsertForm.create,
      })
    }

    return this.getForm({
      entityId: form.entityId,
      entityName: form.entityName,
    })
  }

  private async saveAnswer(answer: SaveAnswerDto): Promise<GetAnswerSchema> {
    const upsertAnswer: Prisma.feedback_answersUpsertArgs = {
      where: { id: answer.id ?? -1 },
      create: {
        user_id: answer.userId,
        form_id: answer.formId,
      },
      update: {},
    }
    const upsertData: Prisma.feedback_answersUpdateInput = {}

    if (answer.answers) upsertData.answers = answer.answers

    upsertAnswer.create = Object.assign(upsertAnswer.create, upsertData)
    upsertAnswer.update = upsertData

    const savedAnswer = answer.id
      ? await this.prisma.feedback_answers.update({
          where: { id: answer.id },
          data: upsertAnswer.update,
        })
      : await this.prisma.feedback_answers.create({
          data: upsertAnswer.create,
        })

    const [foundAnswer] = await this.getAnswer({ id: savedAnswer.id })

    return foundAnswer
  }
}
