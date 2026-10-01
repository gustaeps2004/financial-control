import { BusinessException } from '../../../../shared/exceptions/business.exception';

export class TransactionNotFoundException extends BusinessException {
  constructor() {
    // 404 Not Found
    super('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
  }
}
