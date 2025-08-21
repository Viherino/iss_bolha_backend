import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveCoachColumn1755437136907 implements MigrationInterface {
    name = 'RemoveCoachColumn1755437136907'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "coach"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "coach" boolean NOT NULL DEFAULT false`);
    }

}
