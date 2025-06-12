import { Module } from '@nestjs/common'
import { QuestModuleController } from './questModule.controller'
import { QuestModuleService } from './questModule.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { QuestService } from './quest.service'
import { QuestionService } from './question.service'
import { ResultService } from './result.service'
import { UserModule } from 'src/userModule/userModule.module'
import { CommonModule } from 'src/commonModule/commonModule.module'

@Module({
  controllers: [QuestModuleController],
  providers: [
    QuestService,
    PrismaService,
    ResultService,
    QuestionService,
    QuestModuleService,
  ],
  imports: [UserModule, CommonModule],
})
export class QuestModule {}
