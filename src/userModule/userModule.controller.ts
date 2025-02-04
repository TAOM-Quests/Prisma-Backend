import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { UserAuthDto } from './dto/userModule.dto'
import {
  CreateUserSchema,
  GetUserProfileSchema,
} from './schema/userModule.schema'
import { UserModuleService } from './userModule.service'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { createUserSchemaExample } from './schema/userModule.schema.example'

@ApiTags('userModule')
@Controller('userModule')
export class UserModuleController {
  private readonly userModuleService: UserModuleService

  @ApiResponse({
    status: 200,
    type: CreateUserSchema,
    example: createUserSchemaExample,
  })
  @Post('/users')
  createUser(@Body() userAuth: UserAuthDto): Promise<CreateUserSchema> {
    return this.userModuleService.createUser(userAuth)
  }

  @ApiResponse({
    status: 200,
    type: GetUserProfileSchema,
  })
  @Get('user/:id/profile')
  getUserProfile(@Param('id') id: number): Promise<GetUserProfileSchema> {
    return this.userModuleService.getUserProfileById(id)
  }
}
