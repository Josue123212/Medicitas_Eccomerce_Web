from rest_framework import serializers
from .models import Category, Product, ProductImage, Price, Inventory, Cart, CartItem, Address, Order, OrderItem, Payment, Favorite, OfferSlide


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'position']


class PriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Price
        fields = ['currency', 'amount', 'sale_amount']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    price = PriceSerializer(read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'category', 'images', 'price', 'is_active', 'created_at']


class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = ['product', 'stock', 'reserved_stock']


class CartItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_detail', 'quantity', 'unit_price', 'subtotal']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'updated_at', 'items']


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'line1', 'city', 'zip', 'phone', 'is_default']


class OrderItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_detail', 'quantity', 'unit_price', 'subtotal']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['provider', 'status', 'external_id', 'created_at']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    payment = PaymentSerializer(read_only=True)
    class Meta:
        model = Order
        fields = ['id', 'status', 'total', 'currency', 'created_at', 'items', 'payment']


class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = ['id', 'product', 'created_at']


class OfferSlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfferSlide
        fields = ['id', 'title', 'subtitle', 'badge', 'cta_text', 'cta_link', 'image', 'position', 'is_active']


class OfferSlideWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfferSlide
        fields = ['id', 'title', 'subtitle', 'badge', 'cta_text', 'cta_link', 'image', 'position', 'is_active']


# ====== Admin (writable) serializers ======

class ProductWriteSerializer(serializers.ModelSerializer):
    category_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'title', 'description', 'category_id', 'is_active', 'created_at']
        read_only_fields = ['created_at']

    def validate_category_id(self, value):
        if value is None:
            return value
        if not Category.objects.filter(id=value).exists():
            raise serializers.ValidationError('Categoría no encontrada')
        return value

    def create(self, validated_data):
        category_id = validated_data.pop('category_id', None)
        if category_id:
            validated_data['category'] = Category.objects.get(id=category_id)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        category_id = validated_data.pop('category_id', None)
        if category_id is not None:
            instance.category = Category.objects.get(id=category_id) if category_id else None
        return super().update(instance, validated_data)

    def validate_name(self, value):
        if not value or not str(value).strip():
            raise serializers.ValidationError('El nombre no puede estar vacío')
        return str(value).strip()


class PriceWriteSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(required=False)

    class Meta:
        model = Price
        fields = ['id', 'product_id', 'currency', 'amount', 'sale_amount', 'is_active', 'valid_from']

    def validate_product_id(self, value):
        if not Product.objects.filter(id=value).exists():
            raise serializers.ValidationError('Producto no encontrado')
        return value

    def create(self, validated_data):
        product_id = validated_data.pop('product_id', None)
        if product_id is not None:
            validated_data['product'] = Product.objects.get(id=product_id)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        product_id = validated_data.pop('product_id', None)
        if product_id is not None:
            instance.product = Product.objects.get(id=product_id)
        return super().update(instance, validated_data)


class InventoryWriteSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(required=False)

    class Meta:
        model = Inventory
        fields = ['id', 'product_id', 'stock', 'reserved_stock', 'location', 'min_stock', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def validate_product_id(self, value):
        if value is None:
            return value
        if not Product.objects.filter(id=value).exists():
            raise serializers.ValidationError('Producto no encontrado')
        return value

    def create(self, validated_data):
        product_id = validated_data.pop('product_id', None)
        if product_id is None:
            raise serializers.ValidationError({'product_id': 'Este campo es requerido'})
        validated_data['product'] = Product.objects.get(id=product_id)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        product_id = validated_data.pop('product_id', None)
        if product_id is not None:
            instance.product = Product.objects.get(id=product_id)
        return super().update(instance, validated_data)
class ProductImageWriteSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = ProductImage
        fields = ['id', 'product_id', 'image', 'position']

    def validate_product_id(self, value):
        if not Product.objects.filter(id=value).exists():
            raise serializers.ValidationError('Producto no encontrado')
        return value

    def create(self, validated_data):
        product_id = validated_data.pop('product_id')
        validated_data['product'] = Product.objects.get(id=product_id)
        return super().create(validated_data)
class CategoryWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'is_active']
