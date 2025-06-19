import {
  Controller,
  Get,
  Query,
  StreamableFile,
  Req,
  Post,
  UseInterceptors,
  UploadedFile,
  Param,
  Body,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger'
import { FilesService } from './files.service'
import { GetFileStatsSchema } from './schema/GetFileStatsSchema'
import { getFileStatsSchemaExample } from './schema/example/getFileStatsSchemaExample'
import { CreateExcelDto } from './dto/CreateExcelDto'

@ApiTags('commonModule')
@Controller('commonModule/file')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Get(':id')
  async getFile(@Param('id') id: string): Promise<StreamableFile> {
    return this.filesService.getFile({ id: +id })
  }

  @Get(':id/stats')
  async getFileStats(@Param('id') id: string): Promise<GetFileStatsSchema> {
    return this.filesService.getFileStats({ id: +id })
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ type: GetFileStatsSchema, example: getFileStatsSchemaExample })
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<GetFileStatsSchema> {
    await this.filesService.uploadFile(file)
    return this.filesService.getFileStats({ fileName: file.filename })
  }

  @Post('excel')
  async createExcelFile(@Body() excelData: CreateExcelDto) {
    return this.filesService.createExcelFile(excelData)
  }
}
