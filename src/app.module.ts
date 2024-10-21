import { JobModule } from './modules/job/job.module';
import { SystemSettingModule } from './modules/system-setting/system-setting.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { COMMON_CONSTANT } from 'src/constants/common.constant';
import { AuthModule } from 'src/modules/auth/auth.module';
import { CrawlerModule } from 'src/modules/crawler/crawler.module';
import { HealthCheckModule } from 'src/modules/health-check/health-check.module';
import { TransactionModule } from 'src/modules/transaction/transaction.module';
import { WebhookModule } from 'src/modules/webhook/webhook.module';
import { HttpExceptionFilter } from 'src/shared/filters/exception.filter';
import { JwtAuthGuard } from 'src/shared/guards/auth.guard';
import { RoleGuard } from 'src/shared/guards/role.guard';
import { ThrottlerBehindProxyGuard } from 'src/shared/guards/throttler.guard';
import { ResponseTransformInterceptor } from 'src/shared/interceptors/response.interceptor';
import { ApiConfigService } from 'src/shared/services/api-config.service';
import { SharedModule } from 'src/shared/shared.modules';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot({
      ttl: COMMON_CONSTANT.THROTTLER.TTL,
      limit: COMMON_CONSTANT.THROTTLER.LIMIT,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      name: COMMON_CONSTANT.DATASOURCE.DEFAULT,
      imports: [SharedModule],
      inject: [ApiConfigService],
      useFactory: (configService: ApiConfigService) =>
        configService.getDatabaseConfig(COMMON_CONSTANT.DATASOURCE.DEFAULT),
    }),
    RedisModule.forRootAsync({
      imports: [SharedModule],
      inject: [ApiConfigService],
      useFactory: (configService: ApiConfigService) => ({
        config: configService.getRedisConfig(),
      }),
    }),
    BullModule.forRootAsync({
      useFactory: (configService: ApiConfigService) => {
        const redisConfig = configService.parseRedisPropertiesFromUrl(configService.getRedisConfig()[0].url);
        if (!redisConfig) {
          throw new Error('Invalid Redis URL');
        }

        return {
          connection: redisConfig,
        };
      },
      inject: [ApiConfigService],
    }),
    SharedModule,
    HealthCheckModule,
    AuthModule,
    CrawlerModule,
    WebhookModule,
    TransactionModule,
    SystemSettingModule,
    JobModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
