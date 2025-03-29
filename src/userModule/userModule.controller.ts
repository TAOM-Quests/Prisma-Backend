import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { UserAuthDto } from './dto/userModule.dto'
import {
  AuthUserSchema,
  GetUserProfileSchema,
} from './schema/userModule.schema'
import { UserModuleService } from './userModule.service'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { authUserSchemaExample, getUserProfileSchemaExample } from './schema/userModule.schema.example'
import { PrismaService } from 'src/prisma/prisma.service'
import { NotFoundError } from 'src/errors/notFound'

@ApiTags('userModule')
@Controller('userModule')
export class UserModuleController {
  private readonly userModuleService: UserModuleService

  constructor(
    private prisma: PrismaService,
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
  @Get('/user/auth')
  async authUserByToken(@Query('token') token: string): Promise<AuthUserSchema> {
      return this.userModuleService.authUserByToken(token)
  }

  @ApiResponse({
    status: 200,
    type: AuthUserSchema,
    example: authUserSchemaExample,
  })
  @Post('/user/auth')
  async authUserByEmailAndPassword(@Body() userAuth: UserAuthDto): Promise<AuthUserSchema> {
      return this.userModuleService.authUserByEmailAndPassword(userAuth)
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
