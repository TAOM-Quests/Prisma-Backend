import { Injectable, StreamableFile } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { GetFileStatsSchema } from './schema/GetFileStatsSchema'
import { createReadStream, stat, statSync } from 'fs'
import { join } from 'path'
import * as mime from 'mime-types'
import { Prisma } from '@prisma/client'
import { GetFileDto } from './dto/GetFileDto'
import { NotFoundError } from 'src/errors/notFound'
import { CreateExcelDto } from './dto/CreateExcelDto'
import * as ExcelJS from 'exceljs'

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
    const size = file.size
    const extension = file.originalname.split('.').pop()
    const originalName = file.originalname.split('.').slice(0, -1).join('.')

    const { id: createdFileId } = await this.prisma.shared_files.upsert({
      where: { id: 100 },
      create: {
        name: file.filename,
        original_name: originalName,
        size,
        extension,
        path: file.path,
      },
      update: {
        name: file.filename,
        original_name: originalName,
        size,
        extension,
        path: file.path,
      },
    })

    return this.getFileStats({ id: createdFileId })
  }

  async createExcelFile({
    data,
    columns,
    fileName,
  }: CreateExcelDto): Promise<GetFileStatsSchema> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(fileName)

    worksheet.columns = columns

    for (let row of data) {
      worksheet.addRow(row)
    }

    const headerRow = worksheet.getRow(1)
    headerRow.eachCell(
      (cell) =>
        (cell.style = {
          font: { bold: true },
          alignment: { horizontal: 'center' },
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          },
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' },
          },
        }),
    )

    const generatedFileName = `${Date.now() + '-' + Math.round(Math.random() * 1e9)}`
    const extension = 'xlsx'
    const path = join(process.cwd(), `public/${generatedFileName}.${extension}`)

    await workbook.xlsx.writeFile(path)

    const { size } = statSync(path)

    const savedFile = await this.prisma.shared_files.create({
      data: {
        name: `${generatedFileName}.${extension}`,
        original_name: fileName,
        extension,
        path,
        size,
      },
    })

    return this.getFileStats({ id: savedFile.id })
  }
}
