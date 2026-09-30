import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRecurringTransactionsSchema1790810449116 implements MigrationInterface {
  name = 'CreateRecurringTransactionsSchema1790810449116';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE SCHEMA IF NOT EXISTS "recurring_transactions"`,
    );

    await queryRunner.query(`
      CREATE TYPE "recurring_transactions"."recurring_transactions_payment_method_enum"
        AS ENUM ('DEBIT', 'CREDIT', 'PIX', 'CASH', 'BANK_TRANSFER')
    `);

    // category_id/card_id keep the default NO ACTION: categories and cards are
    // only soft-deleted, and a user deletion cascades to every table in the
    // same statement, which NO ACTION (unlike RESTRICT) allows.
    await queryRunner.query(`
      CREATE TABLE "recurring_transactions"."recurring_transactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        "user_id" uuid NOT NULL,
        "category_id" uuid NOT NULL,
        "description" character varying(140) NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        "day_of_month" smallint NOT NULL,
        "start_month" date NOT NULL,
        "end_month" date,
        "payment_method" "recurring_transactions"."recurring_transactions_payment_method_enum",
        "card_id" uuid,
        CONSTRAINT "PK_recurring_transactions_recurring_transactions" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_recurring_transactions_recurring_transactions_amount"
          CHECK ("amount" > 0),
        CONSTRAINT "CHK_recurring_transactions_recurring_transactions_day_of_month"
          CHECK ("day_of_month" BETWEEN 1 AND 31),
        CONSTRAINT "CHK_recurring_transactions_recurring_transactions_period"
          CHECK ("end_month" IS NULL OR "end_month" >= "start_month"),
        CONSTRAINT "FK_recurring_transactions_recurring_transactions_user_id" FOREIGN KEY ("user_id")
          REFERENCES "authentications"."users" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_recurring_transactions_recurring_transactions_category_id" FOREIGN KEY ("category_id")
          REFERENCES "categories"."categories" ("id"),
        CONSTRAINT "FK_recurring_transactions_recurring_transactions_card_id" FOREIGN KEY ("card_id")
          REFERENCES "cards"."cards" ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_recurring_transactions_recurring_transactions_user_id"
        ON "recurring_transactions"."recurring_transactions" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "recurring_transactions"."IDX_recurring_transactions_recurring_transactions_user_id"`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "recurring_transactions"."recurring_transactions"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "recurring_transactions"."recurring_transactions_payment_method_enum"`,
    );
    await queryRunner.query(`DROP SCHEMA IF EXISTS "recurring_transactions"`);
  }
}
