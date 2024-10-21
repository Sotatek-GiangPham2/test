import { ETransactionStatus } from 'src/constants/enum.constant';
import { BaseEntity } from 'src/entities/base.entity';
import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'deposit_event',
})
export class DepositEventEntity extends BaseEntity {
  @PrimaryColumn({
    name: 'id',
  })
  @Generated('increment')
  id: number;

  @Column()
  userId: number;

  @Column()
  txHash: string;

  @Column({
    name: 'amount',
    type: 'decimal',
    precision: 22,
    scale: 8,
  })
  amount: number;

  @Column({
    type: 'decimal',
  })
  transferAmount: number;

  @Column({
    type: 'decimal',
    precision: 22,
    scale: 8,
  })
  burnAmount: number;

  @Column({
    type: 'decimal',
    precision: 22,
    scale: 8,
  })
  stakingAmount: number;

  @Column()
  fromAddress: string;

  @Column({
    type: 'enum',
    enum: ETransactionStatus,
    default: ETransactionStatus.PENDING,
    name: 'status',
  })
  status: ETransactionStatus;

  @Column({
    nullable: false,
  })
  blockTimestamp: Date;
}
