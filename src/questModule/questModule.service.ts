import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import {
  GetCompleteQuestsMinimizeQuery,
  GetQuestGroupsQuery,
  GetQuestsMinimizeQuery,
  GetQuestTagsQuery,
  SaveQuestCompleteDto,
  SaveQuestDto,
} from './dto/questModule.dto'
import { Prisma } from '@prisma/client'
import {
  GetQuestDifficultiesSchema,
  GetQuestGroupsSchema,
  GetQuestMinimizeSchema,
  GetQuestSchema,
  GetQuestTagsSchema,
} from './schema/questModule.schema'
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
  ) {}

  async getQuests(
    getQuestsQuery: GetQuestsMinimizeQuery,
  ): Promise<GetQuestMinimizeSchema[]> {
    const where: Prisma.questsWhereInput = {}

    if (getQuestsQuery.ids.length) where.id = { in: getQuestsQuery.ids }
    if (getQuestsQuery.tagsIds.length)
      where.tags = { some: { id_tag: { in: getQuestsQuery.tagsIds } } }
    if (getQuestsQuery.executorsIds.length)
      where.id_executor = { in: getQuestsQuery.executorsIds }
    if (getQuestsQuery.departmentsIds.length)
      where.id_department = { in: getQuestsQuery.departmentsIds }
    if (getQuestsQuery.groupsIds.length)
      where.id_group = { in: getQuestsQuery.groupsIds }

    const foundQuests = await this.prisma.quests.findMany({ where })

    return await Promise.all(
      foundQuests.map(
        async (quest) => await this.questService.getById(quest.id),
      ),
    )
  }

  async getCompleteQuests(
    getQuestsQuery: GetCompleteQuestsMinimizeQuery,
  ): Promise<GetQuestMinimizeSchema[]> {
    const conditions: Prisma.Sql[] = []

    if (getQuestsQuery.completeByUserId) {
      conditions.push(
        Prisma.sql`id_user = ${getQuestsQuery.completeByUserId}::int`,
      )
    }
    if (getQuestsQuery.ids.length) {
      conditions.push(
        Prisma.sql`(quest_data->>'id') = ANY (${Prisma.join(getQuestsQuery.ids)})`,
      )
    }
    if (getQuestsQuery.tagsIds.length)
      conditions.push(
        Prisma.sql`
        EXISTS (
          SELECT 1
          FROM jsonb_array_elements(quest_data->'tags') AS tag
          WHERE (tag->>'id') = ANY (${Prisma.join(getQuestsQuery.tagsIds)})
        )`,
      )
    if (getQuestsQuery.executorsIds.length)
      conditions.push(
        Prisma.sql`(quest_data->>'executor'->>'id') = ANY (${Prisma.join(getQuestsQuery.executorsIds)})`,
      )
    if (getQuestsQuery.departmentsIds.length)
      conditions.push(
        Prisma.sql`(quest_data->>'department'->>'id') = ANY (${Prisma.join(getQuestsQuery.departmentsIds)})`,
      )

    const whereClause =
      conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
        : Prisma.empty
    const foundQuests = await this.prisma.$queryRaw<{ id: number }[]>`
        SELECT id
        FROM complete_quests
        ${whereClause}
      `

    return await Promise.all(
      foundQuests.map(
        async (quest) => await this.questService.getCompleteById(quest.id),
      ),
    )
  }

  async getQuest(id: number): Promise<GetQuestSchema> {
    const quest = await this.questService.getById(id)
    quest.questions = await this.questionService.getByQuestId(id)
    quest.results = await this.resultService.getByQuestId(id)

    return quest
  }

  async getCompleteQuest(id: number): Promise<GetQuestSchema> {
    return this.questService.getCompleteById(id)
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

  async saveCompleteQuest(
    quest: SaveQuestCompleteDto,
    userId: number,
  ): Promise<void> {
    await this.questService.saveComplete(quest, userId)
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
    if (getGroupsQuery.offset) groupsFindParams.skip = getGroupsQuery.offset
    if (getGroupsQuery.limit) groupsFindParams.take = getGroupsQuery.limit

    const groups = await this.prisma.quest_groups.findMany(groupsFindParams)

    return groups.map((group) => ({
      id: group.id,
      name: group.name,
    }))
  }

  async deleteQuest(id: number): Promise<void> {
    await this.questService.delete(id)
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
