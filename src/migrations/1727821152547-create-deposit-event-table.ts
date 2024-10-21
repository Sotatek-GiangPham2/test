import { type MigrationInterface, type QueryRunner, Table } from 'typeorm';

export class CreateDepositEventTable1727821152547 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'deposit_event',
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
            isUnique: true,
          },
          {
            name: 'userId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'fromAddress',
            type: 'varchar',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['Failed', 'Success'],
            default: "'Success'",
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 22,
            scale: 8,
          },
          {
            name: 'burnAmount',
            type: 'decimal',
            precision: 22,
            scale: 8,
          },
          {
            name: 'stakingAmount',
            type: 'decimal',
            precision: 22,
            scale: 8,
          },
          {
            name: 'blockTimestamp',
            type: 'timestamptz',
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
    await queryRunner.dropTable('deposit_event');
  }
}
