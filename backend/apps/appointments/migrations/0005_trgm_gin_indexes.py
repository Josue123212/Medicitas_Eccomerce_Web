from django.db import migrations


def create_trgm_indexes(apps, schema_editor):
    if schema_editor.connection.vendor != 'postgresql':
        return
    schema_editor.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")
    schema_editor.execute("CREATE INDEX IF NOT EXISTS appointments_reason_trgm ON appointments_appointment USING GIN (reason gin_trgm_ops);")
    schema_editor.execute("CREATE INDEX IF NOT EXISTS appointments_notes_trgm ON appointments_appointment USING GIN (notes gin_trgm_ops);")


def drop_trgm_indexes(apps, schema_editor):
    if schema_editor.connection.vendor != 'postgresql':
        return
    schema_editor.execute("DROP INDEX IF EXISTS appointments_reason_trgm;")
    schema_editor.execute("DROP INDEX IF EXISTS appointments_notes_trgm;")


class Migration(migrations.Migration):
    dependencies = [
        ('appointments', '0004_appointment_appointment_reason_0236f1_idx_and_more'),
    ]

    operations = [
        migrations.RunPython(create_trgm_indexes, drop_trgm_indexes),
    ]

