import { StatementAdjustment } from '../../../domain/entities/statement-adjustment.entity';

export class StatementAdjustmentResponseDto {
  readonly id: string;
  readonly cardId: string;
  readonly statementMonth: string;
  readonly amount: number;

  constructor(adjustment: StatementAdjustment) {
    this.id = adjustment.id!;
    this.cardId = adjustment.cardId;
    this.statementMonth = adjustment.statementMonth.toString();
    this.amount = adjustment.amount;
  }
}
