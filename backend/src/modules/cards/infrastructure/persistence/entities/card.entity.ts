import { Column, Entity, Index } from 'typeorm';
import { numericColumnTransformer } from '../../../../../shared/database/numeric-column.transformer';
import { EntityBase } from '../../../../../shared/entities/base.entity';

@Entity({ name: 'cards', schema: 'cards' })
export class CardEntity extends EntityBase {
  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 60 })
  brand!: string;

  @Column({ type: 'varchar', length: 10 })
  mark!: string;

  @Column({ type: 'varchar', length: 30 })
  swatch!: string;

  @Column({ type: 'varchar', length: 60 })
  nickname!: string;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: numericColumnTransformer,
  })
  creditLimit!: number;

  @Column({ type: 'smallint' })
  closingDay!: number;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: numericColumnTransformer,
  })
  openingBalance!: number;
}
