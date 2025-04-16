import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { UserModule } from './userModule/userModule.module'
import { EventModule } from './eventModule/eventModule.module'
import { CommonModule } from './commonModule/commonModule.module'
@Module({
  imports: [ConfigModule.forRoot(), UserModule, EventModule, CommonModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
