import { MigrationInterface, QueryRunner } from 'typeorm';

// The original UNIQUE (user_id, name) constraint also covered soft-deleted
// rows, so re-creating or renaming to the name of a deleted category failed
// with a raw unique violation (500) instead of going through the service.
export class ScopeCategoryNameUniquenessToActiveRows1790810449113 implements MigrationInterface {
  name = 'ScopeCategoryNameUniquenessToActiveRows1790810449113';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "categories"."categories"
        DROP CONSTRAINT "UQ_categories_categories_user_id_name"
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_categories_categories_user_id_name"
        ON "categories"."categories" ("user_id", "name")
        WHERE "deleted_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "categories"."UQ_categories_categories_user_id_name"`,
    );
    await queryRunner.query(`
      ALTER TABLE "categories"."categories"
        ADD CONSTRAINT "UQ_categories_categories_user_id_name" UNIQUE ("user_id", "name")
    `);
  }
}
