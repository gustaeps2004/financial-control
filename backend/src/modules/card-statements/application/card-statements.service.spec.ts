import { Test, TestingModule } from '@nestjs/testing';
import { YearMonth } from '../../../shared/domain/calendar/year-month';
import { CardsService } from '../../cards/application/cards.service';
import { Card } from '../../cards/domain/entities/card.entity';
import { CardNotFoundException } from '../../cards/domain/exceptions/card-not-found.exception';
import { StatementAdjustment } from '../domain/entities/statement-adjustment.entity';
import { StatementPayment } from '../domain/entities/statement-payment.entity';
import { StatementAdjustmentNotFoundException } from '../domain/exceptions/statement-adjustment-not-found.exception';
import { StatementPaymentNotFoundException } from '../domain/exceptions/statement-payment-not-found.exception';
import { StatementAdjustmentsRepository } from '../domain/repositories/statement-adjustments.repository';
import { StatementPaymentsRepository } from '../domain/repositories/statement-payments.repository';
import { CardStatementsService } from './card-statements.service';

describe('CardStatementsService', () => {
  let service: CardStatementsService;
  let adjustmentsRepository: jest.Mocked<StatementAdjustmentsRepository>;
  let paymentsRepository: jest.Mocked<StatementPaymentsRepository>;
  let cardsService: jest.Mocked<CardsService>;

  const userId = 'user-1';
  const october = YearMonth.parse('2026-10');
  const itau = Object.assign(new Card(), { id: 'card-itau', userId });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardStatementsService,
        {
          provide: StatementAdjustmentsRepository,
          useValue: {
            findAllByUser: jest.fn(),
            findByCardAndMonth: jest.fn(),
            save: jest.fn((adjustment: StatementAdjustment) =>
              Promise.resolve(adjustment),
            ),
            remove: jest.fn(),
          },
        },
        {
          provide: StatementPaymentsRepository,
          useValue: {
            findAllByUser: jest.fn(),
            findById: jest.fn(),
            save: jest.fn((payment: StatementPayment) =>
              Promise.resolve(payment),
            ),
            remove: jest.fn(),
          },
        },
        { provide: CardsService, useValue: { getOwned: jest.fn() } },
      ],
    }).compile();

    service = module.get(CardStatementsService);
    adjustmentsRepository = module.get(StatementAdjustmentsRepository);
    paymentsRepository = module.get(StatementPaymentsRepository);
    cardsService = module.get(CardsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setAdjustment', () => {
    it('creates the adjustment of a statement', async () => {
      cardsService.getOwned.mockResolvedValue(itau);
      adjustmentsRepository.findByCardAndMonth.mockResolvedValue(null);

      const result = await service.setAdjustment(userId, 'card-itau', october, {
        amount: 1663.08,
      });

      expect(result).toMatchObject({
        userId,
        cardId: 'card-itau',
        amount: 1663.08,
      });
      expect(result.statementMonth.toString()).toBe('2026-10');
    });

    it('replaces the existing adjustment instead of adding another', async () => {
      const existing = Object.assign(new StatementAdjustment(), {
        id: 'adj-1',
        userId,
        cardId: 'card-itau',
        statementMonth: october,
        amount: 1663.08,
      });
      cardsService.getOwned.mockResolvedValue(itau);
      adjustmentsRepository.findByCardAndMonth.mockResolvedValue(existing);

      const result = await service.setAdjustment(userId, 'card-itau', october, {
        amount: 1388.08,
      });

      expect(result.id).toBe('adj-1');
      expect(result.amount).toBe(1388.08);
    });

    it('rejects a card the user does not own', async () => {
      cardsService.getOwned.mockRejectedValue(new CardNotFoundException());

      await expect(
        service.setAdjustment(userId, 'card-x', october, { amount: 10 }),
      ).rejects.toThrow(CardNotFoundException);
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(adjustmentsRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('removeAdjustment', () => {
    it('throws when the statement has no adjustment', async () => {
      cardsService.getOwned.mockResolvedValue(itau);
      adjustmentsRepository.findByCardAndMonth.mockResolvedValue(null);

      await expect(
        service.removeAdjustment(userId, 'card-itau', october),
      ).rejects.toThrow(StatementAdjustmentNotFoundException);
    });
  });

  describe('registerPayment', () => {
    it('records a payment for a statement', async () => {
      cardsService.getOwned.mockResolvedValue(itau);

      const result = await service.registerPayment(
        userId,
        'card-itau',
        october,
        { paidOn: '2026-10-10', amount: 2852 },
      );

      expect(result).toMatchObject({
        userId,
        cardId: 'card-itau',
        paidOn: '2026-10-10',
        amount: 2852,
      });
    });
  });

  describe('removePayment', () => {
    it('hides payments of another user', async () => {
      paymentsRepository.findById.mockResolvedValue(
        Object.assign(new StatementPayment(), {
          id: 'pay-1',
          userId: 'someone-else',
        }),
      );

      await expect(service.removePayment(userId, 'pay-1')).rejects.toThrow(
        StatementPaymentNotFoundException,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(paymentsRepository.remove).not.toHaveBeenCalled();
    });
  });
});
