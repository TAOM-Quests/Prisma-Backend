import { Module } from "@nestjs/common";
import { EventModuleController } from "./eventModule.controller";
import { EventModuleService } from "./eventModule.service";
import { PrismaService } from "src/prisma/prisma.service";
import { CommonModuleService } from "src/commonModule/commonModule.service";

@Module({
  controllers: [EventModuleController],
  providers: [EventModuleService, PrismaService, CommonModuleService],
})
export class EventModule {}