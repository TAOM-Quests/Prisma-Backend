import { Module } from "@nestjs/common";
import { CommonModuleController } from "./commonModule.controller";
import { CommonModuleService } from "./commonModule.service";

@Module({
  controllers: [CommonModuleController],
  providers: [CommonModuleService],
})
export class CommonModule {}