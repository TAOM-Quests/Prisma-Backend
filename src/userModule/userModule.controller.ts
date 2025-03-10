import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { UserAuthDto } from './dto/userModule.dto'
import {
  AuthUserSchema,
  GetUserProfileSchema,
} from './schema/userModule.schema'
import { UserModuleService } from './userModule.service'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { authUserSchemaExample, getUserProfileSchemaExample } from './schema/userModule.schema.example'

@ApiTags('userModule')
@Controller('userModule')
export class UserModuleController {
  constructor(
    private userModuleService: UserModuleService
  ) {}

  @ApiResponse({
    status: 200,
    type: AuthUserSchema,
    example: authUserSchemaExample,
  })
  @Post('/users')
  async createUser(@Body() userAuth: UserAuthDto): Promise<AuthUserSchema> {
    return this.userModuleService.createUser(userAuth)
  }

  @ApiResponse({
    status: 200,
    type: AuthUserSchema,
    example: authUserSchemaExample,
  })
  @Post('/user/auth')
  async authUser(@Body() userAuth: UserAuthDto): Promise<AuthUserSchema> {
    return this.userModuleService.authUser(userAuth)
  }

  @ApiResponse({
    status: 200,
    type: GetUserProfileSchema,
    example: getUserProfileSchemaExample,
  })
  @Get('user/:id/profile')
  async getUserProfile(@Param('id') id: number): Promise<GetUserProfileSchema> {
    return this.userModuleService.getUserProfileById(id)
  }
}
