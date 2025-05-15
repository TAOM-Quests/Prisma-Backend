import { Module } from '@nestjs/common'
import { UserModuleController } from './userModule.controller'
import { UserModuleService } from './userModule.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { JwtModule } from '@nestjs/jwt'
import { CommonModuleService } from 'src/commonModule/commonModule.service'
import { NotificationsGateway } from './notifications.gateway'
import { GamingService } from './gaming.service'

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: 'SUPER_SECRET',
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [UserModuleController],
  providers: [
    GamingService,
    PrismaService,
    UserModuleService,
    CommonModuleService,
    NotificationsGateway,
  ],
  exports: [UserModuleService, NotificationsGateway, GamingService],
})
export class UserModule {}
