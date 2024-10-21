/* eslint-disable no-await-in-loop */
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { COMMON_CONSTANT } from 'src/constants/common.constant';
import { ETransactionStatus } from 'src/constants/enum.constant';
import { UserEntity } from 'src/entities/user.entity';
import { WithdrawEventEntity } from 'src/entities/withdraw-event.entity';
import { DatabaseUtilService } from 'src/shared/services/database.service';
import { sleep } from 'src/shared/utils/sleep';
import type { QueryRunner } from 'typeorm';
import { DataSource, LessThan } from 'typeorm';

@Injectable()
export class SyncBalanceService {
  public static DELAY_TIME_CRAWL_MS = 5000;

  constructor(
    private readonly databaseUtilService: DatabaseUtilService,
    @InjectDataSource(COMMON_CONSTANT.DATASOURCE.DEFAULT)
    private readonly datasource: DataSource,
  ) {}

  async start() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // sync expired withdraw events
      await this.databaseUtilService.executeTransaction(this.datasource, async (queryRunner: QueryRunner) => {
        const nowTimestamp = Math.floor(Date.now() / 1000) - 1200; // delay 1 minutes
        console.info('nowTimestamp', nowTimestamp);
        const expiredWithdraw = await queryRunner.manager.find(WithdrawEventEntity, {
          where: {
            withdrawRequestTimestamp: LessThan(nowTimestamp),
            status: ETransactionStatus.PENDING,
          },
        });

        if (expiredWithdraw.length > 0) {
          await queryRunner.manager.update(WithdrawEventEntity, expiredWithdraw, {
            status: ETransactionStatus.EXPIRED,
          });

          for (const ew of expiredWithdraw) {
            const user = await queryRunner.manager.findOne(UserEntity, {
              where: {
                id: ew.userId,
              },
            });

            if (!user) {
              continue;
            }

            await queryRunner.manager.query('update "user" set balance = balance + $1 where id = $2', [
              Number(ew.amount),
              user.id,
            ]);
          }
        }
      });

      await sleep(SyncBalanceService.DELAY_TIME_CRAWL_MS);
    }
  }
}
