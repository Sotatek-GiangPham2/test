import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import dotenv from 'dotenv';
import { COMMON_CONSTANT } from 'src/constants/common.constant';
import { Queues } from 'src/constants/queue.constant';
import { WebhookLogEntity } from 'src/entities/webhook-log.entity';
import { WebhookEntity } from 'src/entities/webhook.entity';
import { WebhookController } from 'src/modules/webhook/webhook.controller';
import { WebhookProcessor } from 'src/modules/webhook/webhook.processor';
import { WebhookService } from 'src/modules/webhook/webhook.service';

dotenv.config();

const entities = [WebhookEntity, WebhookLogEntity];

@Module({
  imports: [
    TypeOrmModule.forFeature(entities, COMMON_CONSTANT.DATASOURCE.DEFAULT),
    BullModule.registerQueue({
      name: Queues.WEBHOOK,
    }),
  ],
  controllers: [WebhookController],
  providers: [WebhookService, ...(process.env.WEBHOOK_ENABLE === 'true' ? [WebhookProcessor] : [])],
  exports: [WebhookService],
})
export class WebhookModule {}
