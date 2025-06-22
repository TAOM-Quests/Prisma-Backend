import { Injectable } from '@nestjs/common'
import { NotFoundError } from 'src/errors/notFound'
import { PrismaService } from 'src/prisma/prisma.service'
import { GetQuestResultSchema } from './schema/questModule.schema'
import { SaveResultDto } from './dto/questModule.dto'
import { Prisma } from '@prisma/client'
import { FilesService } from 'src/commonModule/files/files.service'

@Injectable()
export class ResultService {
  constructor(
    private prisma: PrismaService,
    private filesService: FilesService,
  ) {}

  async getByQuestId(questId: number): Promise<GetQuestResultSchema[]> {
    const results = await this.prisma.quest_results.findMany({
      where: { quest: { id: questId } },
    })

    return await Promise.all(
      results.map(async (result) => await this.getById(result.id)),
    )
  }

  async getById(id: number): Promise<GetQuestResultSchema> {
    const foundResult = await this.prisma.quest_results.findUnique({
      where: { id },
    })

    if (!foundResult) {
      throw new NotFoundError(`Result with id ${id} not found`)
    }

    const result: GetQuestResultSchema = {
      id: foundResult.id,
      name: foundResult.name,
      minPoints: foundResult.min_points,
      description: foundResult.description,
    }

    if (foundResult.id_image) {
      result.image = await this.filesService.getFileStats({
        id: foundResult.id_image,
      })
    }

    return result
  }

  async create(
    result: SaveResultDto,
    questId: number,
  ): Promise<GetQuestResultSchema> {
    result.questId = questId
    return await this.saveResult(result)
  }

  async update(result: SaveResultDto): Promise<GetQuestResultSchema> {
    return await this.saveResult(result)
  }

  private async saveResult(
    result: SaveResultDto,
  ): Promise<GetQuestResultSchema> {
    const upsertResult: Prisma.quest_resultsUpsertArgs = {
      where: { id: result.id ?? -1 },
      create: {
        name: result.name,
        min_points: result.minPoints,
        description: result.description,
        quest: { connect: { id: result.questId } },
      },
      update: {},
    }
    const upsertData: Prisma.quest_resultsUpdateInput = {}

    if (result.name) upsertData.name = result.name
    if (result.minPoints) upsertData.min_points = result.minPoints
    if (result.description) upsertData.description = result.description
    if (result.imageId) upsertData.image = { connect: { id: result.imageId } }

    upsertResult.create = Object.assign(upsertResult.create, upsertData)
    upsertResult.update = upsertData

    const savedResult = await this.prisma.quest_results.upsert(upsertResult)

    return this.getById(savedResult.id)
  }
}
