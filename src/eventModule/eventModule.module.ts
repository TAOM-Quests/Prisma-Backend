import { Module } from '@nestjs/common'
import { EventModuleController } from './eventModule.controller'
import { EventModuleService } from './eventModule.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { CommonModuleService } from 'src/commonModule/commonModule.service'
import { UserModuleService } from 'src/userModule/userModule.service'
import { UserModule } from 'src/userModule/userModule.module'

@Module({
  controllers: [EventModuleController],
  providers: [PrismaService, EventModuleService, CommonModuleService],
  imports: [UserModule],
})
export class EventModule {}
