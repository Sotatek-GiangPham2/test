import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { COMMON_CONSTANT } from 'src/constants/common.constant';

@Injectable()
export class HealthCheckService {
  private redisInstance: Redis;

  constructor(private readonly redisService: RedisService) {
    this.redisInstance = this.redisService.getClient(COMMON_CONSTANT.REDIS_DEFAULT_NAMESPACE);
  }

  async healthCheck() {
    await this.redisInstance.set('HEALTH_CHECK', 'ok');
    const redisStatus = await this.redisInstance.get('HEALTH_CHECK');

    return {
      appStatus: 'ok',
      redisStatus,
    };
  }
}
