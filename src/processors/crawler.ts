import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { CrawlerModule } from 'src/modules/crawler/crawler.module';
import { CrawlerService } from 'src/modules/crawler/crawler.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const crawler = app.select(CrawlerModule).get(CrawlerService);
  crawler.start();
}

bootstrap();
