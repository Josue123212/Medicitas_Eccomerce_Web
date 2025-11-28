from django.db import migrations, models
from django.db.models import F, Q


class Migration(migrations.Migration):

    dependencies = [
        ('ecommerce', '0015_add_created_at_to_inventory'),
    ]

    operations = [
        migrations.AddConstraint(
            model_name='inventory',
            constraint=models.CheckConstraint(
                check=Q(stock__gte=0) & Q(reserved__gte=0) & Q(reserved_stock__gte=0),
                name='inventory_non_negative'
            ),
        ),
        migrations.AddConstraint(
            model_name='inventory',
            constraint=models.CheckConstraint(
                check=Q(stock__gte=F('reserved') + F('reserved_stock')),
                name='inventory_reserved_not_exceed_stock'
            ),
        ),
        migrations.AddIndex(
            model_name='product',
            index=models.Index(
                fields=['is_active', 'category', 'created_at'],
                name='product_active_cat_created_idx'
            ),
        ),
        migrations.AddIndex(
            model_name='price',
            index=models.Index(
                fields=['is_active', 'product', 'valid_from'],
                name='price_active_product_valid_idx'
            ),
        ),
        migrations.AddIndex(
            model_name='order',
            index=models.Index(
                fields=['user', 'status', 'created_at'],
                name='order_user_status_created_idx'
            ),
        ),
        migrations.AddIndex(
            model_name='orderitem',
            index=models.Index(
                fields=['order'],
                name='orderitem_order_idx'
            ),
        ),
        migrations.AddIndex(
            model_name='cartitem',
            index=models.Index(
                fields=['cart'],
                name='cartitem_cart_idx'
            ),
        ),
        migrations.AddIndex(
            model_name='productimage',
            index=models.Index(
                fields=['product', 'position'],
                name='productimage_product_position_idx'
            ),
        ),
        migrations.AddIndex(
            model_name='address',
            index=models.Index(
                fields=['user', 'is_default'],
                name='address_user_default_idx'
            ),
        ),
    ]
