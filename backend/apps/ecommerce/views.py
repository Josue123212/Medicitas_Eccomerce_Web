from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction, models
from django.core.mail import send_mail
from django.conf import settings
import stripe
from django.views.decorators.csrf import csrf_exempt
from decouple import config

from .models import Category, Product, Price, Inventory, Cart, CartItem, Address, Order, OrderItem, Payment, Favorite
from .serializers import (
    CategorySerializer, ProductSerializer, InventorySerializer,
    CartSerializer, CartItemSerializer, AddressSerializer,
    OrderSerializer, PaymentSerializer, FavoriteSerializer,
    ProductWriteSerializer, PriceWriteSerializer, InventoryWriteSerializer
)
from apps.core.permissions import IsAdminOrSuperAdmin


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
        item = CartItem.objects.create(
            cart=cart,
            product=product,
            quantity=quantity,
            unit_price=unit_price,
            subtotal=(unit_price * quantity)
        )
        return Response(CartItemSerializer(item).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        item = get_object_or_404(CartItem, id=pk, cart=cart)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'])
    def clear(self, request):
        CartItem.objects.filter(cart__user=request.user).delete()
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


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')


class CartItemViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        return CartItem.objects.filter(cart=cart)

    def perform_create(self, serializer):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        serializer.save(cart=cart)


class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout(request):
    cart = Cart.objects.filter(user=request.user).first()
    if not cart or cart.items.count() == 0:
        return Response({'detail': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        order = Order.objects.create(user=request.user, status='created', total=0, currency=(getattr(settings, 'STRIPE_CURRENCY', None) or config('STRIPE_CURRENCY', default='USD')))
        total = 0
        for item in cart.items.all():
            OrderItem.objects.create(order=order, product=item.product, quantity=item.quantity, unit_price=item.unit_price)
            total += item.unit_price * item.quantity
            # Opcional: validar stock en Inventory
        order.total = total
        order.status = 'confirmed'
        order.save()

        payment = Payment.objects.create(order=order, provider='mock', status='succeeded', external_id='mock_123')

        # Vaciar carrito
        cart.items.all().delete()

    try:
        send_mail(
            'Orden confirmada',
            f'Tu orden #{order.id} ha sido confirmada por un total de {order.total}.',
            None,
            [request.user.email],
            fail_silently=True,
        )
    except Exception:
        pass

    return Response({
        'order': OrderSerializer(order).data,
        'payment': PaymentSerializer(payment).data
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout_stripe(request):
    stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', None) or config('STRIPE_SECRET_KEY', default='')
    cart = Cart.objects.filter(user=request.user).first()
    if not cart or cart.items.count() == 0:
        return Response({'detail': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
    total = 0
    for item in cart.items.all():
        total += item.unit_price * item.quantity
    order = Order.objects.create(user=request.user, status='pending', total=total, currency=(getattr(settings, 'STRIPE_CURRENCY', None) or config('STRIPE_CURRENCY', default='USD')))
    for item in cart.items.all():
        OrderItem.objects.create(order=order, product=item.product, quantity=item.quantity, unit_price=item.unit_price)
    intent = stripe.PaymentIntent.create(
        amount=int(total * 100),
        currency=getattr(settings, 'STRIPE_CURRENCY', None) or config('STRIPE_CURRENCY', default='USD'),
        metadata={'order_id': str(order.id), 'user_id': str(request.user.id)},
    )
    payment = Payment.objects.create(order=order, provider='stripe', status=intent.status, external_id=intent.id)
    return Response({'client_secret': intent.client_secret, 'order': OrderSerializer(order).data}, status=status.HTTP_201_CREATED)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def stripe_webhook(request):
    stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', None) or config('STRIPE_SECRET_KEY', default='')
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE') or request.headers.get('Stripe-Signature')
    try:
        secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', None) or config('STRIPE_WEBHOOK_SECRET', default='')
        if not secret:
            return Response(status=status.HTTP_200_OK)
        event = stripe.Webhook.construct_event(payload, sig_header, secret)
    except stripe.error.SignatureVerificationError:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    except Exception:
        return Response(status=status.HTTP_200_OK)

    try:
        evt_type = event['type']
        pi = event['data']['object']
        meta = getattr(pi, 'metadata', None)
        order_id = None
        if isinstance(meta, dict):
            order_id = meta.get('order_id')
        elif hasattr(meta, 'get'):
            try:
                order_id = meta.get('order_id')
            except Exception:
                order_id = None
        elif hasattr(meta, 'order_id'):
            order_id = getattr(meta, 'order_id')

        intent_id = getattr(pi, 'id', None)

        if evt_type == 'payment_intent.succeeded' and order_id:
            order = Order.objects.filter(id=order_id).first()
            if order:
                payment = Payment.objects.filter(order=order, external_id=intent_id).first()
                if payment:
                    payment.status = 'succeeded'
                    payment.save()
                order.status = 'confirmed'
                order.save()
                CartItem.objects.filter(cart__user=order.user).delete()
        elif evt_type == 'payment_intent.payment_failed' and order_id:
            order = Order.objects.filter(id=order_id).first()
            if order:
                payment = Payment.objects.filter(order=order, external_id=intent_id).first()
                if payment:
                    payment.status = 'failed'
                    payment.save()
                order.status = 'cancelled'
                order.save()
    except Exception:
        pass

    return Response(status=status.HTTP_200_OK)


# ====== Admin CRUD ======

class AdminProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductWriteSerializer
    permission_classes = [IsAdminOrSuperAdmin]


class AdminPriceViewSet(viewsets.ModelViewSet):
    queryset = Price.objects.all().order_by('-valid_from')
    serializer_class = PriceWriteSerializer
    permission_classes = [IsAdminOrSuperAdmin]


class AdminInventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all().order_by('-updated_at')
    serializer_class = InventoryWriteSerializer
    permission_classes = [IsAdminOrSuperAdmin]
