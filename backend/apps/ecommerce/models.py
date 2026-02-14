from django.db import models
from django.conf import settings
from django.utils import timezone


class Category(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(unique=True)
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200, default='')
    title = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Price(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='price')
    currency = models.CharField(max_length=8, default='USD')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    sale_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    # Campo existente en la base: NOT NULL
    valid_from = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField(null=True, blank=True)


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    position = models.PositiveIntegerField(default=0)


class Inventory(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='inventory')
    stock = models.PositiveIntegerField(default=0)
    # Alineamos con la base de datos existente que tiene columna 'reserved_stock' NOT NULL
    reserved_stock = models.PositiveIntegerField(default=0)
    # La base de datos tiene una columna NOT NULL 'location'
    location = models.CharField(max_length=120, default='main')
    # La base de datos tiene una columna NOT NULL 'min_stock'
    min_stock = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)


class Cart(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='carts')
    status = models.CharField(max_length=30, default='active')
    updated_at = models.DateTimeField(auto_now=True)


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        try:
            if self.unit_price is not None and self.quantity is not None:
                self.subtotal = self.unit_price * self.quantity
        except Exception:
            pass
        super().save(*args, **kwargs)


class Address(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='addresses')
    line1 = models.CharField(max_length=255)
    city = models.CharField(max_length=120)
    zip = models.CharField(max_length=20)
    phone = models.CharField(max_length=30, blank=True)
    is_default = models.BooleanField(default=False)


class Order(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=30, default='created')
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=8, default='USD')
    created_at = models.DateTimeField(auto_now_add=True)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def save(self, *args, **kwargs):
        try:
            if self.unit_price is not None and self.quantity is not None:
                self.subtotal = self.unit_price * self.quantity
        except Exception:
            pass
        super().save(*args, **kwargs)


class Payment(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    provider = models.CharField(max_length=30, default='mock')
    status = models.CharField(max_length=30, default='succeeded')  # simulamos éxito
    external_id = models.CharField(max_length=120, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Favorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')


class OfferSlide(models.Model):
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=300, blank=True)
    badge = models.CharField(max_length=50, blank=True, default='Oferta')
    cta_text = models.CharField(max_length=80, blank=True, default='Ver productos en oferta')
    cta_link = models.CharField(max_length=200, blank=True, default='/pharmacy/offers')
    image = models.ImageField(upload_to='offers/', blank=True, null=True)
    position = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['position', 'id']

    def __str__(self):
        return self.title
