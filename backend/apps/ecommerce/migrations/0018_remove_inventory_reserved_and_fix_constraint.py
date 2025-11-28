from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ecommerce', '0017_inventory_constraints_and_indexes'),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name='inventory',
            name='inventory_non_negative',
        ),
        migrations.RemoveConstraint(
            model_name='inventory',
            name='inventory_reserved_not_exceed_stock',
        ),
        migrations.RemoveField(
            model_name='inventory',
            name='reserved',
        ),
        migrations.AddConstraint(
            model_name='inventory',
            constraint=models.CheckConstraint(
                check=models.Q(stock__gte=models.F('reserved_stock')),
                name='inventory_reserved_stock_not_exceed_stock',
            ),
        ),
        migrations.AddConstraint(
            model_name='inventory',
            constraint=models.CheckConstraint(
                check=(
                    models.Q(stock__gte=0) & models.Q(reserved_stock__gte=0)
                ),
                name='inventory_non_negative',
            ),
        ),
    ]
