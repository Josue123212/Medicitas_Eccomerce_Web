from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.ecommerce.models import Category, Product, Price, Inventory


class Command(BaseCommand):
    help = "Seed basic ecommerce data: categories, products, prices, inventory"

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Seeding ecommerce data..."))

        # Categories
        categories = [
            ("Analgésicos", "analgesicos", "Productos para el alivio del dolor"),
            ("Vitaminas", "vitaminas", "Suplementos vitamínicos"),
            ("Cuidado Personal", "cuidado-personal", "Higiene y cuidado diario"),
            ("Antialérgicos", "antialergicos", "Alivio de síntomas de alergia"),
            ("Dispositivos Médicos", "dispositivos-medicos", "Instrumentos y suministros médicos"),
        ]
        category_objs = {}
        for name, slug, desc in categories:
            cat, created = Category.objects.get_or_create(
                name=name,
                slug=slug,
                defaults={"description": desc}
            )
            if not created and not cat.description:
                cat.description = desc
                cat.save(update_fields=["description"])
            category_objs[slug] = cat

        # Products: mínimo 4 por categoría
        products = [
            # Analgésicos
            ("Paracetamol 500mg", "Alivia el dolor y la fiebre", "analgesicos", 9.90),
            ("Ibuprofeno 400mg", "Antiinflamatorio y analgésico", "analgesicos", 12.50),
            ("Naproxeno 500mg", "Antiinflamatorio de acción prolongada", "analgesicos", 13.80),
            ("Diclofenaco 50mg", "Alivio del dolor muscular y articular", "analgesicos", 11.60),

            # Vitaminas
            ("Vitamina C 1000mg", "Refuerza el sistema inmune", "vitaminas", 15.00),
            ("Vitamina D3 2000UI", "Apoyo a salud ósea e inmunidad", "vitaminas", 19.90),
            ("Complejo B", "Energía y sistema nervioso", "vitaminas", 14.50),
            ("Multivitamínico", "Complejo de vitaminas y minerales", "vitaminas", 25.90),

            # Cuidado Personal
            ("Shampoo Anticaspa", "Cuidado del cuero cabelludo", "cuidado-personal", 18.75),
            ("Jabón Antibacterial", "Higiene de manos diaria", "cuidado-personal", 6.90),
            ("Gel Alcohol 250ml", "Desinfección rápida", "cuidado-personal", 7.50),
            ("Crema Hidratante", "Hidratación facial diaria", "cuidado-personal", 22.40),

            # Antialérgicos
            ("Loratadina 10mg", "Alivio de síntomas de alergia", "antialergicos", 10.50),
            ("Cetirizina 10mg", "Antihistamínico de acción rápida", "antialergicos", 11.20),
            ("Desloratadina 5mg", "Control prolongado de alergias", "antialergicos", 13.40),
            ("Spray Nasal Salino", "Descongestión suave", "antialergicos", 8.90),

            # Dispositivos Médicos
            ("Termómetro Digital", "Medición precisa de temperatura", "dispositivos-medicos", 24.90),
            ("Oxímetro de Pulso", "Monitoreo de saturación de oxígeno", "dispositivos-medicos", 39.90),
            ("Tensiómetro de Muñeca", "Control de presión arterial", "dispositivos-medicos", 49.90),
            ("Nebulizador Portátil", "Terapia respiratoria", "dispositivos-medicos", 89.00),
        ]

        for title, description, cat_slug, amount in products:
            cat = category_objs.get(cat_slug)
            p, created = Product.objects.get_or_create(
                name=title,
                defaults={
                    'description': description,
                    'category': cat,
                    'is_active': True,
                }
            )
            # Si ya existe, aseguramos categoría y descripción
            if not created:
                p.description = description
                p.category = cat
                p.is_active = True
                p.save()
            # Sincronizamos title opcional con name
            if not p.title:
                p.title = p.name
                p.save(update_fields=['title'])

            # Aseguramos que valid_from (NOT NULL en la BD) se establezca
            Price.objects.get_or_create(
                product=p,
                defaults={
                    'currency': 'USD',
                    'amount': amount,
                    'valid_from': timezone.now(),
                }
            )
            # En la base existe 'reserved_stock' NOT NULL; usamos ese campo
            Inventory.objects.get_or_create(
                product=p,
                defaults={
                    'stock': 100,
                    'reserved_stock': 0,
                    'min_stock': 0,
                    'location': 'main',
                }
            )

        # Usuario de prueba (si no existe)
        User = get_user_model()
        if not User.objects.filter(email='demo@example.com').exists():
            User.objects.create_user(username='demo', email='demo@example.com', password='demo1234')

        self.stdout.write(self.style.SUCCESS("Ecommerce seed completed."))
