import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { JobModule } from 'src/modules/job/job.module';
import { PendingUserService } from 'src/modules/job/pending-user.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const crawler = app.select(JobModule).get(PendingUserService);

  await crawler.start();
}

bootstrap();
