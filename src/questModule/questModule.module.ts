import { Module } from "@nestjs/common";
import { QuestModuleController } from "./questModule.controller";
import { QuestModuleService } from "./questModule.service";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
  controllers: [QuestModuleController],
  providers: [QuestModuleService, PrismaService],
})
export class QuestModule {}