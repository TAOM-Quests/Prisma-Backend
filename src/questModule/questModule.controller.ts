import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { QuestModuleService } from './questModule.service'
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import {
  GetQuestDifficultiesSchema,
  GetQuestGroupsSchema,
  GetQuestMinimizeSchema,
  GetQuestSchema,
  GetQuestTagsSchema,
} from './schema/questModule.schema'
import {
  getQuestDifficultiesSchemaExample,
  getQuestGroupsSchemaExample,
  getQuestSchemaExample,
  getQuestSchemaMinimizeExample,
  getQuestTagsSchemaExample,
} from './schema/questModule.schema.example'
import {
  GetQuestGroupsQuery,
  GetQuestTagsQuery,
  PostQuestDto,
  SaveQuestCompleteDto,
  SaveQuestDto,
} from './dto/questModule.dto'

@ApiTags('questModule')
@Controller('questModule')
export class QuestModuleController {
  constructor(private questModuleService: QuestModuleService) {}

  @ApiResponse({
    status: 200,
    type: GetQuestMinimizeSchema,
    example: getQuestSchemaMinimizeExample,
  })
  @ApiQuery({ name: 'id', type: 'number', required: false })
  @ApiQuery({ name: 'department', type: 'number', required: false })
  @ApiQuery({ name: 'tag', type: 'number', isArray: true, required: false })
  @ApiQuery({
    name: 'executor',
    type: 'number',
    isArray: true,
    required: false,
  })
  @ApiQuery({ name: 'isComplete', type: 'boolean', required: false })
  @ApiQuery({ name: 'completeBy', type: 'number', required: false })
  @Get('quests')
  async getQuests(
    @Query('id') ids: string[],
    @Query('department') departmentsIds: string[],
    @Query('tag') tagsIds: string[],
    @Query('executor') executorsIds: string[],
    @Query('isComplete') isComplete: boolean,
    @Query('completeBy') completeByUserId: string,
  ): Promise<GetQuestMinimizeSchema[]> {
    return isComplete
      ? this.questModuleService.getCompleteQuests({
          ids: ids.map((id) => +id),
          departmentsIds: departmentsIds.map((id) => +id),
          tagsIds: tagsIds.map((id) => +id),
          executorsIds: executorsIds.map((id) => +id),
          completeByUserId: +completeByUserId,
        })
      : this.questModuleService.getQuests({
          ids: ids.map((id) => +id),
          departmentsIds: departmentsIds.map((id) => +id),
          tagsIds: tagsIds.map((id) => +id),
          executorsIds: executorsIds.map((id) => +id),
        })
  }

  @ApiResponse({
    status: 200,
    type: GetQuestSchema,
    example: getQuestSchemaExample,
  })
  @Post('quests')
  async createQuest(@Body() quest: SaveQuestDto): Promise<GetQuestSchema> {
    return this.questModuleService.createQuest(quest)
  }

  @ApiResponse({
    status: 200,
    type: GetQuestSchema,
    example: getQuestSchemaExample,
  })
  @Get('/quests/:id')
  async getQuest(
    @Param('id') id: string,
    @Query('isComplete') isComplete: string,
  ): Promise<GetQuestSchema> {
    return isComplete
      ? this.questModuleService.getCompleteQuest(+id)
      : this.questModuleService.getQuest(+id)
  }

  @ApiResponse({
    status: 200,
    type: GetQuestSchema,
    example: getQuestSchemaExample,
  })
  @Post('/quests/:id')
  async updateQuest(
    @Param('id') id: string,
    @Body() quest: SaveQuestDto,
  ): Promise<GetQuestSchema> {
    return this.questModuleService.updateQuest(+id, quest)
  }

  @Post('/quests/:id/complete')
  async completeQuest(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() quest: SaveQuestCompleteDto,
  ): Promise<void> {
    await this.questModuleService.saveCompleteQuest(quest, +userId)
  }

  @ApiResponse({
    status: 200,
    type: GetQuestDifficultiesSchema,
    example: getQuestDifficultiesSchemaExample,
  })
  @Get('/difficulties')
  async getDifficulties(): Promise<GetQuestDifficultiesSchema[]> {
    return this.questModuleService.getDifficulties()
  }

  @ApiResponse({
    status: 200,
    type: GetQuestGroupsSchema,
    example: getQuestGroupsSchemaExample,
  })
  @ApiQuery({ name: 'departmentId', type: 'number', required: false })
  @Get('/groups')
  async getGroups(
    @Query('departmentId') departmentId: string,
  ): Promise<GetQuestGroupsSchema[]> {
    const getQuestGroups: GetQuestGroupsQuery = {}

    if (departmentId) {
      getQuestGroups.departmentId = +departmentId
    }

    return this.questModuleService.getGroups(getQuestGroups)
  }

  @ApiResponse({
    status: 200,
    type: GetQuestTagsSchema,
    example: getQuestTagsSchemaExample,
  })
  @ApiQuery({ name: 'departmentId', type: 'number', required: false })
  @Get('/tags')
  async getTags(
    @Query('departmentId') departmentId: string,
  ): Promise<GetQuestTagsSchema[]> {
    const getQuestTags: GetQuestTagsQuery = {}

    if (departmentId) {
      getQuestTags.departmentId = +departmentId
    }

    return this.questModuleService.getTags(getQuestTags)
  }
}
