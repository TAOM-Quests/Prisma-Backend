import { Injectable, StreamableFile } from "@nestjs/common";
import { createReadStream } from "fs";
import { join } from "path";
import * as mime from 'mime-types'
import { stat } from "fs/promises";
import { GetFileStatsSchema } from "./schema/commonModule.schema";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class CommonModuleService {
  constructor(private prisma: PrismaService) {}

  async getFile(fileName: string): Promise<StreamableFile> {
    const file = createReadStream(join(process.cwd(), `public/${fileName}`))
    const stream = new StreamableFile(file)
    const sharedFile = await this.prisma.shared_files.findUnique({ where: { name: fileName } })

    stream.options.type = mime.lookup(sharedFile.extension)
    stream.options.disposition = `attachment; filename="${encodeURIComponent(`${sharedFile.original_name}.${sharedFile.extension}`)}"`

    return stream
  }

  async getFileStats(fileName: string): Promise<GetFileStatsSchema> {
    const file = await this.prisma.shared_files.findUnique({ where: { name: fileName } })

    return {
      id: file.id,
      name: file.name,
      size: file.size,
      extension: fileName.split('.')[fileName.split('.').length - 1],
      originalName: file.original_name
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<void> {
    const extension = file.originalname.split('.')[file.originalname.split('.').length - 1]
    const originalName = file.originalname.split('.').filter((_, index) => index !== file.originalname.split('.').length - 1).join('.')
    const size = file.size

    await this.prisma.shared_files.create({
      data: {
        name: file.filename,
        original_name: originalName,
        size,
        extension,
        path: file.path
      } })
  }
}