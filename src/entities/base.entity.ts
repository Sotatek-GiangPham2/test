import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class BaseEntity {
  @CreateDateColumn()
  createdAt?: string;

  @UpdateDateColumn({
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt?: string;
}
