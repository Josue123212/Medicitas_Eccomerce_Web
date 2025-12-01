from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ecommerce', '0026_alter_category_is_active'),
    ]

    operations = [
        migrations.AddField(
            model_name='price',
            name='valid_until',
            field=models.DateTimeField(null=True, blank=True),
        ),
    ]

