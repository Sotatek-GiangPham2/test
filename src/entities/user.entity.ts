import { ERole, EUserStatus } from 'src/constants/enum.constant';
import { BaseEntity } from 'src/entities/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'user',
})
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  walletAddress: string;

  @Column()
  balance: string;

  @Column({
    type: 'enum',
    enum: ERole,
    default: ERole.OWNER,
  })
  role: ERole;

  @Column({
    type: 'enum',
    enum: EUserStatus,
    default: EUserStatus.PENDING,
  })
  status: EUserStatus;
}
