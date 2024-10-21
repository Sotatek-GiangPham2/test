import { ERole, EUserStatus } from 'src/constants/enum.constant';
import type { MigrationInterface, QueryRunner } from 'typeorm';
import { Table } from 'typeorm';

export class CreateUserTable1726734427846 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            width: 11,
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'username',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'password',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'walletAddress',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'balance',
            type: 'float',
            isNullable: true,
            default: 0,
          },
          {
            name: 'status',
            type: 'enum',
            enum: [EUserStatus.PENDING, EUserStatus.ACTIVE, EUserStatus.DISABLED],
            isNullable: false,
            default: `'${EUserStatus.PENDING}'`,
          },
          {
            name: 'role',
            type: 'enum',
            enum: [ERole.OWNER, ERole.RENTER, ERole.VALIDATOR_OWNER, ERole.VALIDATOR_STAKER],
            isNullable: false,
            default: `'${ERole.OWNER}'`,
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
    await queryRunner.dropTable('user');
  }
}
