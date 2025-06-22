import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common'
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
  GetCompleteQuestsMinimizeQuery,
  GetQuestGroupsQuery,
  GetQuestTagsQuery,
  SaveQuestCompleteDto,
  SaveQuestDto,
} from './dto/questModule.dto'
import { isArray } from 'class-validator'

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
  @ApiQuery({ name: 'tag', type: 'number', required: false })
  @ApiQuery({ name: 'name', type: 'string', required: false })
  @ApiQuery({ name: 'group', type: 'number', required: false })
  @ApiQuery({ name: 'executor', type: 'number', required: false })
  @ApiQuery({ name: 'difficult', type: 'number', required: false })
  @ApiQuery({ name: 'completeBy', type: 'number', required: false })
  @ApiQuery({ name: 'department', type: 'number', required: false })
  @ApiQuery({ name: 'tag', type: 'number', isArray: true, required: false })
  @ApiQuery({ name: 'group', type: 'number', isArray: true, required: false })
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
    @Query('name') name: string,
    @Query('id') ids: string,
    @Query('tag') tagsIds: string,
    @Query('isCompleted') isCompleted: boolean,
    @Query('group') groupsIds: string,
    @Query('completeBy') completeByUserId: string,
    @Query('executor') executorsIds: string,
    @Query('difficult') difficultIds: string,
    @Query('department') departmentsIds: string,
  ): Promise<GetQuestMinimizeSchema[]> {
    const getQuery: GetCompleteQuestsMinimizeQuery = {
      name,
      ids: ids?.split(',').map((id) => +id) ?? [],
      departmentsIds: departmentsIds?.split(',').map((id) => +id) ?? [],
      tagsIds: tagsIds?.split(',').map((id) => +id) ?? [],
      executorsIds: executorsIds?.split(',').map((id) => +id) ?? [],
      difficultiesIds: difficultIds?.split(',').map((id) => +id) ?? [],
      groupsIds: groupsIds?.split(',').map((id) => +id) ?? [],
    }

    return isCompleted
      ? this.questModuleService.getCompleteQuests({
          ...getQuery,
          completeByUserId: +completeByUserId,
        })
      : this.questModuleService.getQuests(getQuery)
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
  async getQuest(@Param('id') id: string): Promise<GetQuestSchema> {
    return this.questModuleService.getQuest(+id)
  }

  @ApiResponse({
    status: 200,
    type: GetQuestSchema,
    example: getQuestSchemaExample,
  })
  @Get('/quests/complete/:id')
  async getCompleteQuest(@Param('id') id: string): Promise<GetQuestSchema> {
    return this.questModuleService.getCompleteQuest(+id)
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

  @Delete('/quests/:id')
  async deleteQuest(@Param('id') id: string): Promise<void> {
    await this.questModuleService.deleteQuest(+id)
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
  @ApiQuery({ name: 'offset', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @Get('/groups')
  async getGroups(
    @Query('departmentId') departmentId: string,
  ): Promise<GetQuestGroupsSchema[]> {
    const getQuestGroups: GetQuestGroupsQuery = {}

    if (departmentId) {
      getQuestGroups.departmentId = +departmentId
    }
    if (getQuestGroups.offset) getQuestGroups.offset = +getQuestGroups.offset
    if (getQuestGroups.limit) getQuestGroups.limit = +getQuestGroups.limit

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
