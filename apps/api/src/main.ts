import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import { existsSync } from 'fs'
import { AppModule } from './app.module'

function resolvePublicDir() {
  const candidates = [
    join(process.cwd(), 'apps', 'api', 'public'),
    join(process.cwd(), 'public'),
    join(__dirname, '..', '..', 'public'),
  ]
  return candidates.find((dir) => existsSync(dir))
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const publicDir = resolvePublicDir()

  if (publicDir) {
    app.useStaticAssets(publicDir, { prefix: '/assets' })
  }

  app.enableCors({ origin: true })
  app.setGlobalPrefix('api')
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )

  const swaggerConfig = new DocumentBuilder()
    .setTitle('课补补 API')
    .setDescription('课补补小程序后端接口')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('docs', app, document)

  const port = process.env.PORT || 3000
  await app.listen(port)
  console.log(`API running at http://localhost:${port}/api`)
  console.log(`Swagger at http://localhost:${port}/docs`)
}

bootstrap()
