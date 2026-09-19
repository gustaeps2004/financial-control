import { UserSession } from '../entities/user-session.entity';

export abstract class SessionsRepository {
  abstract save(session: UserSession): Promise<UserSession>;
}
