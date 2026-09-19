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

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;
}
