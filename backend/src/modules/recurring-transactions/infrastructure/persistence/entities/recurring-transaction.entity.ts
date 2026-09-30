import { Column, Entity, Index } from 'typeorm';
import { numericColumnTransformer } from '../../../../../shared/database/numeric-column.transformer';
import { PaymentMethod } from '../../../../../shared/domain/payment/payment-method.enum';
import { EntityBase } from '../../../../../shared/entities/base.entity';

@Entity({ name: 'recurring_transactions', schema: 'recurring_transactions' })
export class RecurringTransactionEntity extends EntityBase {
  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  categoryId!: string;

  @Column({ type: 'varchar', length: 140 })
  description!: string;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: numericColumnTransformer,
  })
  amount!: number;

  @Column({ type: 'smallint' })
  dayOfMonth!: number;

  // Stored as the first day of the month.
  @Column({ type: 'date' })
  startMonth!: string;

  @Column({ type: 'date', nullable: true })
  endMonth: string | null = null;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    enumName: 'recurring_transactions_payment_method_enum',
    nullable: true,
  })
  paymentMethod: PaymentMethod | null = null;

  @Column({ type: 'uuid', nullable: true })
  cardId: string | null = null;
}
