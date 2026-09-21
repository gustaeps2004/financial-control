import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCardsSchema1789951220124 implements MigrationInterface {
  name = 'CreateCardsSchema1789951220124';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "cards"`);

    await queryRunner.query(`
      CREATE TABLE "cards"."cards" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        "user_id" uuid NOT NULL,
        "brand" character varying(60) NOT NULL,
        "mark" character varying(10) NOT NULL,
        "swatch" character varying(30) NOT NULL,
        "nickname" character varying(60) NOT NULL,
        "credit_limit" numeric(12,2) NOT NULL DEFAULT 0,
        "closing_day" smallint NOT NULL DEFAULT 10,
        "opening_balance" numeric(12,2) NOT NULL DEFAULT 0,
        CONSTRAINT "PK_cards_cards" PRIMARY KEY ("id"),
        CONSTRAINT "FK_cards_cards_user_id" FOREIGN KEY ("user_id")
          REFERENCES "authentications"."users" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_cards_cards_user_id"
        ON "cards"."cards" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "cards"."IDX_cards_cards_user_id"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "cards"."cards"`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS "cards"`);
  }
}
