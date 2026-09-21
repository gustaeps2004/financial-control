import { BusinessException } from '../../../../shared/exceptions/business.exception';

export class CategoryAlreadyExistsException extends BusinessException {
  constructor(name: string) {
    // 409 Conflict
    super(`Category "${name}" already exists`, 409);
  }
}
