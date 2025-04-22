import { Module } from "@nestjs/common";
import { CommonModuleController } from "./commonModule.controller";
import { CommonModuleService } from "./commonModule.service";
import { MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: `${process.cwd()}/public`,
        filename: (_, file, cb) => {
          const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9)
          cb(null, uniquePrefix + '.' + file.originalname.split('.').pop())
        }
      }),
      fileFilter: (_, file, cb) => {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, true);        
      }
    }),
  ],
  controllers: [CommonModuleController],
  providers: [CommonModuleService, PrismaService],
})
export class CommonModule {}