import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { COMMON_CONSTANT } from 'src/constants/common.constant';
import { DepositEventEntity } from 'src/entities/deposit-event.entity';
import { LatestBlockEntity } from 'src/entities/latest-block.entity';
import { SystemSettingEntity } from 'src/entities/system-setting.entity';
import { CrawlerService } from 'src/modules/crawler/crawler.service';
import { MailModule } from 'src/modules/mail/mail.module';
import { WebhookModule } from 'src/modules/webhook/webhook.module';
import { ApiConfigService } from 'src/shared/services/api-config.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [LatestBlockEntity, SystemSettingEntity, DepositEventEntity],
      COMMON_CONSTANT.DATASOURCE.DEFAULT,
    ),
    MailModule,
    WebhookModule,
  ],
  providers: [CrawlerService, ApiConfigService],
})
export class CrawlerModule {}
