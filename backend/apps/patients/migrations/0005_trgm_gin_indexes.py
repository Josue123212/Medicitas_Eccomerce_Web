from django.db import migrations


def create_trgm_indexes(apps, schema_editor):
    if schema_editor.connection.vendor != 'postgresql':
        return
    schema_editor.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")
    schema_editor.execute("CREATE INDEX IF NOT EXISTS patients_address_trgm ON patients_patient USING GIN (address gin_trgm_ops);")
    schema_editor.execute("CREATE INDEX IF NOT EXISTS patients_emergency_contact_name_trgm ON patients_patient USING GIN (emergency_contact_name gin_trgm_ops);")
    schema_editor.execute("CREATE INDEX IF NOT EXISTS patients_emergency_contact_phone_trgm ON patients_patient USING GIN (emergency_contact_phone gin_trgm_ops);")


def drop_trgm_indexes(apps, schema_editor):
    if schema_editor.connection.vendor != 'postgresql':
        return
    schema_editor.execute("DROP INDEX IF EXISTS patients_address_trgm;")
    schema_editor.execute("DROP INDEX IF EXISTS patients_emergency_contact_name_trgm;")
    schema_editor.execute("DROP INDEX IF EXISTS patients_emergency_contact_phone_trgm;")


class Migration(migrations.Migration):
    dependencies = [
        ('patients', '0004_patient_patients_pa_status_ca3fc5_idx_and_more'),
    ]

    operations = [
        migrations.RunPython(create_trgm_indexes, drop_trgm_indexes),
    ]

