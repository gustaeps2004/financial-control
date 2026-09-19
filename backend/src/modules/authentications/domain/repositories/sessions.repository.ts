import { UserSession } from '../entities/user-session.entity';

export abstract class SessionsRepository {
  abstract findActiveByToken(token: string): Promise<UserSession | null>;
  abstract save(session: UserSession): Promise<UserSession>;
}
