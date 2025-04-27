import { Module } from "@nestjs/common";
import { QuestModuleController } from "./questModule.controller";
import { QuestModuleService } from "./questModule.service";
import { PrismaService } from "src/prisma/prisma.service";
import { CommonModuleService } from "src/commonModule/commonModule.service";

@Module({
  controllers: [QuestModuleController],
  providers: [QuestModuleService, PrismaService, CommonModuleService],
})
export class QuestModule {}