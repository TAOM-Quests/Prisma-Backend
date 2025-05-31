import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { PrismaService } from 'src/prisma/prisma.service'
import { DepartmentsController } from './departments/departments.controller'
import { FilesController } from './files/files.controller'
import { CommentsService } from './comments/comments.service'
import { DepartmentsService } from './departments/department.service'
import { FeedbackService } from './feedback/feedback.service'
import { FilesService } from './files/files.service'
import { FeedbackController } from './feedback/feedback.controller'

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: `${process.cwd()}/public`,
        filename: (_, file, cb) => {
          const uniquePrefix =
            Date.now() + '-' + Math.round(Math.random() * 1e9)
          cb(null, uniquePrefix + '.' + file.originalname.split('.').pop())
        },
      }),
      fileFilter: (_, file, cb) => {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString(
          'utf8',
        )
        cb(null, true)
      },
    }),
  ],
  controllers: [DepartmentsController, FeedbackController, FilesController],
  providers: [
    FilesService,
    PrismaService,
    CommentsService,
    FeedbackService,
    DepartmentsService,
  ],
  exports: [FilesService, CommentsService, FeedbackService, DepartmentsService],
})
export class CommonModule {}
