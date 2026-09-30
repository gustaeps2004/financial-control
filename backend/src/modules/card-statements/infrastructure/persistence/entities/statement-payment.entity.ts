import { Column, Entity, Index } from 'typeorm';
import { numericColumnTransformer } from '../../../../../shared/database/numeric-column.transformer';
import { EntityBase } from '../../../../../shared/entities/base.entity';

@Entity({ name: 'statement_payments', schema: 'card_statements' })
export class StatementPaymentEntity extends EntityBase {
  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  cardId!: string;

  // Stored as the first day of the month.
  @Column({ type: 'date' })
  statementMonth!: string;

  @Column({ type: 'date' })
  paidOn!: string;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: numericColumnTransformer,
  })
  amount!: number;
}
