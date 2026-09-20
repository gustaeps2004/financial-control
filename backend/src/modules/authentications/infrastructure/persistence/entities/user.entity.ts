import { Column, Entity, Index } from 'typeorm';
import { EntityBase } from '../../../../../shared/entities/base.entity';
import { AuthProvider } from '../../../domain/enums/auth-provider.enum';

@Entity({ name: 'users', schema: 'authentications' })
export class UserEntity extends EntityBase {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  username!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 100, default: '' })
  name: string = '';

  @Column({ type: 'boolean', default: false })
  emailConfirmed: boolean = false;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string | null = null;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    enumName: 'users_provider_enum',
    default: AuthProvider.LOCAL,
  })
  provider: AuthProvider = AuthProvider.LOCAL;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  providerId: string | null = null;

  @Column({ type: 'boolean', default: false })
  privacyPolicyAccepted: boolean = false;

  @Column({ type: 'boolean', default: false })
  termsOfUseAccepted: boolean = false;
}
