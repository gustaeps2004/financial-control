import { BusinessException } from '../../../../shared/exceptions/business.exception';

export class SessionNotFoundException extends BusinessException {
  constructor() {
    // 404 Not Found
    super('Session not found or already revoked', 404);
  }
}
