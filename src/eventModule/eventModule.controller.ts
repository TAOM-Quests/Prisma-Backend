import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import {
  GetEventMinimizeSchema,
  GetEventSchema,
  GetEventStatusSchema,
  GetEventTagSchema,
  GetEventTypeSchema,
} from './schema/eventModule.schema'
import {
  CreateEventDto,
  GetEventsMinimizeQuery,
  GetEventTagsQuery,
  UpdateEventDto,
  UpdateEventParticipantsDto,
} from './dto/eventModule.dto'
import {
  getEventSchemaExample,
  getEventsMinimizeSchemaExample,
  getEventStatusSchemaExample,
  getEventTagsSchemaExample,
  getEventTypeSchemaExample,
} from './schema/eventModule.schema.example'
import { EventModuleService } from './eventModule.service'

@ApiTags('eventModule')
@Controller('eventModule')
export class EventModuleController {
  constructor(private eventModuleService: EventModuleService) {}

  @ApiResponse({
    status: 200,
    type: GetEventMinimizeSchema,
    example: getEventsMinimizeSchemaExample,
  })
  @ApiQuery({ name: 'department', type: 'number', required: false })
  @ApiQuery({ name: 'participant', type: 'number', required: false })
  @ApiQuery({ name: 'type', type: 'number', required: false })
  @ApiQuery({ name: 'dateStart', type: 'date', required: false })
  @ApiQuery({ name: 'dateEnd', type: 'date', required: false })
  @ApiQuery({ name: 'executor', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'offset', type: 'number', required: false })
  @Get('/events')
  async getEvents(@Query() getEventsParams): Promise<GetEventMinimizeSchema[]> {
    console.log('QUERY PARAMS', getEventsParams)

    const params: GetEventsMinimizeQuery = {
      limit: +(getEventsParams.limit ?? 12),
      offset: +(getEventsParams.offset ?? 0),
      name: getEventsParams.name,
      department: +getEventsParams.department,
      dateStart:
        getEventsParams.dateStart && new Date(getEventsParams.dateStart),
      dateEnd: getEventsParams.dateEnd && new Date(getEventsParams.dateEnd),
      executor: +getEventsParams.executor,
      participant: +getEventsParams.participant,
      type: +getEventsParams.type,
    }

    return this.eventModuleService.getEvents(params)
  }

  @ApiResponse({
    status: 200,
    type: GetEventSchema,
    example: getEventSchemaExample,
  })
  @Post('/events')
  async createEvent(@Body() event: CreateEventDto): Promise<GetEventSchema> {
    return this.eventModuleService.createEvent(event)
  }

  @ApiResponse({
    status: 200,
    type: GetEventSchema,
    example: getEventSchemaExample,
  })
  @Get('/events/:id')
  async getEventById(@Param('id') id: string): Promise<GetEventSchema> {
    return this.eventModuleService.getEventById(+id)
  }

  @ApiResponse({
    status: 200,
    type: GetEventSchema,
    example: getEventSchemaExample,
  })
  @Post('/events/:id')
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEvent: UpdateEventDto,
  ): Promise<GetEventSchema> {
    return this.eventModuleService.updateEvent(+id, updateEvent)
  }

  @ApiResponse({ status: 200 })
  @Delete('/events/:id')
  async deleteEvent(@Param('id') id: string): Promise<void> {
    return this.eventModuleService.deleteEvent(+id)
  }

  @ApiResponse({ status: 200 })
  @Post('/events/:id/participants')
  async addOrRemoveParticipant(
    @Param('id') id: string,
    @Body() changeParticipants: UpdateEventParticipantsDto,
  ): Promise<void> {
    return this.eventModuleService.addOrRemoveParticipants(
      +id,
      changeParticipants,
    )
  }

  @ApiResponse({
    status: 200,
    type: GetEventTypeSchema,
    example: getEventTypeSchemaExample,
  })
  @Get('/types')
  async getTypes(): Promise<GetEventTypeSchema[]> {
    return this.eventModuleService.getTypes()
  }

  @ApiResponse({
    status: 200,
    type: GetEventStatusSchema,
    example: getEventStatusSchemaExample,
  })
  @Get('/statuses')
  async getStatuses(): Promise<GetEventStatusSchema[]> {
    return this.eventModuleService.getStatuses()
  }

  @ApiResponse({
    status: 200,
    type: GetEventTagSchema,
    example: getEventTagsSchemaExample,
  })
  @Get('/tags')
  async getTags(
    @Query('department') departmentId: string,
  ): Promise<GetEventTagSchema[]> {
    const getEventTags: GetEventTagsQuery = {}

    if (departmentId) {
      getEventTags.departmentId = +departmentId
    }

    return this.eventModuleService.getTags(getEventTags)
  }
}
