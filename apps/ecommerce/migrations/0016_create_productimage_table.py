from django.db import migrations


class Migration(migrations.Migration):
    """
    Manual migration to create missing table `ecommerce_productimage` in SQLite.

    Context:
    - The current database does not have the `ecommerce_productimage` table,
      causing OperationalError when listing products that access related images.
    - Existing migration history indicates initial migrations are applied, but
      the table is still missing (likely due to historical mismatch).

    This migration uses RunSQL to create the table if it does not exist, without
    affecting existing data.
    """

    dependencies = [
        ('ecommerce', '0015_add_created_at_to_inventory'),
    ]

    operations = [
        migrations.RunSQL(
            sql=(
                """
                CREATE TABLE IF NOT EXISTS "ecommerce_productimage" (
                    "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
                    "image" varchar(100) NOT NULL,
                    "position" integer NOT NULL DEFAULT 0,
                    "product_id" integer NOT NULL
                );
                CREATE INDEX IF NOT EXISTS "ecommerce_productimage_product_id_idx"
                ON "ecommerce_productimage" ("product_id");
                """
            ),
            reverse_sql=(
                """
                DROP TABLE IF EXISTS "ecommerce_productimage";
                """
            ),
        ),
    ]