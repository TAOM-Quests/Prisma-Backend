import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { FeedbackService } from './feedback.service'
import { GetFormSchema } from './schema/GetFormSchema'
import { getFormSchemaExample } from './schema/example/getFormSchemaExample'
import { SaveFormDto } from './dto/SaveFormDto'
import { GetAnswerSchema } from './schema/GetAnswerSchema'
import { getAnswerSchemaExample } from './schema/example/getAnswerSchemaExample'
import { SaveAnswerDto } from './dto/SaveAnswerDto'

@ApiTags('commonModule')
@Controller('commonModule/feedback')
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @ApiResponse({
    status: 200,
    type: GetFormSchema,
    example: getFormSchemaExample,
  })
  @Get('forms/:entity/:id')
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
  @Post('forms/:entity/:id')
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
  @Post('forms/:id')
  async updateForm(
    @Param('id') id: string,
    @Body() body: Omit<SaveFormDto, 'id'>,
  ) {
    return this.feedbackService.updateForm(+id, body)
  }

  @ApiResponse({
    status: 200,
    type: GetAnswerSchema,
    example: getAnswerSchemaExample,
  })
  @ApiQuery({ name: 'userId', type: 'number', required: false })
  @ApiQuery({ name: 'entityId', type: 'number', required: false })
  @ApiQuery({ name: 'entityName', type: 'string', required: false })
  @Get('answers')
  async getAnswer(
    @Query('userId') userId: string,
    @Query('entityId') entityId: string,
    @Query('entityName') entityName: string,
  ) {
    return this.feedbackService.getAnswer({
      userId: userId ? +userId : undefined,
      entityId: entityId ? +entityId : undefined,
      entityName,
    })
  }

  @ApiResponse({
    status: 200,
    type: GetAnswerSchema,
    example: getAnswerSchemaExample,
  })
  @Post('answers')
  async createAnswer(@Body() body: SaveAnswerDto) {
    return this.feedbackService.createAnswer(body)
  }
}
