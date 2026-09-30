import { Column, Entity, Index } from 'typeorm';
import { numericColumnTransformer } from '../../../../../shared/database/numeric-column.transformer';
import { EntityBase } from '../../../../../shared/entities/base.entity';

@Entity({ name: 'statement_adjustments', schema: 'card_statements' })
@Index(['cardId', 'statementMonth'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class StatementAdjustmentEntity extends EntityBase {
  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  cardId!: string;

  // Stored as the first day of the month.
  @Column({ type: 'date' })
  statementMonth!: string;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: numericColumnTransformer,
  })
  amount!: number;
}
