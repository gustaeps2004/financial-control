import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOccurrencePayments1791410517746 implements MigrationInterface {
  name = 'CreateOccurrencePayments1791410517746';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // recurring_transaction_id keeps the default NO ACTION: recurring
    // transactions are only soft-deleted, and a user deletion cascades to
    // every table in the same statement, which NO ACTION allows. Constraint
    // names shorten that column to stay within Postgres' 63 characters.
    await queryRunner.query(`
      CREATE TABLE "recurring_transactions"."occurrence_payments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        "user_id" uuid NOT NULL,
        "recurring_transaction_id" uuid NOT NULL,
        "month" date NOT NULL,
        CONSTRAINT "PK_recurring_transactions_occurrence_payments" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_recurring_transactions_occurrence_payments_month"
          CHECK (EXTRACT(DAY FROM "month") = 1),
        CONSTRAINT "FK_recurring_transactions_occurrence_payments_user_id" FOREIGN KEY ("user_id")
          REFERENCES "authentications"."users" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_recurring_transactions_occurrence_payments_recurring_id"
          FOREIGN KEY ("recurring_transaction_id")
          REFERENCES "recurring_transactions"."recurring_transactions" ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_recurring_transactions_occurrence_payments_user_id"
        ON "recurring_transactions"."occurrence_payments" ("user_id")
    `);
    // One live mark per occurrence: a recurring transaction in a month.
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_recurring_transactions_occurrence_payments_occurrence"
        ON "recurring_transactions"."occurrence_payments" ("recurring_transaction_id", "month")
        WHERE "deleted_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "recurring_transactions"."UQ_recurring_transactions_occurrence_payments_occurrence"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "recurring_transactions"."IDX_recurring_transactions_occurrence_payments_user_id"`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "recurring_transactions"."occurrence_payments"`,
    );
  }
}
