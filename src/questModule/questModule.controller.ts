import { Controller, Get, Query } from "@nestjs/common";
import { QuestModuleService } from "./questModule.service";
import { ApiResponse } from "@nestjs/swagger";
import { GetQuestSchema } from "./schema/questModule.schema";
import { getQuestSchemaExample } from "./schema/questModule.schema.example";

@Controller('questModule')
export class QuestModuleController {
  constructor(
    private questModuleService: QuestModuleService
  ) {}

  @ApiResponse({
    status: 200,
    type: GetQuestSchema,
    example: getQuestSchemaExample
  })
  @Get('quests')
  async getQuests(
    @Query('id') ids: string[],
    @Query('department') departmentsIds: string[],
    @Query('tag') tagsIds: string[],
    @Query('executor') executorsIds: string[],
    @Query('isComplete') isComplete: boolean,
    @Query('completeBy') completeByUserId: string
  ) {
    return isComplete
      ? this.questModuleService.getCompleteQuests({
        ids: ids.map(id => +id),
        departmentsIds: departmentsIds.map(id => +id),
        tagsIds: tagsIds.map(id => +id),
        executorsIds: executorsIds.map(id => +id),
        completeByUserId: +completeByUserId
      })
      : this.questModuleService.getQuests({
        ids: ids.map(id => +id),
        departmentsIds: departmentsIds.map(id => +id),
        tagsIds: tagsIds.map(id => +id),
        executorsIds: executorsIds.map(id => +id)
      })
  }
}