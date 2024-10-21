import { ESystemSetting } from 'src/constants/enum.constant';
import { BaseEntity } from 'src/entities/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'system_setting',
})
export class SystemSettingEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ESystemSetting,
  })
  service: ESystemSetting;

  @Column()
  value: string;

  @Column()
  isActive: number;
}
