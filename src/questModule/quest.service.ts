import { Injectable } from '@nestjs/common'
import { SaveQuestCompleteDto, SaveQuestDto } from './dto/questModule.dto'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import {
  GetQuestCompleteSchema,
  GetQuestMinimizeSchema,
  GetQuestSchema,
} from './schema/questModule.schema'
import { NotFoundError } from 'src/errors/notFound'
import { difference } from 'lodash'
import { GamingService } from 'src/userModule/gaming.service'
import { FilesService } from 'src/commonModule/files/files.service'
import { UserModuleService } from 'src/userModule/userModule.service'

@Injectable()
export class QuestService {
  constructor(
    private prisma: PrismaService,
    private filesService: FilesService,
    private gamingService: GamingService,
    private usersService: UserModuleService,
  ) {}

  async getMinimizeById(id: number): Promise<GetQuestMinimizeSchema> {
    const foundQuest = await this.prisma.quests.findUnique({ where: { id } })

    if (!foundQuest) {
      throw new NotFoundError(`Quest with id ${id} not found`)
    }

    const completedCount = Number(
      (
        await this.prisma.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*)
          FROM complete_quests
          WHERE (quest_data->>'id')::int = ${foundQuest.id}::int
        `
      )[0].count,
    )
    const quest: GetQuestMinimizeSchema = {
      id: foundQuest.id,
      completedCount: completedCount,
      tags: await this.prisma.quest_tags.findMany({
        where: { quests: { some: { id_quest: foundQuest.id } } },
      }),
    }

    if (foundQuest.name) quest.name = foundQuest.name
    if (foundQuest.time) quest.time = foundQuest.time
    if (foundQuest.description) quest.description = foundQuest.description
    if (foundQuest.id_image) {
      quest.image = await this.filesService.getFileStats({
        id: foundQuest.id_image,
      })
    }
    if (foundQuest.id_group) {
      const group = await this.prisma.quest_groups.findUnique({
        where: { id: foundQuest.id_group },
      })

      quest.group = {
        id: group.id,
        name: group.name,
      }
    }
    if (foundQuest.id_difficult) {
      const difficult = await this.prisma.quest_difficulties.findUnique({
        where: { id: foundQuest.id_difficult },
      })

      quest.difficult = {
        id: difficult.id,
        name: difficult.name,
      }
    }

    return quest
  }

  async getById(id: number): Promise<GetQuestSchema> {
    const foundQuest = await this.prisma.quests.findUnique({ where: { id } })

    if (!foundQuest) {
      throw new NotFoundError(`Quest with id ${id} not found`)
    }

    const executor = await this.prisma.users.findUnique({
      where: { id: foundQuest.id_executor },
    })
    const executorPosition = await this.prisma.user_positions.findUnique({
      where: { id: executor.id_position },
    })

    return {
      ...(await this.getMinimizeById(id)),
      executor: {
        id: executor.id,
        name: executor.first_name + ' ' + executor.last_name,
        position: executorPosition.name,
      },
    }
  }

  async getMinimizeCompleteById(id: number): Promise<GetQuestMinimizeSchema> {
    const foundCompleteRow = await this.prisma.complete_quests.findUnique({
      where: { id },
    })
    const foundQuest =
      foundCompleteRow.quest_data as unknown as SaveQuestCompleteDto

    if (!foundQuest) {
      throw new NotFoundError(`Quest with id ${id} not found`)
    }

    const quest: GetQuestMinimizeSchema = {
      id: foundQuest.id,
      tags: foundQuest.tags,
      completeId: id,
    }

    if (foundQuest.name) quest.name = foundQuest.name
    if (foundQuest.time) quest.time = foundQuest.time
    if (foundQuest.difficult) quest.difficult = foundQuest.difficult
    if (foundQuest.description) quest.description = foundQuest.description
    if (foundQuest.imageId) {
      quest.image = await this.filesService.getFileStats({
        id: foundQuest.imageId,
      })
    }

    return quest
  }

  async getCompleteById(id: number): Promise<GetQuestCompleteSchema> {
    const foundCompleteRow = await this.prisma.complete_quests.findUnique({
      where: { id },
    })
    const foundQuest =
      foundCompleteRow.quest_data as unknown as SaveQuestCompleteDto
    const [user] = await this.usersService.getUsers({
      id: foundCompleteRow.id_user,
      limit: 1,
      offset: 0,
    })

    const quest: GetQuestCompleteSchema = {
      ...(await this.getMinimizeCompleteById(id)),
      user,
      date: foundCompleteRow.created_at,
      executor: foundQuest.executor,
      questions: foundQuest.questions,
      results: [
        {
          ...foundQuest.result,
          minPoints: 0,
        },
      ],
    }

    return quest
  }

  async create(quest: SaveQuestDto): Promise<GetQuestSchema> {
    return this.saveQuest(quest)
  }

  async update(quest: SaveQuestDto): Promise<GetQuestSchema> {
    const oldQuestQuestionsIds = (
      await this.prisma.quest_questions.findMany({
        where: { quest: { id: quest.id } },
      })
    ).map((q) => q.id)
    const newQuestQuestionsIds = quest.questions
      .filter((q) => q.id)
      .map((q) => q.id)
    await this.prisma.quest_questions.deleteMany({
      where: {
        id: {
          in: [
            ...difference(oldQuestQuestionsIds, newQuestQuestionsIds),
            ...difference(newQuestQuestionsIds, oldQuestQuestionsIds),
          ],
        },
      },
    })

    const oldQuestResultsIds = (
      await this.prisma.quest_results.findMany({
        where: { quest: { id: quest.id } },
      })
    ).map((r) => r.id)
    const newQuestResultsIds = quest.results
      .filter((r) => r.id)
      .map((r) => r.id)
    await this.prisma.quest_results.deleteMany({
      where: {
        id: {
          in: [
            ...difference(oldQuestResultsIds, newQuestResultsIds),
            ...difference(newQuestResultsIds, oldQuestResultsIds),
          ],
        },
      },
    })

    return this.saveQuest(quest)
  }

  async saveComplete(
    quest: SaveQuestCompleteDto,
    userId: number,
  ): Promise<void> {
    await this.prisma.complete_quests.create({
      data: {
        user: { connect: { id: userId } },
        quest_data: quest as unknown as Prisma.JsonObject,
      },
    })

    const foundQuest = await this.prisma.quests.findUnique({
      where: { id: quest.id },
    })

    if (foundQuest.id_difficult) {
      const foundQuestDifficult =
        await this.prisma.quest_difficulties.findUnique({
          where: { id: foundQuest.id_difficult },
        })

      const isFirstTry =
        Number(
          (
            await this.prisma.$queryRaw<{ count: bigint }>`
              SELECT COUNT(*)
              FROM complete_quests
              WHERE id_user = ${userId}
                AND (quest_data->>'id')::int  = ${quest.id}::int
            `
          )[0].count,
        ) === 1

      if (isFirstTry) {
        this.gamingService.addExperience(
          userId,
          foundQuestDifficult.experience,
          'quests',
          foundQuest.id_department,
        )
      }
    }

    await this.gamingService.addAchievement(userId, 'FIRST_QUEST_COMPLETE')
  }

  private async saveQuest(quest: SaveQuestDto): Promise<GetQuestSchema> {
    const upsertQuest: Prisma.questsUpsertArgs = {
      where: { id: quest.id ?? -1 },
      create: {
        executor: { connect: { id: quest.executorId } },
        department: { connect: { id: quest.departmentId } },
      },
      update: {},
    }
    const upsertData: Prisma.questsUpdateInput = {}

    const keys = Object.keys(quest)

    if (keys.includes('name')) upsertData.name = quest.name
    if (keys.includes('time')) upsertData.time = quest.time
    if (keys.includes('description')) upsertData.description = quest.description
    if (quest.difficultId) {
      upsertData.difficult = { connect: { id: quest.difficultId } }
    }

    upsertQuest.create = Object.assign(upsertQuest.create, upsertData)
    upsertQuest.update = upsertData

    if (keys.includes('group')) {
      if (quest.group) {
        upsertQuest.create.group = upsertQuest.update.group = {
          connectOrCreate: {
            where: { id: quest.group.id ?? -1 },
            create: {
              name: quest.group.name,
              department: { connect: { id: quest.departmentId } },
            },
          },
        }
      } else {
        upsertQuest.update.group = { disconnect: true }
      }
    }
    if (keys.includes('imageId')) {
      console.log('IMAGE', quest.imageId)

      if (quest.imageId) {
        upsertQuest.create.image = { connect: { id: quest.imageId } }
        upsertQuest.update.image = { connect: { id: quest.imageId } }
      } else {
        upsertQuest.update.image = { disconnect: true }
      }
    }

    const savedQuest = await this.prisma.quests.upsert(upsertQuest)

    for (const tag of quest.tags ?? []) {
      const upsertTag = await this.prisma.quest_tags.upsert({
        where: { id: tag.id ?? -1 },
        create: {
          name: tag.name,
          department: { connect: { id: quest.departmentId } },
        },
        update: { name: tag.name },
      })

      await this.prisma.quests.update({
        where: { id: savedQuest.id },
        data: {
          tags: {
            connectOrCreate: {
              where: {
                id_quest_id_tag: {
                  id_quest: savedQuest.id,
                  id_tag: upsertTag.id,
                },
              },
              create: { id_tag: upsertTag.id },
            },
          },
        },
      })
    }

    return this.getById(savedQuest.id)
  }

  async delete(id: number): Promise<void> {
    await this.prisma.quests.delete({ where: { id } })
  }
}
