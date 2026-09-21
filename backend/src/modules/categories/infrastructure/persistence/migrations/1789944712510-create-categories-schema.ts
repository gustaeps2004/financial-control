import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategoriesSchema1789944712510 implements MigrationInterface {
  name = 'CreateCategoriesSchema1789944712510';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "categories"`);

    await queryRunner.query(`
      CREATE TABLE "categories"."categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        "user_id" uuid NOT NULL,
        "name" character varying(60) NOT NULL,
        CONSTRAINT "PK_categories_categories" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_categories_categories_user_id_name" UNIQUE ("user_id", "name"),
        CONSTRAINT "FK_categories_categories_user_id" FOREIGN KEY ("user_id")
          REFERENCES "authentications"."users" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_categories_categories_user_id"
        ON "categories"."categories" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "categories"."IDX_categories_categories_user_id"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "categories"."categories"`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS "categories"`);
  }
}
