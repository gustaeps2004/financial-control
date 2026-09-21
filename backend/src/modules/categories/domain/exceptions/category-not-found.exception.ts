import { BusinessException } from '../../../../shared/exceptions/business.exception';

export class CategoryNotFoundException extends BusinessException {
  constructor() {
    // 404 Not Found
    super('Category not found', 404);
  }
}
