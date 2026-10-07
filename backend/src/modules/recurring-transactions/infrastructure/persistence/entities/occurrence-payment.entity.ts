import { Column, Entity, Index } from 'typeorm';
import { EntityBase } from '../../../../../shared/entities/base.entity';

@Entity({ name: 'occurrence_payments', schema: 'recurring_transactions' })
@Index(['recurringTransactionId', 'month'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class OccurrencePaymentEntity extends EntityBase {
  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  recurringTransactionId!: string;

  // Stored as the first day of the month.
  @Column({ type: 'date' })
  month!: string;
}
