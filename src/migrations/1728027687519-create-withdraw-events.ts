import { type MigrationInterface, type QueryRunner, Table } from 'typeorm';

export class CreateWithdrawEvents1728027687519 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'withdraw_event',
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
            name: 'txHash',
            type: 'varchar',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'userId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'to',
            type: 'varchar',
          },
          {
            name: 'status',
            type: 'varchar',
          },
          {
            name: 'amount',
            type: 'decimal',
            isNullable: true,
          },
          {
            name: 'creditAmount',
            type: 'decimal',
            isNullable: true,
          },
          {
            name: 'transferAmount',
            type: 'decimal',
            isNullable: true,
            default: 0,
          },
          {
            name: 'signature',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'withdrawRequestTimestamp',
            type: 'float',
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('withdraw_event');
  }
}
