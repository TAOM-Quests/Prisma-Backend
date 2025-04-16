import { Controller, Get, Query, StreamableFile } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CommonModuleService } from "./commonModule.service";

@ApiTags('commonModule')
@Controller('commonModule')
export class CommonModuleController {
  constructor(
    private commonModuleService: CommonModuleService
  ) {}

  @Get('/file')
  async getFile(@Query('fileName') fileName: string): Promise<StreamableFile> {
    return this.commonModuleService.getFile(fileName)
  }  
}