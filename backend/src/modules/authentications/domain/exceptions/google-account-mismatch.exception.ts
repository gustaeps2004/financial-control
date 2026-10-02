import { BusinessException } from '../../../../shared/exceptions/business.exception';

export class GoogleAccountMismatchException extends BusinessException {
  constructor() {
    // 403 Forbidden: signed in, but confirmed with a Google account that
    // isn't the one linked to this account.
    super(
      'This Google account is not the one linked to the account',
      403,
      'GOOGLE_ACCOUNT_MISMATCH',
    );
  }
}
