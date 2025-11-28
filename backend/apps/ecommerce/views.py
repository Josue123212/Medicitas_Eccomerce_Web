from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction, models

from .models import Category, Product, Inventory, Cart, CartItem, Address, Order, OrderItem, Payment
from .serializers import (
    CategorySerializer, ProductSerializer, InventorySerializer,
    CartSerializer, CartItemSerializer, AddressSerializer,
    OrderSerializer, PaymentSerializer
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    filterset_fields = ['category']
    search_fields = ['name', 'description']
    ordering_fields = ['created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params
        # Filtro por categoría (ID numérico)
        category = params.get('category')
        if category:
            try:
                qs = qs.filter(category_id=int(category))
            except (TypeError, ValueError):
                pass
        # Búsqueda básica si se pasa ?search=
        search = params.get('search')
        if search:
            qs = qs.filter(models.Q(name__icontains=search) | models.Q(description__icontains=search))
        return qs


class InventoryViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def retrieve(self, request, pk=None):
        product = get_object_or_404(Product, pk=pk)
        inventory = get_object_or_404(Inventory, product=product)
        return Response(InventorySerializer(inventory).data)


class CartViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return Response(CartSerializer(cart).data)

    @action(detail=False, methods=['post'])
    def items(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        product = get_object_or_404(Product, id=product_id)
        unit_price = product.price.sale_amount or product.price.amount
        item = CartItem.objects.create(cart=cart, product=product, quantity=quantity, unit_price=unit_price)
        return Response(CartItemSerializer(item).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        item = get_object_or_404(CartItem, id=pk, cart=cart)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        Address.objects.filter(user=request.user, is_default=True).update(is_default=False)
        addr = self.get_object()
        addr.is_default = True
        addr.save()
        return Response(AddressSerializer(addr).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout(request):
    cart = Cart.objects.filter(user=request.user).first()
    if not cart or cart.items.count() == 0:
        return Response({'detail': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        order = Order.objects.create(user=request.user, status='created', total=0)
        total = 0
        for item in cart.items.all():
            OrderItem.objects.create(order=order, product=item.product, quantity=item.quantity, unit_price=item.unit_price)
            total += item.unit_price * item.quantity
            # Opcional: validar stock en Inventory
        order.total = total
        order.status = 'confirmed'
        order.save()

        # Simular pago exitoso
        payment = Payment.objects.create(order=order, provider='mock', status='succeeded', external_id='mock_123')

        # Vaciar carrito
        cart.items.all().delete()

    return Response({
        'order': OrderSerializer(order).data,
        'payment': PaymentSerializer(payment).data
    }, status=status.HTTP_201_CREATED)
