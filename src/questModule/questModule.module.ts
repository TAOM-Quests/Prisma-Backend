import { Module } from '@nestjs/common'
import { QuestModuleController } from './questModule.controller'
import { QuestModuleService } from './questModule.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { CommonModuleService } from 'src/commonModule/commonModule.service'
import { QuestService } from './quest.service'
import { QuestionService } from './question.service'
import { ResultService } from './result.service'
import { NotificationsGateway } from 'src/userModule/notifications.gateway'
import { UserModule } from 'src/userModule/userModule.module'

@Module({
  controllers: [QuestModuleController],
  providers: [
    QuestService,
    PrismaService,
    ResultService,
    QuestionService,
    QuestModuleService,
    CommonModuleService,
  ],
  imports: [UserModule],
})
export class QuestModule {}
