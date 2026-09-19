import { NamingStrategyInterface } from 'typeorm';
import { SnakeNamingStrategy } from './snake-naming.strategy';

export interface DatabaseEnv {
  DB_HOST?: string;
  DB_PORT?: string | number;
  DB_USERNAME?: string;
  DB_PASSWORD?: string;
  DB_NAME?: string;
}

export interface DatabaseConnectionOptions {
  type: 'postgres';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: false;
  namingStrategy: NamingStrategyInterface;
}

export function buildDatabaseConnectionOptions(
  env: DatabaseEnv,
): DatabaseConnectionOptions {
  return {
    type: 'postgres',
    host: env.DB_HOST ?? 'localhost',
    port: Number(env.DB_PORT ?? 5432),
    username: env.DB_USERNAME ?? 'postgres',
    password: env.DB_PASSWORD ?? 'postgres',
    database: env.DB_NAME ?? 'financial_control',
    synchronize: false,
    namingStrategy: new SnakeNamingStrategy(),
  };
}
