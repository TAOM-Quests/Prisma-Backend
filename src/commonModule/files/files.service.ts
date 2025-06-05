import { Injectable, StreamableFile } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { GetFileStatsSchema } from './schema/GetFileStatsSchema'
import { createReadStream } from 'fs'
import { join } from 'path'
import { NotFoundError } from 'rxjs'
import * as mime from 'mime-types'

const BASE_FILE_URL = `http://${process.env.SERVER_HOSTNAME ?? 'localhost:' + process.env.PORT ?? 3000}/api/v1/commonModule/file`

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

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
