import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNameToUsers1789940718008 implements MigrationInterface {
  name = 'AddNameToUsers1789940718008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "authentications"."users"
        ADD COLUMN "name" character varying(100) NOT NULL DEFAULT ''
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "authentications"."users"
        DROP COLUMN "name"
    `);
  }
}
