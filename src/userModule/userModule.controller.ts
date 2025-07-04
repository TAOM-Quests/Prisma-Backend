import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import {
  ConfirmEmailCodeDto,
  CreateEmailConfirmCodeDto,
  GetUserExperienceQuery,
  GetUsersQuery,
  UpdateNotificationsSettingsDto,
  UpdateProfileDto,
  UserAuthDto,
} from './dto/userModule.dto'
import {
  AuthUserSchema,
  GetPositionsSchema,
  GetRolesSchema,
  GetUserExperienceSchema,
  GetUserNotificationSettingsItemSchema,
  GetUserProfileSchema,
  GetUsersSchema,
  UpdateUserProfileSchema,
} from './schema/userModule.schema'
import { UserModuleService } from './userModule.service'
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import {
  authUserSchemaExample,
  getPositionsSchemaExample,
  getRolesSchemaExample,
  getUserNotificationSettingsItemSchemaExample,
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
  @ApiQuery({ name: 'id', type: 'number', required: false })
  @ApiQuery({ name: 'roleId', type: 'number', required: false })
  @ApiQuery({ name: 'positionId', type: 'number', required: false })
  @ApiQuery({ name: 'departmentId', type: 'number', required: false })
  @ApiQuery({ name: 'isAdmin', type: 'boolean', required: false })
  @ApiQuery({ name: 'isEmployee', type: 'boolean', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'offset', type: 'number', required: false })
  @Get('/users')
  async getUsers(@Query() query: GetUsersQuery): Promise<GetUsersSchema[]> {
    if (!query.limit) query.limit = 10
    if (!query.offset) query.offset = 0

    return this.userModuleService.getUsers(query)
  }

  @ApiResponse({
    status: 200,
  })
  @Post('email/confirm/send')
  async sendConfirmationEmail(
    @Body() createCode: CreateEmailConfirmCodeDto,
  ): Promise<void> {
    return this.userModuleService.sendConfirmationEmail(createCode)
  }

  @ApiResponse({
    status: 200,
    type: 'boolean',
    example: true,
  })
  @Post('email/confirm')
  async confirmEmail(@Body() code: ConfirmEmailCodeDto): Promise<boolean> {
    return this.userModuleService.confirmEmail(code)
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

  @ApiResponse({
    type: GetRolesSchema,
    example: getRolesSchemaExample,
    status: 200,
  })
  @Get('roles')
  async getRoles(): Promise<GetRolesSchema[]> {
    return this.userModuleService.getRoles()
  }

  @ApiResponse({
    type: GetPositionsSchema,
    example: getPositionsSchemaExample,
    status: 200,
  })
  @Get('positions')
  async getPositions(): Promise<GetPositionsSchema[]> {
    return this.userModuleService.getPositions()
  }

  @ApiResponse({
    type: GetUserNotificationSettingsItemSchema,
    example: getUserNotificationSettingsItemSchemaExample,
    status: 200,
  })
  @Post('users/:id/notifications/settings')
  async updateNotificationsSettings(
    @Param('id') id: string,
    @Body()
    updateSetting: UpdateNotificationsSettingsDto,
  ): Promise<GetUserNotificationSettingsItemSchema[]> {
    return this.userModuleService.updateNotificationsSettings(
      +id,
      updateSetting,
    )
  }

  @ApiQuery({ name: 'userId', type: 'number', required: false })
  @ApiQuery({ name: 'departmentId', type: 'number', required: false })
  @ApiQuery({ name: 'offset', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @Get('experience')
  async getUserExperience(
    @Query('userId') userId: string,
    @Query('departmentId') departmentId: string,
    @Query('offset') offset: string,
    @Query('limit') limit: string,
  ): Promise<GetUserExperienceSchema[]> {
    const query: GetUserExperienceQuery = {}

    if (userId) query.userId = +userId
    if (departmentId) query.departmentId = +departmentId
    if (offset) query.offset = +offset
    if (limit) query.limit = +limit

    return this.userModuleService.getUserExperience(query)
  }
}
