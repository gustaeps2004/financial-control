import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCardStatementsSchema1790810449118 implements MigrationInterface {
  name = 'CreateCardStatementsSchema1790810449118';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "card_statements"`);

    // card_id keeps the default NO ACTION: cards are only soft-deleted, and a
    // user deletion cascades to every table in the same statement.
    await queryRunner.query(`
      CREATE TABLE "card_statements"."statement_adjustments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        "user_id" uuid NOT NULL,
        "card_id" uuid NOT NULL,
        "statement_month" date NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        CONSTRAINT "PK_card_statements_statement_adjustments" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_card_statements_statement_adjustments_amount"
          CHECK ("amount" <> 0),
        CONSTRAINT "CHK_card_statements_statement_adjustments_statement_month"
          CHECK (EXTRACT(DAY FROM "statement_month") = 1),
        CONSTRAINT "FK_card_statements_statement_adjustments_user_id" FOREIGN KEY ("user_id")
          REFERENCES "authentications"."users" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_card_statements_statement_adjustments_card_id" FOREIGN KEY ("card_id")
          REFERENCES "cards"."cards" ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_card_statements_statement_adjustments_user_id"
        ON "card_statements"."statement_adjustments" ("user_id")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_card_statements_statement_adjustments_card_id_statement_month"
        ON "card_statements"."statement_adjustments" ("card_id", "statement_month")
        WHERE "deleted_at" IS NULL
    `);

    await queryRunner.query(`
      CREATE TABLE "card_statements"."statement_payments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        "user_id" uuid NOT NULL,
        "card_id" uuid NOT NULL,
        "statement_month" date NOT NULL,
        "paid_on" date NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        CONSTRAINT "PK_card_statements_statement_payments" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_card_statements_statement_payments_amount"
          CHECK ("amount" > 0),
        CONSTRAINT "CHK_card_statements_statement_payments_statement_month"
          CHECK (EXTRACT(DAY FROM "statement_month") = 1),
        CONSTRAINT "FK_card_statements_statement_payments_user_id" FOREIGN KEY ("user_id")
          REFERENCES "authentications"."users" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_card_statements_statement_payments_card_id" FOREIGN KEY ("card_id")
          REFERENCES "cards"."cards" ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_card_statements_statement_payments_user_id"
        ON "card_statements"."statement_payments" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "card_statements"."IDX_card_statements_statement_payments_user_id"`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "card_statements"."statement_payments"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "card_statements"."UQ_card_statements_statement_adjustments_card_id_statement_month"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "card_statements"."IDX_card_statements_statement_adjustments_user_id"`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "card_statements"."statement_adjustments"`,
    );
    await queryRunner.query(`DROP SCHEMA IF EXISTS "card_statements"`);
  }
}
