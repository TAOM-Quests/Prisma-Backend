import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { GetFormParameters } from './dto/GetFormParameters'
import { GetFormSchema } from './schema/GetFormSchema'
import { GetFormQuestionSchema } from './schema/GetFormQuestionSchema'
import { SaveFormDto } from './dto/SaveFormDto'
import { Prisma } from '@prisma/client'

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

    await this.prisma.feedback_forms.upsert(upsertForm)

    return this.getForm({
      entityId: form.entityId,
      entityName: form.entityName,
    })
  }
}
