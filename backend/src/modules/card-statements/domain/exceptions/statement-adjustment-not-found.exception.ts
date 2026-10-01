import { BusinessException } from '../../../../shared/exceptions/business.exception';

export class StatementAdjustmentNotFoundException extends BusinessException {
  constructor() {
    // 404 Not Found
    super(
      'Statement adjustment not found',
      404,
      'STATEMENT_ADJUSTMENT_NOT_FOUND',
    );
  }
}
