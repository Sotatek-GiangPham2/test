import { PendingUserService } from './pending-user.service';
import { SyncBalanceService } from './sync-balance.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  providers: [PendingUserService, SyncBalanceService],
})
export class JobModule {}
