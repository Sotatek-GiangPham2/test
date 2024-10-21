import { Module } from '@nestjs/common';
import { HealthCheckController } from 'src/modules/health-check/health-check.controller';
import { HealthCheckService } from 'src/modules/health-check/health-check.service';

@Module({
  controllers: [HealthCheckController],
  providers: [HealthCheckService],
})
export class HealthCheckModule {}
