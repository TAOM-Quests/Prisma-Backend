import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { GetFormParameters } from './dto/GetFormParameters'
import { GetFormSchema } from './schema/GetFormSchema'
import { GetFormQuestionSchema } from './schema/GetFormQuestionSchema'

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async getForms(param: GetFormParameters): Promise<GetFormSchema> {
    const foundForm = await this.prisma.feedback_forms.findFirst({
      where: {
        entity_id: param.entityId,
        entity_name: param.entityName,
      },
    })

    return {
      id: foundForm.id,
      questions: foundForm.questions as unknown as GetFormQuestionSchema[],
    }
  }
}
