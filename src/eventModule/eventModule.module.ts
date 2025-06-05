import { Module } from '@nestjs/common'
import { EventModuleController } from './eventModule.controller'
import { EventModuleService } from './eventModule.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserModule } from 'src/userModule/userModule.module'
import { CommonModule } from 'src/commonModule/commonModule.module'

@Module({
  controllers: [EventModuleController],
  providers: [PrismaService, EventModuleService],
  imports: [UserModule, CommonModule],
})
export class EventModule {}
