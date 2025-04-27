import { Controller, Get, Post, Query, Req, StreamableFile, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CommonModuleService } from "./commonModule.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { GetDepartmentsSchema, GetFileStatsSchema } from "./schema/commonModule.schema";
import { getDepartmentsSchemaExample, getFileStatsSchemaExample } from "./schema/commonModule.schema.example";

@ApiTags('commonModule')
@Controller('commonModule')
export class CommonModuleController {
  constructor(
    private commonModuleService: CommonModuleService
  ) {}

  @ApiResponse({
    status: 200,
    type: GetDepartmentsSchema,
    example: getDepartmentsSchemaExample
  })
  @Get('departments')
  async getDepartments(): Promise<GetDepartmentsSchema[]> {
    return this.commonModuleService.getDepartments()
  }

  @Get('file')
  async getFile(@Query('fileName') fileName: string): Promise<StreamableFile> {
    return this.commonModuleService.getFile(fileName)
  }

  @Get('file/stats')
  async getFileStats(@Query('fileName') fileName: string, @Req() req: Request): Promise<GetFileStatsSchema> {
    return this.commonModuleService.getFileStats(fileName)
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
  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<GetFileStatsSchema> {
    await this.commonModuleService.uploadFile(file)
    return this.commonModuleService.getFileStats(file.filename)
  }
}