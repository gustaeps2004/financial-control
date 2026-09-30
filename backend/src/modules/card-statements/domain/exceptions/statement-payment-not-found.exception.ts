import { BusinessException } from '../../../../shared/exceptions/business.exception';

export class StatementPaymentNotFoundException extends BusinessException {
  constructor() {
    // 404 Not Found
    super('Statement payment not found', 404);
  }
}
