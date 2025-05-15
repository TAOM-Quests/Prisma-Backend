import { Injectable, StreamableFile } from '@nestjs/common'
import { createReadStream } from 'fs'
import { join } from 'path'
import * as mime from 'mime-types'
import {
  GetCommentsSchema,
  GetDepartmentsSchema,
  GetFileStatsSchema,
} from './schema/commonModule.schema'
import { PrismaService } from 'src/prisma/prisma.service'
import { NotFoundError } from 'src/errors/notFound'
import { GetCommentsQuery } from './dto/commonModule.dto'
import { Prisma } from '@prisma/client'
import { GetUsersSchema } from 'src/userModule/schema/userModule.schema'

const BASE_FILE_URL = `http://${process.env.SERVER_HOSTNAME ?? 'localhost:' + process.env.PORT ?? 3000}/api/v1/commonModule/file`

@Injectable()
export class CommonModuleService {
  constructor(private prisma: PrismaService) {}

  async getDepartments(): Promise<GetDepartmentsSchema[]> {
    const foundDepartments = await this.prisma.departments.findMany()

    return foundDepartments.map((department) => ({
      id: department.id,
      name: department.name,
    }))
  }

  async getComments(query: GetCommentsQuery): Promise<GetCommentsSchema[]> {
    const where: Prisma.commentsWhereInput = {}

    if (query.userId) where.user_id = query.userId
    if (query.entityId) where.entity_id = query.entityId
    if (query.entityName) where.entity_name = query.entityName

    const foundComments = await this.prisma.comments.findMany({ where })

    return Promise.all(
      foundComments.map(async (comment) => {
        const foundUser = await this.prisma.users.findUnique({
          where: { id: comment.user_id },
        })
        const foundPosition = await this.prisma.user_positions.findUnique({
          where: { id: foundUser.id_position },
        })

        const user: GetUsersSchema = {
          id: foundUser.id,
          name: foundUser.first_name + ' ' + foundUser.last_name,
          image: await this.getFileStatsById(foundUser.id_image_file),
          position: foundPosition.name,
        }

        return {
          user,
          text: comment.text,
          createdAt: comment.created_at,
        }
      }),
    )
  }

  async getFile(fileName: string): Promise<StreamableFile> {
    const file = createReadStream(join(process.cwd(), `public/${fileName}`))
    const stream = new StreamableFile(file)
    const sharedFile = await this.prisma.shared_files.findUnique({
      where: { name: fileName },
    })

    if (!sharedFile) throw new NotFoundError('File not found')

    stream.options.type = mime.lookup(sharedFile.extension)
    stream.options.disposition = `attachment; filename="${encodeURIComponent(`${sharedFile.original_name}.${sharedFile.extension}`)}"`

    return stream
  }

  async getFileStatsById(id: number): Promise<GetFileStatsSchema> {
    const file = await this.prisma.shared_files.findUnique({
      where: { id },
    })

    return this.getFileStats(file.name)
  }

  async getFileStats(fileName: string): Promise<GetFileStatsSchema> {
    const file = await this.prisma.shared_files.findUnique({
      where: { name: fileName },
    })

    if (!file) throw new NotFoundError('File not found')

    return {
      id: file.id,
      name: file.name,
      size: file.size,
      extension: fileName.split('.')[fileName.split('.').length - 1],
      originalName: file.original_name,
      url: `${BASE_FILE_URL}?fileName=${file.name}`,
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<void> {
    const extension =
      file.originalname.split('.')[file.originalname.split('.').length - 1]
    const originalName = file.originalname
      .split('.')
      .filter((_, index) => index !== file.originalname.split('.').length - 1)
      .join('.')
    const size = file.size

    await this.prisma.shared_files.create({
      data: {
        name: file.filename,
        original_name: originalName,
        size,
        extension,
        path: file.path,
      },
    })
  }
}
