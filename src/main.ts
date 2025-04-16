import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { notifier } from './services/notifier/notifier'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(new ValidationPipe())
  app.setGlobalPrefix('api/v1')
  app.enableCors()
  addSwagger(app)

  notifier()

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()

function addSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('TQ Api')
    .setVersion('1.0')
    .addTag('userModule')
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, documentFactory)
}
