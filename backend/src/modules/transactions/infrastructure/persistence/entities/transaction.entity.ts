import { Column, Entity, Index } from 'typeorm';
import { numericColumnTransformer } from '../../../../../shared/database/numeric-column.transformer';
import { PaymentMethod } from '../../../../../shared/domain/payment/payment-method.enum';
import { EntityBase } from '../../../../../shared/entities/base.entity';

@Entity({ name: 'transactions', schema: 'transactions' })
@Index(['userId', 'date'])
export class TransactionEntity extends EntityBase {
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  categoryId!: string;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'varchar', length: 140, nullable: true })
  description: string | null = null;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: numericColumnTransformer,
  })
  amount!: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    enumName: 'transactions_payment_method_enum',
    nullable: true,
  })
  paymentMethod: PaymentMethod | null = null;

  @Column({ type: 'uuid', nullable: true })
  cardId: string | null = null;

  @Column({ type: 'smallint', default: 1 })
  installments = 1;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  recurringTransactionId: string | null = null;
}
