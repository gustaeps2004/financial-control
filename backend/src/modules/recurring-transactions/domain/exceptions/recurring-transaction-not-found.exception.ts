import { BusinessException } from '../../../../shared/exceptions/business.exception';

export class RecurringTransactionNotFoundException extends BusinessException {
  constructor() {
    // 404 Not Found
    super('Recurring transaction not found', 404);
  }
}
