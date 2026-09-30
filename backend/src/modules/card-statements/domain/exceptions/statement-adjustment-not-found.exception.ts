import { BusinessException } from '../../../../shared/exceptions/business.exception';

export class StatementAdjustmentNotFoundException extends BusinessException {
  constructor() {
    // 404 Not Found
    super('Statement adjustment not found', 404);
  }
}
