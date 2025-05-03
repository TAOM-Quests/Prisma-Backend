import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import {
  GetQuestGroupsQuery,
  GetQuestsMinimizeQuery,
  GetQuestTagsQuery,
  PostQuestDto,
  SaveQuestDto,
  SaveQuestionDto,
} from './dto/questModule.dto'
import { Prisma } from '@prisma/client'
import {
  GetQuestDifficultiesSchema,
  GetQuestGroupsSchema,
  GetQuestMinimizeSchema,
  GetQuestQuestionSchema,
  GetQuestSchema,
  GetQuestTagsSchema,
  GetQuestResultSchema,
} from './schema/questModule.schema'
import { QuestQuestion } from 'src/models/questQuestion'
import { QuestAnswer } from 'src/models/questAnswer'
import { NotFoundError } from 'src/errors/notFound'
import { CommonModuleService } from 'src/commonModule/commonModule.service'
import { QuestResult } from 'src/models/questResult'
import { QuestService } from './quest.service'
import { QuestionService } from './question.service'
import { ResultService } from './result.service'

@Injectable()
export class QuestModuleService {
  constructor(
    private prisma: PrismaService,
    private questService: QuestService,
    private resultService: ResultService,
    private questionService: QuestionService,
    private commonModuleService: CommonModuleService,
  ) {}

  async getQuests(
    getQuestsQuery: GetQuestsMinimizeQuery,
  ): Promise<GetQuestMinimizeSchema[]> {
    const where: Prisma.questsWhereInput = {}

    if (getQuestsQuery.ids) where.id = { in: getQuestsQuery.ids }
    if (getQuestsQuery.tagsIds)
      where.tags = { some: { id_tag: { in: getQuestsQuery.tagsIds } } }
    if (getQuestsQuery.executorsIds)
      where.id_executor = { in: getQuestsQuery.executorsIds }
    if (getQuestsQuery.departmentsIds)
      where.id_department = { in: getQuestsQuery.departmentsIds }

    const foundQuests = await this.prisma.quests.findMany({ where })

    return await Promise.all(
      foundQuests.map(
        async (quest) => await this.questService.getById(quest.id),
      ),
    )
  }

  // async getCompleteQuests(getQuestsQuery: GetCompleteQuestsMinimizeQuery): Promise<GetQuestMinimizeSchema[]> {

  // }

  async getQuest(id: number): Promise<GetQuestSchema> {
    const quest = await this.questService.getById(id)
    quest.questions = await this.questionService.getByQuestId(id)
    quest.results = await this.resultService.getByQuestId(id)

    return quest
  }

  async createQuest(quest: SaveQuestDto): Promise<GetQuestSchema> {
    const createdQuest = await this.questService.create(quest)
    createdQuest.questions = await Promise.all(
      quest.questions.map((question) =>
        this.questionService.createAndConnectToQuest(question, createdQuest.id),
      ),
    )
    createdQuest.results = await Promise.all(
      quest.results.map((result) =>
        this.resultService.create(result, createdQuest.id),
      ),
    )

    return createdQuest
  }

  async updateQuest(id: number, quest: SaveQuestDto): Promise<GetQuestSchema> {
    const updatedQuest = await this.questService.update(quest)
    updatedQuest.questions = await Promise.all(
      quest.questions.map(async (question) =>
        question.id
          ? await this.questionService.updateQuestion(question)
          : await this.questionService.createAndConnectToQuest(question, id),
      ),
    )
    updatedQuest.results = await Promise.all(
      quest.results.map(async (result) =>
        result.id
          ? await this.resultService.update(result)
          : await this.resultService.create(result, id),
      ),
    )

    return updatedQuest
  }

  async getDifficulties(): Promise<GetQuestDifficultiesSchema[]> {
    const difficulties = await this.prisma.quest_difficulties.findMany()

    return difficulties.map((difficult) => ({
      id: difficult.id,
      name: difficult.name,
    }))
  }

  async getGroups(
    getGroupsQuery: GetQuestGroupsQuery,
  ): Promise<GetQuestGroupsSchema[]> {
    const groupsFindParams: Prisma.quest_groupsFindManyArgs = {}

    if (getGroupsQuery.departmentId) {
      groupsFindParams.where = { id_department: getGroupsQuery.departmentId }
    }

    const groups = await this.prisma.quest_groups.findMany(groupsFindParams)

    return groups.map((group) => ({
      id: group.id,
      name: group.name,
    }))
  }

  async getTags(
    getTagsQuery: GetQuestTagsQuery,
  ): Promise<GetQuestTagsSchema[]> {
    const tagsFindParams: Prisma.quest_tagsFindManyArgs = {}

    if (getTagsQuery.departmentId) {
      tagsFindParams.where = { id_department: getTagsQuery.departmentId }
    }

    const tags = await this.prisma.quest_tags.findMany(tagsFindParams)

    return tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
    }))
  }
}
