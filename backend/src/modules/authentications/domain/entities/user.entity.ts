import { BaseDomainEntity } from '../../../../shared/domain/base-domain-entity';
import { AuthProvider } from '../enums/auth-provider.enum';

export class User extends BaseDomainEntity {
  username!: string;
  email!: string;
  name: string = '';
  emailConfirmed: boolean = false;
  // Null for accounts that only sign in with Google.
  password: string | null = null;
  // The outside account this one signs in with (LOCAL: none) and its id
  // there, for Google the ID token's `sub`. Linking a password account to
  // Google keeps its password.
  provider: AuthProvider = AuthProvider.LOCAL;
  providerId: string | null = null;
  privacyPolicyAccepted: boolean = false;
  termsOfUseAccepted: boolean = false;
}
