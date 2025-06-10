import { Injectable, StreamableFile } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { GetFileStatsSchema } from './schema/GetFileStatsSchema'
import { createReadStream } from 'fs'
import { join } from 'path'
import * as mime from 'mime-types'
import { Prisma } from '@prisma/client'
import { GetFileDto } from './dto/GetFileDto'
import { NotFoundError } from 'src/errors/notFound'

const BASE_FILE_URL = `http://${process.env.SERVER_HOSTNAME ?? 'localhost:' + process.env.PORT ?? 3000}/api/v1/commonModule/file`

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  async getFile(getFileDto: GetFileDto): Promise<StreamableFile> {
    const where: Prisma.shared_filesWhereInput = {}

    if (getFileDto.id) where.id = getFileDto.id
    if (getFileDto.fileName) where.name = getFileDto.fileName

    const sharedFile = await this.prisma.shared_files.findFirst({ where })

    if (!sharedFile) throw new NotFoundError('File not found')

    const file = createReadStream(join(process.cwd(), sharedFile.path))
    const stream = new StreamableFile(file)
    const fileName = encodeURIComponent(
      `${sharedFile.original_name}.${sharedFile.extension}`,
    )

    stream.options.type = mime.lookup(sharedFile.extension)
    stream.options.disposition = `attachment; filename="${fileName}"`

    return stream
  }

  async getFileStats(getFileDto: GetFileDto): Promise<GetFileStatsSchema> {
    const where: Prisma.shared_filesWhereInput = {}

    if (getFileDto.id) where.id = getFileDto.id
    if (getFileDto.fileName) where.name = getFileDto.fileName

    const file = await this.prisma.shared_files.findFirst({ where })

    if (!file) throw new NotFoundError('File not found')

    return {
      id: file.id,
      name: file.name,
      size: file.size,
      extension: file.extension,
      originalName: file.original_name,
      url: `${BASE_FILE_URL}/${file.id}`,
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<GetFileStatsSchema> {
    const extension =
      file.originalname.split('.')[file.originalname.split('.').length - 1]
    const originalName = file.originalname
      .split('.')
      .filter((_, index) => index !== file.originalname.split('.').length - 1)
      .join('.')
    const size = file.size

    const { id: createdFileId } = await this.prisma.shared_files.create({
      data: {
        name: file.filename,
        original_name: originalName,
        size,
        extension,
        path: file.path,
      },
    })

    return this.getFileStats({ id: createdFileId })
  }
}
