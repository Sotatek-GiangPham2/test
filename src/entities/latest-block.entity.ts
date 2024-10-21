import { BaseEntity } from 'src/entities/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'latest_block',
})
export class LatestBlockEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  latestBlock: number;

  @Column()
  service: string;
}
