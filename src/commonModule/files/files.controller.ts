import {
  Controller,
  Get,
  Query,
  StreamableFile,
  Req,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger'
import { FilesService } from './files.service'
import { GetFileStatsSchema } from './schema/GetFileStatsSchema'
import { getFileStatsSchemaExample } from './schema/example/getFileStatsSchemaExample'

@ApiTags('commonModule')
@Controller('commonModule/file')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Get('')
  async getFile(@Query('fileName') fileName: string): Promise<StreamableFile> {
    return this.filesService.getFile(fileName)
  }

  @Get('stats')
  async getFileStats(
    @Query('fileName') fileName: string,
    @Req() req: Request,
  ): Promise<GetFileStatsSchema> {
    return this.filesService.getFileStats(fileName)
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
    return this.filesService.getFileStats(file.filename)
  }
}
