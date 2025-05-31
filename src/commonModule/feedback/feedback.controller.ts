import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { FeedbackService } from './feedback.service'
import { GetFormSchema } from './schema/GetFormSchema'
import { getFormSchemaExample } from './schema/example/getFormSchemaExample'
import { SaveFormDto } from './dto/SaveFormDto'

@ApiTags('commonModule')
@Controller('commonModule/feedback')
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @ApiResponse({
    status: 200,
    type: GetFormSchema,
    example: getFormSchemaExample,
  })
  @Get('form/:entity/:id')
  async getForm(@Param('id') id: string, @Param('entity') entity: string) {
    return this.feedbackService.getForm({
      entityId: +id,
      entityName: entity,
    })
  }

  @ApiResponse({
    status: 200,
    type: GetFormSchema,
    example: getFormSchemaExample,
  })
  @Post('form/:entity/:id')
  async createForm(
    @Param('id') id: string,
    @Param('entity') entity: string,
    @Body() body: SaveFormDto,
  ) {
    return this.feedbackService.createForm({
      entityId: +id,
      entityName: entity,
      ...body,
    })
  }

  @ApiResponse({
    status: 200,
    type: GetFormSchema,
    example: getFormSchemaExample,
  })
  @Post('form/:id')
  async updateForm(
    @Param('id') id: string,
    @Body() body: Omit<SaveFormDto, 'id'>,
  ) {
    return this.feedbackService.updateForm(+id, body)
  }
}
