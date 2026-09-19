import { BusinessException } from '../../../../shared/exceptions/business.exception';

export class InvalidCredentialsException extends BusinessException {
  constructor() {
    // 401 Unauthorized
    super('Invalid email or password', 401);
  }
}
