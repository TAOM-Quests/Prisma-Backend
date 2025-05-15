import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import {
  GetUsersQuery,
  UpdateProfileDto,
  UserAuthDto,
} from './dto/userModule.dto'
import {
  AuthUserSchema,
  GetUserProfileSchema,
  GetUsersSchema,
  UpdateUserProfileSchema,
} from './schema/userModule.schema'
import { UserModuleService } from './userModule.service'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import {
  authUserSchemaExample,
  getUserProfileSchemaExample,
  getUsersSchemaExample,
  updateUserProfileSchemaExample,
} from './schema/userModule.schema.example'
@ApiTags('userModule')
@Controller('userModule')
export class UserModuleController {
  constructor(private userModuleService: UserModuleService) {}

  @ApiResponse({
    status: 200,
    type: GetUsersSchema,
    example: getUsersSchemaExample,
  })
  @Get('/users')
  async getUsers(@Query() query: GetUsersQuery): Promise<GetUsersSchema[]> {
    return this.userModuleService.getUsers(query)
  }

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
  @Get('/user/auth')
  async authUserByToken(
    @Query('token') token: string,
  ): Promise<AuthUserSchema> {
    return this.userModuleService.authUserByToken(token)
  }

  @ApiResponse({
    status: 200,
    type: AuthUserSchema,
    example: authUserSchemaExample,
  })
  @Post('/user/auth')
  async authUserByEmailAndPassword(
    @Body() userAuth: UserAuthDto,
  ): Promise<AuthUserSchema> {
    return this.userModuleService.authUserByEmailAndPassword(userAuth)
  }

  @ApiResponse({
    status: 200,
    type: GetUserProfileSchema,
    example: getUserProfileSchemaExample,
  })
  @Get('users/:id/profile')
  async getUserProfile(@Param('id') id: string): Promise<GetUserProfileSchema> {
    return this.userModuleService.getUserProfileById(+id)
  }

  @ApiResponse({
    status: 200,
    type: UpdateUserProfileSchema,
    example: updateUserProfileSchemaExample,
  })
  @Post('users/:id/profile')
  async updateUserProfile(
    @Param('id') id: string,
    @Body() updateProfile: UpdateProfileDto,
  ): Promise<UpdateUserProfileSchema> {
    return this.userModuleService.updateUserProfile(+id, updateProfile)
  }
}
