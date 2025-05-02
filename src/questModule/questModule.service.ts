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
      where.tags_ids = { hasSome: getQuestsQuery.tagsIds }
    if (getQuestsQuery.executorsIds)
      where.id_executor = { in: getQuestsQuery.executorsIds }
    if (getQuestsQuery.departmentsIds)
      where.id_department = { in: getQuestsQuery.departmentsIds }

    const foundQuests = await this.prisma.quests.findMany({ where })
    const quests: GetQuestMinimizeSchema[] = []

    for (let foundQuest of foundQuests) {
      const quest: GetQuestMinimizeSchema = {
        id: foundQuest.id,
      }

      if (foundQuest.name) quest.name = foundQuest.name
      if (foundQuest.time) quest.time = foundQuest.time
      if (foundQuest.description) quest.description = foundQuest.description
      if (foundQuest.id_group) {
        const group = await this.prisma.quest_groups.findUnique({
          where: { id: foundQuest.id_group },
        })
        quest.group = {
          id: group.id,
          name: group.name,
          departmentId: group.id_department,
        }
      }
      if (foundQuest.tags_ids) {
        const tags = await this.prisma.quest_tags.findMany({
          where: { id: { in: foundQuest.tags_ids } },
        })
        quest.tags = tags.map((tag) => ({ id: tag.id, name: tag.name }))
      }
      if (foundQuest.id_difficult) {
        const difficult = await this.prisma.quest_difficulties.findUnique({
          where: { id: foundQuest.id_difficult },
        })
        quest.difficult = { id: difficult.id, name: difficult.name }
      }
      if (foundQuest.id_image) {
        const image = await this.prisma.shared_files.findUnique({
          where: { id: foundQuest.id_image },
        })
        quest.image = await this.commonModuleService.getFileStats(image.name)
      }

      quests.push(quest)
    }

    return quests
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

    return createdQuest
  }

  async updateQuest(id: number, quest: SaveQuestDto): Promise<GetQuestSchema> {
    const updatedQuest = await this.questService.create(quest)
    updatedQuest.questions = await Promise.all(
      quest.questions.map((question) =>
        this.questionService.updateQuestion(question),
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
