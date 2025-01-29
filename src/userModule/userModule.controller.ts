import { Controller, Get, Param } from "@nestjs/common";
import { GetUserProfileDto } from "./userModule.dto";
import { GetUserProfileSchema } from "./userModule.schema";

@Controller('userModule')
export class UserModuleController {
    @Get('user/:id/profile')
    getUserProfile(@Param('id') id: number): GetUserProfileSchema {
        
    }
}