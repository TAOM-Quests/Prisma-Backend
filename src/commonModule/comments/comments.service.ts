import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { GetUsersSchema } from 'src/userModule/schema/userModule.schema'
import { GetCommentsQuery } from './dto/GetCommentsQuery'
import { GetCommentsSchema } from './schema/GetCommentsSchema'
import { FilesService } from '../files/files.service'

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private filesService: FilesService,
  ) {}

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
          image: await this.filesService.getFileStats({
            id: foundUser.id_image_file,
          }),
          position: foundPosition.name,
        }

        return {
          user,
          text: comment.text,
          createdAt: comment.createdAt,
        }
      }),
    )
  }
}
