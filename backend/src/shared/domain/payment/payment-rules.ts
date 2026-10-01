import { BusinessException } from '../../exceptions/business.exception';
import { PaymentMethod } from './payment-method.enum';

export class CreditPaymentRequiresCardException extends BusinessException {
  constructor() {
    // 422 Unprocessable Entity
    super(
      'Credit card payments need a card',
      422,
      'CREDIT_PAYMENT_REQUIRES_CARD',
    );
  }
}

export class CreditPaymentNotAllowedException extends BusinessException {
  constructor(categoryName: string) {
    // 422 Unprocessable Entity
    super(
      `"${categoryName}" is not an expense, so it can't be charged to a credit card`,
      422,
      'CREDIT_PAYMENT_NOT_ALLOWED',
    );
  }
}

export class InstallmentsRequireCreditException extends BusinessException {
  constructor() {
    // 422 Unprocessable Entity
    super(
      'Only positive credit card purchases can be split in installments',
      422,
      'INSTALLMENTS_REQUIRE_CREDIT',
    );
  }
}

export interface PaymentToValidate {
  paymentMethod: PaymentMethod | null;
  cardId: string | null;
  installments?: number;
  amount: number;
  category: { name: string; acceptsCreditCard(): boolean };
}

/**
 * A credit purchase must name its card (that's what decides which statement
 * it lands on) and only spending can be charged — anything else would be
 * counted twice once the card bill is paid.
 */
export function assertValidPayment(payment: PaymentToValidate): void {
  const isCredit = payment.paymentMethod === PaymentMethod.CREDIT;

  if (isCredit && !payment.cardId) {
    throw new CreditPaymentRequiresCardException();
  }
  if (isCredit && !payment.category.acceptsCreditCard()) {
    throw new CreditPaymentNotAllowedException(payment.category.name);
  }
  if ((payment.installments ?? 1) > 1 && (!isCredit || payment.amount <= 0)) {
    throw new InstallmentsRequireCreditException();
  }
}
