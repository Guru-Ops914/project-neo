import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCatalogueProducts1788846402793
  implements MigrationInterface
{
  name = 'CreateCatalogueProducts1788846402793';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
    `);

    await queryRunner.query(`
      CREATE TABLE "catalogue_products" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "sku" character varying(150) NOT NULL,
        "title" character varying(255) NOT NULL,
        "category" character varying(150) NOT NULL,
        "description" text,
        "price" numeric(12,2) NOT NULL,
        "attributes" jsonb NOT NULL DEFAULT '{}',
        "images" jsonb NOT NULL DEFAULT '[]',
        "marketplace" character varying(100),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),

        CONSTRAINT "PK_catalogue_products"
        PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_catalogue_user_sku"
      ON "catalogue_products" ("userId", "sku")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_catalogue_user_category"
      ON "catalogue_products" ("userId", "category")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_catalogue_user"
      ON "catalogue_products" ("userId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_catalogue_user"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_catalogue_user_category"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_catalogue_user_sku"
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "catalogue_products"
    `);
  }
}