import { ETransactionStatus } from 'src/constants/enum.constant';
import { BaseEntity } from 'src/entities/base.entity';
import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'withdraw_event',
})
export class WithdrawEventEntity extends BaseEntity {
  @PrimaryColumn({
    name: 'id',
  })
  @Generated('increment')
  id: number;

  @Column({
    nullable: true,
  })
  txHash: string;

  @Column({
    nullable: false,
  })
  userId: number;

  @Column({
    nullable: true,
  })
  to: string;

  @Column({
    type: 'decimal',
    nullable: true,
  })
  amount: string;

  @Column({
    type: 'decimal',
    nullable: true,
  })
  creditAmount: string;

  @Column({
    type: 'decimal',
    nullable: true,
    default: 0,
  })
  transferAmount: string;

  @Column({
    type: 'decimal',
    nullable: true,
    default: 0,
  })
  feeAmount: string;

  @Column({
    nullable: false,
  })
  withdrawRequestTimestamp: number;

  @Column({
    nullable: true,
    name: 'signature',
  })
  signature: string;

  @Column({
    type: 'enum',
    enum: ETransactionStatus,
    default: ETransactionStatus.PENDING,
    name: 'status',
  })
  status: ETransactionStatus;
}
