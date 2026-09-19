import { BaseDomainEntity } from '../../../../shared/domain/base-domain-entity';
import { AuthProvider } from '../enums/auth-provider.enum';

export class User extends BaseDomainEntity {
  username!: string;
  email!: string;
  emailConfirmed: boolean = false;
  password: string | null = null;
  provider: AuthProvider = AuthProvider.LOCAL;
  providerId: string | null = null;
  privacyPolicyAccepted: boolean = false;
  termsOfUseAccepted: boolean = false;
}
