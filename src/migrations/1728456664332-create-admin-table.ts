import { hash } from 'bcryptjs';
import { config } from 'dotenv';
import { COMMON_CONSTANT } from 'src/constants/common.constant';
import { type MigrationInterface, type QueryRunner, Table } from 'typeorm';

config();

export class CreateAdminTable1728456664332 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'admin',
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
            name: 'password',
            type: 'varchar',
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
      `INSERT INTO "admin" (email, password) VALUES ('${process.env.ADMIN_EMAIL}', 
      '${await hash(process.env.ADMIN_PASSWORD, COMMON_CONSTANT.BCRYPT_SALT_ROUND)}')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('admin');
  }
}
