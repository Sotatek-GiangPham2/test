import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { JobModule } from 'src/modules/job/job.module';
import { SyncBalanceService } from 'src/modules/job/sync-balance.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const service = app.select(JobModule).get(SyncBalanceService);

  await service.start();
}

bootstrap();
