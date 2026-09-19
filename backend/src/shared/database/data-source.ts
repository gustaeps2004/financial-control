import 'dotenv/config';
import { DataSource } from 'typeorm';
import { buildDatabaseConnectionOptions } from './database-connection.config';

export const AppDataSource = new DataSource({
  ...buildDatabaseConnectionOptions(process.env),
  // Only the infrastructure/persistence layer holds TypeORM-decorated
  // entities; plain domain entities (domain/entities/*.entity.ts) must not
  // be picked up here.
  entities: ['src/modules/**/infrastructure/persistence/entities/*.entity.ts'],
  migrations: [
    'src/shared/database/migrations/*.ts',
    'src/modules/**/infrastructure/persistence/migrations/*.ts',
  ],
});
