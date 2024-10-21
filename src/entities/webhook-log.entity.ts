import { EWebhookLogStatus } from 'src/constants/enum.constant';
import { BaseEntity } from 'src/entities/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'webhook_log',
})
export class WebhookLogEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  webhookId: number;

  @Column()
  data: string;

  @Column({
    nullable: true,
  })
  errorMessage: string;

  @Column({
    type: 'enum',
    enum: EWebhookLogStatus,
    default: EWebhookLogStatus.PENDING,
    name: 'status',
  })
  status: EWebhookLogStatus;
}
