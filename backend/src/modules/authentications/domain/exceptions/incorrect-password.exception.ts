import { BusinessException } from '../../../../shared/exceptions/business.exception';

export class IncorrectPasswordException extends BusinessException {
  constructor() {
    // 403 Forbidden: signed in, but the password confirmation didn't match.
    super('Incorrect password', 403);
  }
}
