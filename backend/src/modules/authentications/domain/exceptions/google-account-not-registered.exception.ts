import { BusinessException } from '../../../../shared/exceptions/business.exception';

export class GoogleAccountNotRegisteredException extends BusinessException {
  constructor() {
    // 404 Not Found: signing in, not up, with a Google account that has no
    // account here yet.
    super(
      'No account is registered for this Google account',
      404,
      'GOOGLE_ACCOUNT_NOT_REGISTERED',
    );
  }
}
