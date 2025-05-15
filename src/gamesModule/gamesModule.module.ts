import { Module } from '@nestjs/common'
import { WordleController } from './wordle.controller'
import { WordleService } from './wordle.service'
import { UserModule } from 'src/userModule/userModule.module'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'

@Module({
  controllers: [WordleController],
  providers: [PrismaService, WordleService],
  imports: [UserModule],
})
export class GamesModule {}
