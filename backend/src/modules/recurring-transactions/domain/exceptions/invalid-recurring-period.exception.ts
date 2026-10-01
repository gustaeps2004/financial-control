import { BusinessException } from '../../../../shared/exceptions/business.exception';

export class InvalidRecurringPeriodException extends BusinessException {
  constructor() {
    // 422 Unprocessable Entity
    super(
      'The end month must not be before the start month',
      422,
      'INVALID_RECURRING_PERIOD',
    );
  }
}
