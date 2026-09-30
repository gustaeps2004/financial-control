import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDueDayToCards1790810449115 implements MigrationInterface {
  name = 'AddDueDayToCards1790810449115';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "cards"."cards"
        ADD COLUMN "due_day" smallint
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "cards"."cards"
        DROP COLUMN "due_day"
    `);
  }
}
