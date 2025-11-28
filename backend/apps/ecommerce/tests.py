from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.ecommerce.models import Category, Product, Price, Inventory, Order, Payment


class EcommerceFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        User = get_user_model()
        self.user = User.objects.create_user(username='testuser', email='test@example.com', password='pass1234')
        self.client.force_authenticate(user=self.user)

        self.category = Category.objects.create(name='Cat', slug='cat')
        self.product = Product.objects.create(name='Prod', category=self.category, is_active=True)
        Price.objects.create(product=self.product, currency='USD', amount='10.00')
        Inventory.objects.create(product=self.product, stock=10, reserved_stock=0, location='main', min_stock=0)

    def test_add_cart_item_and_checkout(self):
        # Add item to cart
        resp_add = self.client.post('/api/ecommerce/cart-items/', {'product': self.product.id, 'quantity': 2}, format='json')
        self.assertEqual(resp_add.status_code, 201)

        # Checkout
        resp_checkout = self.client.post('/api/ecommerce/checkout/', {}, format='json')
        self.assertEqual(resp_checkout.status_code, 201)
        data = resp_checkout.json()
        self.assertIn('order', data)
        self.assertIn('payment', data)

        order_id = data['order']['id']
        order = Order.objects.get(id=order_id)
        self.assertEqual(order.user, self.user)
        self.assertEqual(order.status, 'confirmed')

        payment = Payment.objects.get(order=order)
        self.assertEqual(payment.status, 'succeeded')

    def test_favorites_crud(self):
        # Create favorite
        resp_create = self.client.post('/api/ecommerce/favorites/', {'product': self.product.id}, format='json')
        self.assertEqual(resp_create.status_code, 201)
        fav_id = resp_create.json().get('id')
        # List favorites
        resp_list = self.client.get('/api/ecommerce/favorites/')
        self.assertEqual(resp_list.status_code, 200)
        # Delete favorite
        resp_del = self.client.delete(f'/api/ecommerce/favorites/{fav_id}/')
        self.assertIn(resp_del.status_code, (200, 204))
