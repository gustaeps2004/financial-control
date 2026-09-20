import { BusinessException } from '../../../../shared/exceptions/business.exception';

export class UserNotFoundException extends BusinessException {
  constructor() {
    // 404 Not Found
    super('User not found', 404);
  }
}
