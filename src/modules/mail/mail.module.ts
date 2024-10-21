import { MailProcessor } from './mail.processor';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { Queues } from 'src/constants/queue.constant';
import { MailService } from 'src/modules/mail/mail.service';
import { ApiConfigService } from 'src/shared/services/api-config.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ApiConfigService) => ({
        transport: {
          host: config.getEnv('MAIL_HOST'),
          secure: false,
          auth: {
            user: config.getEnv('MAIL_USER'),
            pass: config.getEnv('MAIL_PASSWORD'),
          },
          tls: {
            rejectUnauthorized: false,
          },
        },
        defaults: {
          from: `"No Reply" <${config.getEnv('MAIL_FROM')}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(undefined, {
            inlineCssEnabled: true,
          }),

          options: {
            strict: true,
          },
        },
      }),
      inject: [ApiConfigService],
    }),
    BullModule.registerQueue({
      name: Queues.MAIL,
    }),
  ],
  providers: [MailService, ...(process.env.MAIL_ENABLE === 'true' ? [MailProcessor] : [])],
  exports: [MailService],
})
export class MailModule {}
