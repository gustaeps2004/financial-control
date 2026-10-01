import { BusinessException } from '../../../../shared/exceptions/business.exception';

export class InvalidGoogleCredentialException extends BusinessException {
  constructor() {
    // 401 Unauthorized: forged, expired, or issued to another app.
    super(
      'Invalid or expired Google credential',
      401,
      'INVALID_GOOGLE_CREDENTIAL',
    );
  }
}
