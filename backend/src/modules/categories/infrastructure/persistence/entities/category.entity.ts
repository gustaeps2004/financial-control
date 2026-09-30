import { Column, Entity, Index } from 'typeorm';
import { EntityBase } from '../../../../../shared/entities/base.entity';

@Entity({ name: 'categories', schema: 'categories' })
@Index(['userId', 'name'], { unique: true, where: '"deleted_at" IS NULL' })
export class CategoryEntity extends EntityBase {
  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 60 })
  name!: string;
}
