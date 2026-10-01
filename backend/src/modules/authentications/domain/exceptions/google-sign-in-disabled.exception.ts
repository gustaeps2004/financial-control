import { BusinessException } from '../../../../shared/exceptions/business.exception';

export class GoogleSignInDisabledException extends BusinessException {
  constructor() {
    // 503 Service Unavailable: no Google client ID is configured.
    super('Google sign-in is not configured', 503, 'GOOGLE_SIGN_IN_DISABLED');
  }
}
