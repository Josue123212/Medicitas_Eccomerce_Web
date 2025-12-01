from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction, models
from django.core.mail import send_mail
from django.conf import settings
from decimal import Decimal
import stripe
from django.views.decorators.csrf import csrf_exempt
from decouple import config
import json
import urllib.request
import urllib.error
from django.contrib.auth import get_user_model
from apps.notifications.services import NotificationService

from .models import Category, Product, Price, Inventory, Cart, CartItem, Address, Order, OrderItem, Payment, Favorite, ProductImage, OfferSlide
from .serializers import (
    CategorySerializer, CategoryWriteSerializer, ProductSerializer, InventorySerializer,
    CartSerializer, CartItemSerializer, AddressSerializer,
    OrderSerializer, PaymentSerializer, FavoriteSerializer,
    ProductWriteSerializer, PriceWriteSerializer, InventoryWriteSerializer,
    ProductImageWriteSerializer, OfferSlideSerializer, OfferSlideWriteSerializer
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
        inv = Inventory.objects.filter(product=product).first()
        available = 0
        if inv:
            try:
                available = max(0, int(inv.stock) - int(inv.reserved_stock))
            except Exception:
                available = 0
        if quantity > available:
            return Response({'detail': 'Sin stock disponible', 'available': available}, status=status.HTTP_409_CONFLICT)
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

def notify_logistics(event_type, order):
    try:
        base = getattr(settings, 'LOGISTICS_URL', None) or config('LOGISTICS_URL', default='http://localhost:8081')
        url = f"{base}/webhooks/order"
        items = []
        for it in order.items.all():
            items.append({'product_id': it.product_id, 'quantity': it.quantity})
        payload = {'type': event_type, 'order_id': order.id, 'items': items}
        data = json.dumps(payload).encode('utf-8')
        service_key = (getattr(settings, 'SERVICE_API_KEY', None) or config('SERVICE_API_KEY', default='admin-agent-key'))
        headers = {'Content-Type': 'application/json'}
        if service_key:
            headers['X-Service-Key'] = service_key
        req = urllib.request.Request(url, data=data, headers=headers)
        resp = urllib.request.urlopen(req, timeout=3)
        code = getattr(resp, 'code', None) or getattr(resp, 'status', None) or getattr(resp, 'getcode', lambda: None)()
        return bool(code and int(code) >= 200 and int(code) < 300)
    except Exception:
        return False

def adjust_inventory_fallback(event_type, order):
    try:
        with transaction.atomic():
            for it in order.items.all():
                inv = Inventory.objects.filter(product_id=it.product_id).first()
                if not inv:
                    continue
                qty = int(it.quantity)
                if event_type == 'confirmed':
                    inv.reserved_stock = max(0, int(inv.reserved_stock) - qty)
                    inv.stock = max(0, int(inv.stock) - qty)
                elif event_type == 'cancelled':
                    inv.reserved_stock = max(0, int(inv.reserved_stock) - qty)
                elif event_type == 'created':
                    inv.reserved_stock = max(0, int(inv.reserved_stock) + qty)
                inv.save(update_fields=['reserved_stock', 'stock'])
                try:
                    available = max(0, int(inv.stock) - int(inv.reserved_stock))
                    if int(inv.min_stock) >= available:
                        User = get_user_model()
                        admins = User.objects.filter(role__in=['admin', 'superadmin']).all()
                        for admin in admins:
                            NotificationService.create_system_notification(
                                user=admin,
                                title='⚠️ Stock bajo',
                                message=f"Producto #{inv.product_id} por debajo del mínimo. Disponible: {available}, Mínimo: {int(inv.min_stock)}. Por favor, reponer stock."
                            )
                except Exception:
                    pass
    except Exception:
        pass


class OfferSlideViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = OfferSlide.objects.filter(is_active=True).order_by('position')
    serializer_class = OfferSlideSerializer
    permission_classes = [AllowAny]


class AdminOfferSlideViewSet(viewsets.ModelViewSet):
    queryset = OfferSlide.objects.all().order_by('position')
    serializer_class = OfferSlideWriteSerializer
    permission_classes = [IsAdminOrSuperAdmin]

    def get_permissions(self):
        if getattr(self, 'action', None) == 'activate':
            return [AllowAny()]
        return [IsAdminOrSuperAdmin()]

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        expected_key = getattr(settings, 'SERVICE_API_KEY', None) or config('SERVICE_API_KEY', default='')
        received_key = request.META.get('HTTP_X_SERVICE_KEY') or request.headers.get('X-Service-Key')
        is_admin = bool(getattr(request.user, 'is_authenticated', False))
        if is_admin or (expected_key and received_key == expected_key):
            slide = self.get_object()
            with transaction.atomic():
                OfferSlide.objects.update(is_active=False)
                slide.is_active = True
                slide.save(update_fields=['is_active'])
            return Response(OfferSlideWriteSerializer(slide).data)
        return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)


class CartItemViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        return CartItem.objects.filter(cart=cart)

    def perform_create(self, serializer):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        product = serializer.validated_data.get('product')
        quantity = int(serializer.validated_data.get('quantity', 1))
        from django.utils import timezone
        price = getattr(product, 'price', None)
        now = timezone.now()
        sale_active = False
        try:
            if price and price.is_active and price.sale_amount is not None:
                if (not price.valid_from or now >= price.valid_from) and (not price.valid_until or now <= price.valid_until):
                    sale_active = True
        except Exception:
            sale_active = False
        unit_price = (price.sale_amount if sale_active else price.amount)
        subtotal = unit_price * quantity
        serializer.save(cart=cart, unit_price=unit_price, subtotal=subtotal)

    def create(self, request, *args, **kwargs):
        try:
            cart, _ = Cart.objects.get_or_create(user=request.user)
            pid = request.data.get('product') or request.data.get('product_id')
            if not pid:
                return Response({'detail': 'product requerido'}, status=status.HTTP_400_BAD_REQUEST)
            product = get_object_or_404(Product, id=int(pid))
            quantity = int(request.data.get('quantity', 1))
            inv = Inventory.objects.filter(product=product).first()
            available = 0
            if inv:
                try:
                    available = max(0, int(inv.stock) - int(inv.reserved_stock))
                except Exception:
                    available = 0
            if quantity > available:
                return Response({'detail': 'Sin stock disponible', 'available': available}, status=status.HTTP_409_CONFLICT)
            raw_price = getattr(product.price, 'sale_amount', None) or product.price.amount
            unit_price = Decimal(str(raw_price))
            item = CartItem.objects.create(cart=cart, product=product, quantity=quantity, unit_price=unit_price, subtotal=(unit_price * quantity))
            return Response(CartItemSerializer(item).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print('CartItem create error:', str(e))
            return Response({'detail': 'Bad Request', 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


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
    # Notificar confirmación de orden al servicio logístico
    try:
        ok = notify_logistics('confirmed', order)
        if not ok:
            adjust_inventory_fallback('confirmed', order)
    except Exception:
        adjust_inventory_fallback('confirmed', order)

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
    if not stripe.api_key:
        return Response({'detail': 'Stripe no configurado (STRIPE_SECRET_KEY ausente)'}, status=status.HTTP_400_BAD_REQUEST)
    cart = Cart.objects.filter(user=request.user).first()
    if not cart or cart.items.count() == 0:
        return Response({'detail': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
    # Validar disponibilidad antes de crear PaymentIntent
    for item in cart.items.all():
        inv = Inventory.objects.filter(product=item.product).first()
        available = 0
        if inv:
            try:
                available = max(0, int(inv.stock) - int(inv.reserved_stock))
            except Exception:
                available = 0
        if int(item.quantity) > available:
            return Response({'detail': 'Sin stock disponible', 'product_id': item.product.id, 'available': available}, status=status.HTTP_409_CONFLICT)
    total = 0
    for item in cart.items.all():
        total += item.unit_price * item.quantity
    order = Order.objects.create(user=request.user, status='pending', total=total, currency=(getattr(settings, 'STRIPE_CURRENCY', None) or config('STRIPE_CURRENCY', default='USD')))
    for item in cart.items.all():
        OrderItem.objects.create(order=order, product=item.product, quantity=item.quantity, unit_price=item.unit_price)
    try:
        intent = stripe.PaymentIntent.create(
            amount=int(total * 100),
            currency=getattr(settings, 'STRIPE_CURRENCY', None) or config('STRIPE_CURRENCY', default='USD'),
            metadata={'order_id': str(order.id), 'user_id': str(request.user.id)},
        )
    except Exception as e:
        return Response({'detail': 'Error al crear PaymentIntent', 'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)
    payment = Payment.objects.create(order=order, provider='stripe', status=intent.status, external_id=intent.id)
    try:
        notify_logistics('created', order)
    except Exception:
        pass
    return Response({'client_secret': intent.client_secret, 'order': OrderSerializer(order).data}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def stripe_confirm(request):
    stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', None) or config('STRIPE_SECRET_KEY', default='')
    if not stripe.api_key:
        return Response({'detail': 'Stripe no configurado (STRIPE_SECRET_KEY ausente)'}, status=status.HTTP_400_BAD_REQUEST)
    order_id = request.data.get('order_id')
    payment_intent_id = request.data.get('payment_intent_id')
    if not order_id or not payment_intent_id:
        return Response({'detail': 'order_id y payment_intent_id requeridos'}, status=status.HTTP_400_BAD_REQUEST)
    order = Order.objects.filter(id=order_id, user=request.user).first()
    if not order:
        return Response({'detail': 'Orden no encontrada'}, status=status.HTTP_404_NOT_FOUND)
    try:
        pi = stripe.PaymentIntent.retrieve(payment_intent_id)
    except Exception as e:
        return Response({'detail': 'No se pudo recuperar PaymentIntent', 'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)
    status_pi = getattr(pi, 'status', None)
    intent_id = getattr(pi, 'id', None)
    payment = Payment.objects.filter(order=order, external_id=intent_id).first()
    if not payment:
        payment = Payment.objects.create(order=order, provider='stripe', status=status_pi or 'requires_action', external_id=intent_id or '')
    if status_pi == 'succeeded':
        payment.status = 'succeeded'
        payment.save()
        order.status = 'confirmed'
        order.save()
        CartItem.objects.filter(cart__user=order.user).delete()
        try:
            ok = notify_logistics('confirmed', order)
            if not ok:
                adjust_inventory_fallback('confirmed', order)
        except Exception:
            adjust_inventory_fallback('confirmed', order)
        return Response({'order': OrderSerializer(order).data, 'payment': PaymentSerializer(payment).data})
    elif status_pi in ('requires_payment_method', 'canceled', 'requires_action'):
        payment.status = status_pi
        payment.save()
        order.status = 'cancelled'
        order.save()
        try:
            ok = notify_logistics('cancelled', order)
            if not ok:
                adjust_inventory_fallback('cancelled', order)
        except Exception:
            adjust_inventory_fallback('cancelled', order)
        return Response({'order': OrderSerializer(order).data, 'payment': PaymentSerializer(payment).data})
    return Response({'detail': 'Estado de pago no confirmado', 'status': status_pi}, status=status.HTTP_202_ACCEPTED)


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
        try:
            event = json.loads(payload.decode('utf-8'))
        except Exception:
            return Response(status=status.HTTP_200_OK)
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
                try:
                    ok = notify_logistics('confirmed', order)
                    if not ok:
                        adjust_inventory_fallback('confirmed', order)
                except Exception:
                    adjust_inventory_fallback('confirmed', order)
        elif evt_type == 'payment_intent.payment_failed' and order_id:
            order = Order.objects.filter(id=order_id).first()
            if order:
                payment = Payment.objects.filter(order=order, external_id=intent_id).first()
                if payment:
                    payment.status = 'failed'
                    payment.save()
                order.status = 'cancelled'
                order.save()
                try:
                    ok = notify_logistics('cancelled', order)
                    if not ok:
                        adjust_inventory_fallback('cancelled', order)
                except Exception:
                    adjust_inventory_fallback('cancelled', order)
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

    def get_permissions(self):
        if getattr(self, 'action', None) in ('agent_list', 'agent_clear_expired'):
            return [AllowAny()]
        return [IsAdminOrSuperAdmin()]

    @action(detail=False, methods=['get'], url_path='agent-list')
    def agent_list(self, request):
        expected_key = getattr(settings, 'SERVICE_API_KEY', None) or config('SERVICE_API_KEY', default='')
        received_key = request.META.get('HTTP_X_SERVICE_KEY') or request.headers.get('X-Service-Key')
        if not (expected_key and received_key == expected_key):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        qs = self.get_queryset()
        return Response(PriceWriteSerializer(qs, many=True).data)

    @action(detail=True, methods=['put'], url_path='agent-clear-expired')
    def agent_clear_expired(self, request, pk=None):
        expected_key = getattr(settings, 'SERVICE_API_KEY', None) or config('SERVICE_API_KEY', default='')
        received_key = request.META.get('HTTP_X_SERVICE_KEY') or request.headers.get('X-Service-Key')
        if not (expected_key and received_key == expected_key):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        price = self.get_object()
        from django.utils import timezone
        now = timezone.now()
        expired = False
        try:
            if price.valid_until and now > price.valid_until:
                expired = True
        except Exception:
            expired = False
        if not expired:
            return Response({'detail': 'No expirado'}, status=status.HTTP_202_ACCEPTED)
        with transaction.atomic():
            price.sale_amount = None
            price.save(update_fields=['sale_amount'])
        return Response(PriceWriteSerializer(price).data)


class AdminInventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.select_related('product').all().order_by('-id')
    serializer_class = InventoryWriteSerializer
    permission_classes = [IsAdminOrSuperAdmin]

    def get_permissions(self):
        if getattr(self, 'action', None) == 'agent_update':
            return [AllowAny()]
        return [IsAdminOrSuperAdmin()]

    @action(detail=False, methods=['post'], url_path='agent-update')
    def agent_update(self, request):
        expected_key = getattr(settings, 'SERVICE_API_KEY', None) or config('SERVICE_API_KEY', default='')
        received_key = request.META.get('HTTP_X_SERVICE_KEY') or request.headers.get('X-Service-Key')
        if not (expected_key and received_key == expected_key):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        product_id = request.data.get('product_id') or request.data.get('product') or request.data.get('productId')
        if not product_id:
            qp = getattr(request, 'query_params', {})
            product_id = qp.get('product_id') or qp.get('product') or qp.get('productId')
        try:
            product_id = int(product_id) if product_id is not None else None
        except (TypeError, ValueError):
            product_id = None
        if product_id is None:
            try:
                raw = request.body
                if raw:
                    payload = json.loads(raw.decode('utf-8'))
                    pid = payload.get('product_id') or payload.get('product') or payload.get('productId')
                    product_id = int(pid) if pid is not None else None
                    if product_id is None:
                        pass
            except Exception:
                pass
        if not product_id:
            return Response({'detail': 'product_id requerido'}, status=status.HTTP_400_BAD_REQUEST)
        inv = Inventory.objects.filter(product_id=product_id).first()
        if not inv:
            return Response({'detail': 'inventario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        stock = request.data.get('stock')
        min_stock = request.data.get('min')
        delta = request.data.get('delta') or request.data.get('qty') or request.data.get('quantity')
        stock_delta = request.data.get('stock_delta') or request.data.get('stockChange') or request.data.get('stockDelta')
        location = request.data.get('location')
        if stock is None or min_stock is None or delta is None or location is None:
            qp = getattr(request, 'query_params', {})
            if stock is None: stock = qp.get('stock')
            if min_stock is None: min_stock = qp.get('min')
            if delta is None: delta = qp.get('delta') or qp.get('qty') or qp.get('quantity')
            if stock_delta is None: stock_delta = qp.get('stock_delta') or qp.get('stockChange') or qp.get('stockDelta')
            if location is None: location = qp.get('location')
        if stock is None or min_stock is None or delta is None or location is None:
            try:
                raw = request.body
                if raw:
                    payload = json.loads(raw.decode('utf-8'))
                    if stock is None: stock = payload.get('stock')
                    if min_stock is None: min_stock = payload.get('min')
                    if delta is None: delta = payload.get('delta') or payload.get('qty') or payload.get('quantity')
                    if location is None: location = payload.get('location')
            except Exception:
                pass

        with transaction.atomic():
            if stock is not None:
                inv.stock = max(0, int(stock))
            if min_stock is not None:
                inv.min_stock = max(0, int(min_stock))
            if delta is not None:
                inv.reserved_stock = max(0, int(inv.reserved_stock) + int(delta))
            if stock_delta is not None:
                inv.stock = max(0, int(inv.stock) + int(stock_delta))
            if location is not None:
                inv.location = str(location)
            inv.save()
        try:
            available = max(0, int(inv.stock) - int(inv.reserved_stock))
            if int(inv.min_stock) >= available:
                User = get_user_model()
                admins = User.objects.filter(role__in=['admin', 'superadmin']).all()
                for admin in admins:
                    NotificationService.create_system_notification(
                        user=admin,
                        title='⚠️ Stock bajo',
                        message=f"Producto #{inv.product_id} por debajo del mínimo. Disponible: {available}, Mínimo: {int(inv.min_stock)}. Por favor, reponer stock."
                    )
        except Exception:
            pass
        return Response(InventorySerializer(inv).data)


class AdminProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all().order_by('position')
    serializer_class = ProductImageWriteSerializer
    permission_classes = [IsAdminOrSuperAdmin]

    def get_queryset(self):
        qs = super().get_queryset()
        pid = self.request.query_params.get('product_id')
        if pid:
            try:
                qs = qs.filter(product_id=int(pid))
            except (TypeError, ValueError):
                pass
        return qs


class AdminCategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategoryWriteSerializer
    permission_classes = [IsAdminOrSuperAdmin]
