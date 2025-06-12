import { Module } from '@nestjs/common'
import { UserModuleController } from './userModule.controller'
import { UserModuleService } from './userModule.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { JwtModule } from '@nestjs/jwt'
import { NotificationsGateway } from './notifications.gateway'
import { GamingService } from './gaming.service'
import { CommonModule } from 'src/commonModule/commonModule.module'

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: 'SUPER_SECRET',
      signOptions: { expiresIn: '60s' },
    }),
    CommonModule,
  ],
  controllers: [UserModuleController],
  providers: [
    GamingService,
    PrismaService,
    UserModuleService,
    NotificationsGateway,
  ],
  exports: [UserModuleService, NotificationsGateway, GamingService],
})
export class UserModule {}
