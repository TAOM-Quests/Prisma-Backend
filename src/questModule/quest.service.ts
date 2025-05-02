import { Injectable } from '@nestjs/common'
import { SaveQuestDto } from './dto/questModule.dto'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { GetQuestSchema } from './schema/questModule.schema'
import { NotFoundError } from 'src/errors/notFound'

@Injectable()
export class QuestService {
  constructor(private prisma: PrismaService) {}

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

    const quest: GetQuestSchema = {
      id: foundQuest.id,
      executor: {
        id: executor.id,
        name: executor.first_name + ' ' + executor.last_name,
        position: executorPosition.name,
      },
    }

    if (foundQuest.name) quest.name = foundQuest.name

    return quest
  }

  async create(quest: SaveQuestDto): Promise<GetQuestSchema> {
    return this.saveQuest(quest)
  }

  async update(quest: SaveQuestDto): Promise<GetQuestSchema> {
    return this.saveQuest(quest)
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

    if (quest.name) upsertData.name = quest.name
    if (quest.time) upsertData.time = quest.time
    if (quest.description) upsertData.description = quest.description
    if (quest.imageId) upsertData.image = { connect: { id: quest.imageId } }
    if (quest.difficultId) {
      upsertData.difficult = { connect: { id: quest.difficultId } }
    }
    if (quest.group) {
      upsertData.group = {
        connectOrCreate: {
          where: { id: quest.group.id ?? -1 },
          create: {
            name: quest.group.name,
            department: { connect: { id: quest.departmentId } },
          },
        },
      }
    }

    upsertQuest.create = Object.assign(upsertQuest.create, upsertData)
    upsertQuest.update = upsertData

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
}
