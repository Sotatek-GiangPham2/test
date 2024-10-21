import type { RedisClientOptions } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { JwtModuleOptions } from '@nestjs/jwt';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import type { RedisOptions } from 'ioredis';
import { isNil } from 'lodash';
import { COMMON_CONSTANT } from 'src/constants/common.constant';

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  getEnv(key: string): string {
    const value = this.configService.get<string>(key);

    if (isNil(value)) {
      throw new Error(`${key} not set in env yet`);
    }

    return value;
  }

  getDatabaseConfig(datasourceName: string): TypeOrmModuleOptions {
    const typeOrmConfig = {
      name: datasourceName,
      type: this.getEnv('DATABASE_TYPE'),
      host: this.getEnv('DATABASE_HOST'),
      port: Number(this.getEnv('DATABASE_PORT')),
      username: this.getEnv('DATABASE_USERNAME'),
      password: this.getEnv('DATABASE_PASSWORD'),
      database: this.getEnv('DATABASE_NAME'),
      logging: Boolean(this.getEnv('DATABASE_LOG_ENABLE')),
      synchronize: false,
      autoLoadEntities: true,
      extra: {
        connectionLimit: this.getEnv('DATABASE_LIMIT_CONNECTION'),
      },
    };

    return typeOrmConfig as TypeOrmModuleOptions;
  }

  getJwtConfig(): JwtModuleOptions {
    return {
      secret: this.getEnv('JWT_ACCESS_TOKEN_SECRET'),
      signOptions: {
        expiresIn: Number(this.getEnv('JWT_ACCESS_TOKEN_EXPIRATION_TIME')),
      },
    };
  }

  getRedisConfig(): RedisClientOptions[] {
    return [
      {
        namespace: COMMON_CONSTANT.REDIS_DEFAULT_NAMESPACE,
        connectionName: COMMON_CONSTANT.REDIS_DEFAULT_NAMESPACE,
        url: `redis://${this.getEnv('REDIS_HOST')}:${this.getEnv('REDIS_PORT')}/0`,
      },
    ];
  }

  parseRedisPropertiesFromUrl(redisConnectionString: string) {
    const url = new URL(redisConnectionString);
    const redisOptions = {
      host: url.hostname,
      password: url.password,
      port: Number(url.port),
      username: url.username,
      db: Number(url.pathname.replace('/', '')),
      enableTLSForSentinelMode: false,
    } as RedisOptions;

    return redisOptions;
  }

  getMailConfig() {
    return {
      mailHost: this.getEnv('MAIL_HOST'),
      mailPort: Number(this.getEnv('MAIL_PORT')),
      mailUser: this.getEnv('MAIL_USER'),
      mailPassword: this.getEnv('MAIL_PASSWORD'),
      mailFrom: this.getEnv('MAIL_FROM'),
    };
  }
}
