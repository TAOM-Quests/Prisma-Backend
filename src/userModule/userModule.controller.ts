import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { UserAuthDto } from "./userModule.dto";
import { CreateUserSchema, GetUserProfileSchema } from "./userModule.schema";
import { UserModuleService } from "./userModule.service";

@Controller('userModule')
export class UserModuleController {
    private readonly userModuleService: UserModuleService

    @Post('/users')
    createUser(@Body() userAuth: UserAuthDto): Promise<CreateUserSchema> {
        return this.userModuleService.createUser(userAuth)
    }

    @Get('user/:id/profile')
    getUserProfile(@Param('id') id: number): Promise<GetUserProfileSchema> {
        return this.userModuleService.getUserProfileById(id)
    }
}