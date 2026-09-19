import { BusinessException } from '../../../../shared/exceptions/business.exception';

export class EmailAlreadyRegisteredException extends BusinessException {
  constructor(email: string) {
    // 409 Conflict
    super(`Email "${email}" is already registered`, 409);
  }
}
