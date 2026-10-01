import { BusinessException } from '../../../../shared/exceptions/business.exception';

export class CardNotFoundException extends BusinessException {
  constructor() {
    // 404 Not Found
    super('Card not found', 404, 'CARD_NOT_FOUND');
  }
}
