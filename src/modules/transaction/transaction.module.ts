import { SystemSettingService } from '../system-setting/system-setting.service';
import { AdminTransactionController } from './admin-transaction.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { COMMON_CONSTANT } from 'src/constants/common.constant';
import { DepositEventEntity } from 'src/entities/deposit-event.entity';
import { SystemSettingEntity } from 'src/entities/system-setting.entity';
import { UserEntity } from 'src/entities/user.entity';
import { WithdrawEventEntity } from 'src/entities/withdraw-event.entity';
import { TransactionController } from 'src/modules/transaction/transaction.controller';
import { TransactionService } from 'src/modules/transaction/transaction.service';

const entites = [UserEntity, WithdrawEventEntity, DepositEventEntity, SystemSettingEntity];

@Module({
  imports: [TypeOrmModule.forFeature(entites, COMMON_CONSTANT.DATASOURCE.DEFAULT)],
  controllers: [TransactionController, AdminTransactionController],
  providers: [TransactionService, SystemSettingService],
})
export class TransactionModule {}
