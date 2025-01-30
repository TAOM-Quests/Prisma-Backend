import { Module } from "@nestjs/common";
import { UserModuleController } from "./userModule.controller";
import { UserModuleService } from "./userModule.service";
import { PrismaService } from "src/prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";

@Module({
    controllers: [UserModuleController],
    providers: [
        UserModuleService,
        PrismaService,
        JwtService
    ],
})
export class UserModule {}