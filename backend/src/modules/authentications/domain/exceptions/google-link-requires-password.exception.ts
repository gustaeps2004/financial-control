import { BusinessException } from '../../../../shared/exceptions/business.exception';

export class GoogleLinkRequiresPasswordException extends BusinessException {
  constructor() {
    // 409 Conflict: the email belongs to a password account, and only that
    // password can link it to Google.
    super(
      'An account with this email already exists; confirm its password to link it to Google',
      409,
      'GOOGLE_LINK_REQUIRES_PASSWORD',
    );
  }
}
