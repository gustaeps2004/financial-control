import { BusinessException } from '../../../../shared/exceptions/business.exception';

export class UsernameAlreadyRegisteredException extends BusinessException {
  constructor(username: string) {
    // 409 Conflict
    super(`Username "${username}" is already registered`, 409);
  }
}
