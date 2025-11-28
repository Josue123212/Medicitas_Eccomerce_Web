from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.conf import settings
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
import os
import random

from apps.ecommerce.models import Product, ProductImage


class Command(BaseCommand):
    help = "Genera imágenes de prueba para productos y las asocia como ProductImage"

    def add_arguments(self, parser):
        parser.add_argument('--per-product', type=int, default=1, help='Cantidad de imágenes por producto')
        parser.add_argument('--overwrite', action='store_true', help='Reemplazar imágenes existentes')

    def handle(self, *args, **options):
        per_product = options['per_product']
        overwrite = options['overwrite']

        media_products_dir = os.path.join(settings.MEDIA_ROOT, 'products')
        os.makedirs(media_products_dir, exist_ok=True)

        self.stdout.write(self.style.WARNING(f"Generando imágenes en {media_products_dir}..."))

        products = Product.objects.filter(is_active=True).order_by('id')
        created_images = 0

        for product in products:
            existing = product.images.count()
            if existing >= per_product and not overwrite:
                continue

            # Si vamos a sobrescribir, eliminamos existentes
            if overwrite and existing:
                product.images.all().delete()

            count_to_create = per_product if overwrite else max(0, per_product - existing)
            for idx in range(count_to_create):
                img_content = self._generate_image(product.name, index=idx)
                filename = f"product_{product.id}_{idx+1}.png"

                # Creamos ProductImage y guardamos el archivo
                pi = ProductImage(product=product, position=idx)
                pi.image.save(filename, ContentFile(img_content.getvalue()), save=True)
                created_images += 1

        self.stdout.write(self.style.SUCCESS(f"Imágenes creadas: {created_images}"))

    def _generate_image(self, text: str, index: int = 0) -> BytesIO:
        """Genera una imagen simple con fondo de color y el nombre del producto."""
        width, height = 800, 800
        # Color de fondo pseudoaleatorio estable por índice
        random.seed(f"{text}-{index}")
        bg_color = (
            random.randint(80, 200),
            random.randint(80, 200),
            random.randint(80, 200)
        )
        img = Image.new('RGB', (width, height), color=bg_color)
        draw = ImageDraw.Draw(img)

        # Intentamos cargar una fuente, si falla usamos la fuente por defecto
        try:
            font = ImageFont.truetype("arial.ttf", 32)
        except Exception:
            font = ImageFont.load_default()

        # Texto centrado con padding
        text = (text or "Producto").strip()[:40]
        # Obtener tamaño del texto de forma compatible con Pillow moderno
        try:
            left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
            w, h = right - left, bottom - top
        except Exception:
            # Fallback: posición fija si textbbox no está disponible
            w, h = 200, 40
        draw.text(((width - w) / 2, (height - h) / 2), text, fill=(255, 255, 255), font=font)

        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        return buffer