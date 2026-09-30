import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTransactionsSchema1790810449117 implements MigrationInterface {
  name = 'CreateTransactionsSchema1790810449117';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "transactions"`);

    await queryRunner.query(`
      CREATE TYPE "transactions"."transactions_payment_method_enum"
        AS ENUM ('DEBIT', 'CREDIT', 'PIX', 'CASH', 'BANK_TRANSFER')
    `);

    // category_id/card_id/recurring_transaction_id keep the default NO
    // ACTION: those rows are only soft-deleted, and a user deletion cascades
    // to every table in the same statement, which NO ACTION allows.
    await queryRunner.query(`
      CREATE TABLE "transactions"."transactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        "user_id" uuid NOT NULL,
        "category_id" uuid NOT NULL,
        "date" date NOT NULL,
        "description" character varying(140),
        "amount" numeric(12,2) NOT NULL,
        "payment_method" "transactions"."transactions_payment_method_enum",
        "card_id" uuid,
        "installments" smallint NOT NULL DEFAULT 1,
        "recurring_transaction_id" uuid,
        CONSTRAINT "PK_transactions_transactions" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_transactions_transactions_amount" CHECK ("amount" <> 0),
        CONSTRAINT "CHK_transactions_transactions_installments"
          CHECK ("installments" BETWEEN 1 AND 48),
        CONSTRAINT "FK_transactions_transactions_user_id" FOREIGN KEY ("user_id")
          REFERENCES "authentications"."users" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_transactions_transactions_category_id" FOREIGN KEY ("category_id")
          REFERENCES "categories"."categories" ("id"),
        CONSTRAINT "FK_transactions_transactions_card_id" FOREIGN KEY ("card_id")
          REFERENCES "cards"."cards" ("id"),
        CONSTRAINT "FK_transactions_transactions_recurring_transaction_id"
          FOREIGN KEY ("recurring_transaction_id")
          REFERENCES "recurring_transactions"."recurring_transactions" ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_transactions_user_id_date"
        ON "transactions"."transactions" ("user_id", "date")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_transactions_recurring_transaction_id"
        ON "transactions"."transactions" ("recurring_transaction_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "transactions"."IDX_transactions_transactions_recurring_transaction_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "transactions"."IDX_transactions_transactions_user_id_date"`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "transactions"."transactions"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "transactions"."transactions_payment_method_enum"`,
    );
    await queryRunner.query(`DROP SCHEMA IF EXISTS "transactions"`);
  }
}
