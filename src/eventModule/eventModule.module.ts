import { Module } from "@nestjs/common";
import { EventModuleController } from "./eventModule.controller";
import { EventModuleService } from "./eventModule.service";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
  controllers: [EventModuleController],
  providers: [EventModuleService, PrismaService],
})
export class EventModule {}