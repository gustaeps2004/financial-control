import { GoogleLoginResult } from '../../../application/sessions.service';
import { LoginResponseDto } from './login-response.dto';
import { UserResponseDto } from './user-response.dto';

export class GoogleLoginResponseDto extends LoginResponseDto {
  // Who signed in: unlike with a password, nobody typed the email.
  readonly user: UserResponseDto;
  // True when this sign-in created the account, which then needs setting up.
  readonly isNewUser: boolean;

  constructor(result: GoogleLoginResult) {
    super(result.accessToken, result.expiresAt);
    this.user = new UserResponseDto(result.user);
    this.isNewUser = result.isNewUser;
  }
}
