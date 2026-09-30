import { PaymentMethod } from './payment-method.enum';
import {
  CreditPaymentNotAllowedException,
  CreditPaymentRequiresCardException,
  InstallmentsRequireCreditException,
  assertValidPayment,
} from './payment-rules';

const expense = { name: 'Groceries', acceptsCreditCard: () => true };
const income = { name: 'Salary', acceptsCreditCard: () => false };

describe('assertValidPayment', () => {
  it('accepts a credit purchase on a card', () => {
    expect(() =>
      assertValidPayment({
        paymentMethod: PaymentMethod.CREDIT,
        cardId: 'card-1',
        installments: 3,
        amount: 300,
        category: expense,
      }),
    ).not.toThrow();
  });

  it('accepts payments without a method or card', () => {
    expect(() =>
      assertValidPayment({
        paymentMethod: null,
        cardId: null,
        amount: 5000,
        category: income,
      }),
    ).not.toThrow();
  });

  it('requires a card for credit purchases', () => {
    expect(() =>
      assertValidPayment({
        paymentMethod: PaymentMethod.CREDIT,
        cardId: null,
        amount: 10,
        category: expense,
      }),
    ).toThrow(CreditPaymentRequiresCardException);
  });

  it('refuses to charge non-spending categories to a card', () => {
    expect(() =>
      assertValidPayment({
        paymentMethod: PaymentMethod.CREDIT,
        cardId: 'card-1',
        amount: 10,
        category: income,
      }),
    ).toThrow(CreditPaymentNotAllowedException);
  });

  it.each([
    [PaymentMethod.PIX, 300],
    [PaymentMethod.CREDIT, -300],
  ])('refuses installments for %s of %d', (paymentMethod, amount) => {
    expect(() =>
      assertValidPayment({
        paymentMethod,
        cardId: 'card-1',
        installments: 2,
        amount,
        category: expense,
      }),
    ).toThrow(InstallmentsRequireCreditException);
  });
});
