import 'dotenv/config';
import { DataSource } from 'typeorm';
import { buildDatabaseConnectionOptions } from './database-connection.config';

export const AppDataSource = new DataSource({
  ...buildDatabaseConnectionOptions(process.env),
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/shared/database/migrations/*.ts'],
});
