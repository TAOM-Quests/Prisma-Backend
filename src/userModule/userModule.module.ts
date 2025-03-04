import { Module } from '@nestjs/common'
import { UserModuleController } from './userModule.controller'
import { UserModuleService } from './userModule.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { JwtModule, JwtService } from '@nestjs/jwt'

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: "SUPER_SECRET",
      signOptions: { expiresIn: '60s' },
    })
  ],
  controllers: [UserModuleController],
  providers: [UserModuleService, PrismaService],
})
export class UserModule {}
