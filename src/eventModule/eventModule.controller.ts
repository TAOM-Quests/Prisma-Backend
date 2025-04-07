import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GetEventMinimizeSchema, GetEventSchema } from "./schema/eventModule.schema";
import { CreateEventDto, GetEventsMinimizeQuery, UpdateEventDto, UpdateEventParticipantsDto } from "./dto/eventModule.dto";
import { getEventSchemaExample, getEventsMinimizeSchemaExample } from "./schema/eventModule.schema.example";
import { EventModuleService } from "./eventModule.service";

@ApiTags('eventModule')
@Controller('eventModule')
export class EventModuleController {
  constructor(
    private eventModuleService: EventModuleService
  ) {}

  @ApiResponse({
    status: 200,
    type: GetEventMinimizeSchema,
    example: getEventsMinimizeSchemaExample
  })
  @ApiQuery({name: 'department', type: 'number', required: false})
  @ApiQuery({name: 'participant', type: 'number', required: false})
  @ApiQuery({name: 'type', type: 'number', required: false})
  @ApiQuery({name: 'date', type: 'date', required: false})
  @ApiQuery({name: 'executor', type: 'number', required: false})
  @Get('/events')
  async getEvents(@Query() getEventsParams): Promise<GetEventMinimizeSchema[]> {
    const params: GetEventsMinimizeQuery = {
      name: getEventsParams.name,
      department: +getEventsParams.department,
      date: getEventsParams.date && new Date(getEventsParams.date),
      executor: +getEventsParams.executor,
      participant: +getEventsParams.participant,
      type: +getEventsParams.type
    }

    return this.eventModuleService.getEvents(params)
  }

  @ApiResponse({
    status: 200,
    type: GetEventSchema,
    example: getEventSchemaExample
  })
  @Post('/events')
  async createEvent(@Body() event: CreateEventDto): Promise<GetEventSchema> {
    return this.eventModuleService.createEvent(event)
  }

  @ApiResponse({
    status: 200,
    type: GetEventSchema,
    example: getEventSchemaExample
  })
  @Get('/events/:id')
  async getEventById(@Param('id') id: string): Promise<GetEventSchema> {
    return this.eventModuleService.getEventById(+id)
  }

  @ApiResponse({
    status: 200,
    type: GetEventSchema,
    example: getEventSchemaExample
  })
  @Post('/events/:id')
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEvent: UpdateEventDto
  ): Promise<GetEventSchema> {
    return this.eventModuleService.updateEvent(+id, updateEvent)
  }

  @ApiResponse({status: 200})
  @Post('/events/:id/participants')
  async addOrRemoveParticipant(
    @Param('id') id: string,
    @Body() changeParticipants: UpdateEventParticipantsDto
  ): Promise<void> {
      return this.eventModuleService.addOrRemoveParticipants(+id, changeParticipants)
  }
}