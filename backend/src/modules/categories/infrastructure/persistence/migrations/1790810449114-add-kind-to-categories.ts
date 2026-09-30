import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddKindToCategories1790810449114 implements MigrationInterface {
  name = 'AddKindToCategories1790810449114';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "categories"."categories_kind_enum"
        AS ENUM ('INCOME', 'EXPENSE', 'FIXED_BILL', 'SAVINGS')
    `);
    // Every category created so far was a spending bucket.
    await queryRunner.query(`
      ALTER TABLE "categories"."categories"
        ADD COLUMN "kind" "categories"."categories_kind_enum" NOT NULL DEFAULT 'EXPENSE'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "categories"."categories"
        DROP COLUMN "kind"
    `);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "categories"."categories_kind_enum"`,
    );
  }
}
