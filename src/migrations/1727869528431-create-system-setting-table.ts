import { ESystemSetting } from 'src/constants/enum.constant';
import type { MigrationInterface, QueryRunner } from 'typeorm';
import { Table } from 'typeorm';

export class CreateSystemSettingTable1727869528431 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'system_setting',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            unsigned: true,
          },
          {
            name: 'service',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'value',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'isActive',
            type: 'int',
            default: 1,
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
            onUpdate: 'now()',
          },
        ],
      }),
    );
    await queryRunner.query(
      // eslint-disable-next-line max-len
      `INSERT INTO "system_setting" (service, value) VALUES ('${ESystemSetting.BURN_RATE_CHANGE}', 0.1), ('${ESystemSetting.STAKING_RATE_CHANGE}', 0.1), ('${ESystemSetting.STAKING_WALLET_CHANGE}', 0.1)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('system_setting');
  }
}
