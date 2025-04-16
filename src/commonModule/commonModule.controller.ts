import { Controller, Get, Post, Query, StreamableFile, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CommonModuleService } from "./commonModule.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadFileSchema } from "./schema/commonModule.schema";
import { uploadFileSchemaExample } from "./schema/commonModule.schema.example";

@ApiTags('commonModule')
@Controller('commonModule')
export class CommonModuleController {
  constructor(
    private commonModuleService: CommonModuleService
  ) {}

  @Get('file')
  async getFile(@Query('fileName') fileName: string): Promise<StreamableFile> {
    return this.commonModuleService.getFile(fileName)
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
  @ApiResponse({ type: UploadFileSchema, example: uploadFileSchemaExample })
  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<UploadFileSchema> {
    console.log('FILE UPLOADED', file.originalname)

    return {
      name: file.filename,
      originalname: file.originalname,
    }
  }
}