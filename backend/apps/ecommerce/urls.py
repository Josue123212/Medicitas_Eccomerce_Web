from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, ProductViewSet, InventoryViewSet, CartViewSet,
    AddressViewSet, checkout, CartItemViewSet, FavoriteViewSet, OrderViewSet,
    checkout_stripe, stripe_webhook,
    AdminProductViewSet, AdminPriceViewSet, AdminInventoryViewSet, AdminProductImageViewSet, AdminCategoryViewSet,
    OfferSlideViewSet, AdminOfferSlideViewSet
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'inventory', InventoryViewSet, basename='inventory')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'addresses', AddressViewSet, basename='address')
router.register(r'cart-items', CartItemViewSet, basename='cart-item')
router.register(r'favorites', FavoriteViewSet, basename='favorite')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'offers', OfferSlideViewSet, basename='offer')

admin_router = DefaultRouter()
admin_router.register(r'categories', AdminCategoryViewSet, basename='admin-category')
admin_router.register(r'products', AdminProductViewSet, basename='admin-product')
admin_router.register(r'prices', AdminPriceViewSet, basename='admin-price')
admin_router.register(r'inventory', AdminInventoryViewSet, basename='admin-inventory')
admin_router.register(r'images', AdminProductImageViewSet, basename='admin-image')
admin_router.register(r'offers', AdminOfferSlideViewSet, basename='admin-offer')

urlpatterns = [
    path('', include(router.urls)),
    path('admin/', include(admin_router.urls)),
    path('checkout/', checkout, name='checkout'),
    path('checkout/stripe/', checkout_stripe, name='checkout_stripe'),
    path('webhooks/stripe/', stripe_webhook, name='stripe_webhook'),
]
