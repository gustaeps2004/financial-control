import { MigrationInterface, QueryRunner } from 'typeorm';

export class SimplifyUserSessionsToAuditLog1789854219171 implements MigrationInterface {
  name = 'SimplifyUserSessionsToAuditLog1789854219171';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "authentications"."user_sessions"
        DROP COLUMN "token",
        DROP COLUMN "ip_address",
        DROP COLUMN "user_agent",
        DROP COLUMN "revoked_at"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "authentications"."user_sessions"
        ADD COLUMN "token" character varying(255),
        ADD COLUMN "ip_address" character varying(45),
        ADD COLUMN "user_agent" character varying(255),
        ADD COLUMN "revoked_at" TIMESTAMPTZ
    `);
    await queryRunner.query(`
      ALTER TABLE "authentications"."user_sessions"
        ADD CONSTRAINT "UQ_authentications_user_sessions_token" UNIQUE ("token")
    `);
  }
}
