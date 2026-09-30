import { Injectable } from '@nestjs/common';
import { YearMonth } from '../../../shared/domain/calendar/year-month';
import { CardsService } from '../../cards/application/cards.service';
import { StatementAdjustment } from '../domain/entities/statement-adjustment.entity';
import { StatementPayment } from '../domain/entities/statement-payment.entity';
import { StatementAdjustmentNotFoundException } from '../domain/exceptions/statement-adjustment-not-found.exception';
import { StatementPaymentNotFoundException } from '../domain/exceptions/statement-payment-not-found.exception';
import { StatementAdjustmentsRepository } from '../domain/repositories/statement-adjustments.repository';
import { StatementPaymentsRepository } from '../domain/repositories/statement-payments.repository';
import { RegisterStatementPaymentDto } from './dto/register-statement-payment.dto';
import { SetStatementAdjustmentDto } from './dto/set-statement-adjustment.dto';

@Injectable()
export class CardStatementsService {
  constructor(
    private readonly adjustmentsRepository: StatementAdjustmentsRepository,
    private readonly paymentsRepository: StatementPaymentsRepository,
    private readonly cardsService: CardsService,
  ) {}

  /** Creates or replaces the single adjustment of a card's statement. */
  async setAdjustment(
    userId: string,
    cardId: string,
    statementMonth: YearMonth,
    dto: SetStatementAdjustmentDto,
  ): Promise<StatementAdjustment> {
    await this.cardsService.getOwned(userId, cardId);

    const adjustment =
      (await this.adjustmentsRepository.findByCardAndMonth(
        cardId,
        statementMonth,
      )) ??
      Object.assign(new StatementAdjustment(), {
        userId,
        cardId,
        statementMonth,
      });
    adjustment.amount = dto.amount;

    return this.adjustmentsRepository.save(adjustment);
  }

  async removeAdjustment(
    userId: string,
    cardId: string,
    statementMonth: YearMonth,
  ): Promise<void> {
    await this.cardsService.getOwned(userId, cardId, { includeDeleted: true });

    const adjustment = await this.adjustmentsRepository.findByCardAndMonth(
      cardId,
      statementMonth,
    );
    if (!adjustment) {
      throw new StatementAdjustmentNotFoundException();
    }
    await this.adjustmentsRepository.remove(adjustment);
  }

  async registerPayment(
    userId: string,
    cardId: string,
    statementMonth: YearMonth,
    dto: RegisterStatementPaymentDto,
  ): Promise<StatementPayment> {
    await this.cardsService.getOwned(userId, cardId);

    const payment = Object.assign(new StatementPayment(), {
      userId,
      cardId,
      statementMonth,
      paidOn: dto.paidOn,
      amount: dto.amount,
    });

    return this.paymentsRepository.save(payment);
  }

  async removePayment(userId: string, paymentId: string): Promise<void> {
    const payment = await this.paymentsRepository.findById(paymentId);
    if (!payment || payment.userId !== userId) {
      throw new StatementPaymentNotFoundException();
    }
    await this.paymentsRepository.remove(payment);
  }

  // Both lists stay small (a handful of rows per card per year), so readers
  // get them whole and filter in memory.
  listAdjustments(userId: string): Promise<StatementAdjustment[]> {
    return this.adjustmentsRepository.findAllByUser(userId);
  }

  listPayments(userId: string): Promise<StatementPayment[]> {
    return this.paymentsRepository.findAllByUser(userId);
  }
}
