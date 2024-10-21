/* eslint-disable no-await-in-loop */
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import moment from 'moment';
import { COMMON_CONSTANT } from 'src/constants/common.constant';
import { EUserStatus } from 'src/constants/enum.constant';
import { UserEntity } from 'src/entities/user.entity';
import { DatabaseUtilService } from 'src/shared/services/database.service';
import type { QueryRunner } from 'typeorm';
import { DataSource, LessThan } from 'typeorm';

@Injectable()
export class PendingUserService {
  constructor(
    private readonly databaseUtilService: DatabaseUtilService,
    @InjectDataSource(COMMON_CONSTANT.DATASOURCE.DEFAULT)
    private readonly datasource: DataSource,
  ) {}

  async start() {
    await this.databaseUtilService.executeTransaction(this.datasource, async (queryRunner: QueryRunner) => {
      await queryRunner.manager.delete(UserEntity, {
        status: EUserStatus.PENDING,
        createdAt: LessThan(moment().subtract(2, 'days').toISOString()),
      });
    });
  }
}
