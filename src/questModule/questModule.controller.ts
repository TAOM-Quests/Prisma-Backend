import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { QuestModuleService } from "./questModule.service";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { GetQuestionSchema, GetQuestMinimizeSchema, GetQuestSchema } from "./schema/questModule.schema";
import { getQuestSchemaExample, getQuestSchemaMinimizeExample } from "./schema/questModule.schema.example";
import { PostQuestDto, PostQuestionDto } from "./dto/questModule.dto";

@ApiTags('questModule')
@Controller('questModule')
export class QuestModuleController {
  constructor(
    private questModuleService: QuestModuleService
  ) {}

  @ApiResponse({
    status: 200,
    type: GetQuestMinimizeSchema,
    example: getQuestSchemaMinimizeExample
  })
  @Get('quests')
  async getQuests(
    @Query('id') ids: string[],
    @Query('department') departmentsIds: string[],
    @Query('tag') tagsIds: string[],
    @Query('executor') executorsIds: string[],
    @Query('isComplete') isComplete: boolean,
    @Query('completeBy') completeByUserId: string
  ): Promise<GetQuestMinimizeSchema[]> {
    // return isComplete
    //   ? this.questModuleService.getCompleteQuests({
    //     ids: ids.map(id => +id),
    //     departmentsIds: departmentsIds.map(id => +id),
    //     tagsIds: tagsIds.map(id => +id),
    //     executorsIds: executorsIds.map(id => +id),
    //     completeByUserId: +completeByUserId
    //   })
    //   : this.questModuleService.getQuests({
    //     ids: ids.map(id => +id),
    //     departmentsIds: departmentsIds.map(id => +id),
    //     tagsIds: tagsIds.map(id => +id),
    //     executorsIds: executorsIds.map(id => +id)
    //   })

    return this.questModuleService.getQuests({
      ids: ids.map(id => +id),
      departmentsIds: departmentsIds.map(id => +id),
      tagsIds: tagsIds.map(id => +id),
      executorsIds: executorsIds.map(id => +id)
    })
  }

  @ApiResponse({
    status: 200,
    type: GetQuestSchema,
    example: getQuestSchemaExample
  })
  @Post('quests')
  async createQuest(@Body() quest: PostQuestDto): Promise<GetQuestSchema> {
    return this.questModuleService.createQuest(quest)
  }

  @ApiResponse({
    status: 200,
    type: GetQuestSchema,
    example: getQuestSchemaExample
  })  
  @Get('/quests/:id')
  async getQuest(@Param('id') id: number): Promise<GetQuestSchema> {
    return this.questModuleService.getQuest(id)
  }

  @ApiResponse({
    status: 200,
    type: GetQuestSchema,
    example: getQuestSchemaExample
  })  
  @Post('/quests/:id')
  async updateQuest(@Param('id') id: number, @Body() quest: PostQuestDto): Promise<GetQuestSchema> {
    return this.questModuleService.updateQuest(id, quest)
  }

  @Post('questions')
  async createQuestion(@Body() question: PostQuestionDto): Promise<GetQuestionSchema> {
    return this.questModuleService.createQuestion(question)
  }
}