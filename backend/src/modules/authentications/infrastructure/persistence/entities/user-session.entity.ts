import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { EntityBase } from '../../../../../shared/entities/base.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'user_sessions', schema: 'authentications' })
export class UserSessionEntity extends EntityBase {
  // Shadow relation for the FK constraint/cascade; persistence always goes
  // through the plain `userId` column below (see UserSessionMapper), so this
  // is never populated by application code.
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn()
  user?: UserEntity;

  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  token!: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null = null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string | null = null;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt: Date | null = null;
}
