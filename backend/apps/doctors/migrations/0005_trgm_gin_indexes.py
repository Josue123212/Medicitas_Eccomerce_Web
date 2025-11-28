from django.db import migrations


def create_trgm_indexes(apps, schema_editor):
    if schema_editor.connection.vendor != 'postgresql':
        return
    schema_editor.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")
    schema_editor.execute("CREATE INDEX IF NOT EXISTS doctors_specialization_trgm ON doctors_doctor USING GIN (specialization gin_trgm_ops);")


def drop_trgm_indexes(apps, schema_editor):
    if schema_editor.connection.vendor != 'postgresql':
        return
    schema_editor.execute("DROP INDEX IF EXISTS doctors_specialization_trgm;")


class Migration(migrations.Migration):
    dependencies = [
        ('doctors', '0004_alter_doctor_options_and_more'),
    ]

    operations = [
        migrations.RunPython(create_trgm_indexes, drop_trgm_indexes),
    ]

