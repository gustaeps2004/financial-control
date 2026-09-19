import { SnakeNamingStrategy } from './snake-naming.strategy';

describe('SnakeNamingStrategy', () => {
  const strategy = new SnakeNamingStrategy();

  it('snake-cases table names', () => {
    expect(strategy.tableName('UserSession', undefined)).toBe('user_session');
  });

  it('respects a user-specified table name', () => {
    expect(strategy.tableName('UserSession', 'custom_name')).toBe(
      'custom_name',
    );
  });

  it('snake-cases column names', () => {
    expect(strategy.columnName('emailConfirmed', undefined, [])).toBe(
      'email_confirmed',
    );
  });

  it('snake-cases the default join column name to match columnName()', () => {
    // A @JoinColumn() on relation `user` and a plain @Column() userId must
    // resolve to the same physical column, or TypeORM treats them as two
    // different columns (see git history for the bug this caused).
    expect(strategy.joinColumnName('user', 'id')).toBe(
      strategy.columnName('userId', undefined, []),
    );
  });
});
