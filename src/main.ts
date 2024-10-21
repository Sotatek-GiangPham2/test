import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from 'src/app.module';
import { initSwagger } from 'src/configs/swagger.config';
import { ApiConfigService } from 'src/shared/services/api-config.service';
import { SharedModule } from 'src/shared/shared.modules';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService: ApiConfigService = app.select(SharedModule).get(ApiConfigService);

  const port = configService.getEnv('PORT');
  const appName = configService.getEnv('APP_NAME');

  app.setGlobalPrefix('api');
  initSwagger(app, appName);

  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enable('trust proxy');
  app.enableCors();
  app.enableShutdownHooks();

  await app.listen(port, () => {
    console.info(`🚀 server starts at ${port}!`);
  });
}

bootstrap();
