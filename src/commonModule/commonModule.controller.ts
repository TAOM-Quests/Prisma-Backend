import { Controller, Get, Post, Query, StreamableFile, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CommonModuleService } from "./commonModule.service";
import { FileInterceptor } from "@nestjs/platform-express";

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

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<string> {
    console.log('FILE UPLOADED', file.originalname)

    return file.filename
  }
}