from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ecommerce', '0022_order_currency'),
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='provider',
            field=models.CharField(max_length=30, default='stripe'),
        ),
    ]

