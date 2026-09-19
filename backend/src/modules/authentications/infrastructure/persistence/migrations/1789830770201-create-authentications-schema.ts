import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuthenticationsSchema1789830770201 implements MigrationInterface {
  name = 'CreateAuthenticationsSchema1789830770201';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "authentications"`);

    await queryRunner.query(`
      CREATE TYPE "authentications"."users_provider_enum" AS ENUM ('local', 'google')
    `);

    await queryRunner.query(`
      CREATE TABLE "authentications"."users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        "username" character varying(50) NOT NULL,
        "email" character varying(255) NOT NULL,
        "email_confirmed" boolean NOT NULL DEFAULT false,
        "password" character varying(255),
        "provider" "authentications"."users_provider_enum" NOT NULL DEFAULT 'local',
        "provider_id" character varying(255),
        "privacy_policy_accepted" boolean NOT NULL DEFAULT false,
        "terms_of_use_accepted" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_authentications_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_authentications_users_username" UNIQUE ("username"),
        CONSTRAINT "UQ_authentications_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_authentications_users_provider_id" UNIQUE ("provider_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "authentications"."user_sessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        "user_id" uuid NOT NULL,
        "token" character varying(255) NOT NULL,
        "ip_address" character varying(45),
        "user_agent" character varying(255),
        "expires_at" TIMESTAMPTZ NOT NULL,
        "revoked_at" TIMESTAMPTZ,
        CONSTRAINT "PK_authentications_user_sessions" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_authentications_user_sessions_token" UNIQUE ("token"),
        CONSTRAINT "FK_authentications_user_sessions_user_id" FOREIGN KEY ("user_id")
          REFERENCES "authentications"."users" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_authentications_user_sessions_user_id"
        ON "authentications"."user_sessions" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "authentications"."IDX_authentications_user_sessions_user_id"`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "authentications"."user_sessions"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "authentications"."users"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "authentications"."users_provider_enum"`,
    );
    await queryRunner.query(`DROP SCHEMA IF EXISTS "authentications"`);
  }
}
