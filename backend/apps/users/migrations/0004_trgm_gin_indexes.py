from django.db import migrations


def create_trgm_indexes(apps, schema_editor):
    if schema_editor.connection.vendor != 'postgresql':
        return
    schema_editor.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")
    schema_editor.execute("CREATE INDEX IF NOT EXISTS users_email_trgm ON users_user USING GIN (email gin_trgm_ops);")
    schema_editor.execute("CREATE INDEX IF NOT EXISTS users_username_trgm ON users_user USING GIN (username gin_trgm_ops);")
    schema_editor.execute("CREATE INDEX IF NOT EXISTS users_first_name_trgm ON users_user USING GIN (first_name gin_trgm_ops);")
    schema_editor.execute("CREATE INDEX IF NOT EXISTS users_last_name_trgm ON users_user USING GIN (last_name gin_trgm_ops);")


def drop_trgm_indexes(apps, schema_editor):
    if schema_editor.connection.vendor != 'postgresql':
        return
    schema_editor.execute("DROP INDEX IF EXISTS users_email_trgm;")
    schema_editor.execute("DROP INDEX IF EXISTS users_username_trgm;")
    schema_editor.execute("DROP INDEX IF EXISTS users_first_name_trgm;")
    schema_editor.execute("DROP INDEX IF EXISTS users_last_name_trgm;")


class Migration(migrations.Migration):
    dependencies = [
        ('users', '0003_user_users_user_email_6f2530_idx_and_more'),
    ]

    operations = [
        migrations.RunPython(create_trgm_indexes, drop_trgm_indexes),
    ]

