import { BusinessException } from '../../../../shared/exceptions/business.exception';

export class GoogleEmailNotVerifiedException extends BusinessException {
  constructor() {
    // 403 Forbidden: an email Google hasn't confirmed can't stand for an account.
    super(
      "The Google account's email is not verified",
      403,
      'GOOGLE_EMAIL_NOT_VERIFIED',
    );
  }
}
