from django.core.management.base import BaseCommand
from inventario.models import Categoria

class Command(BaseCommand):
    help = 'Crea las categorías iniciales del sistema'

    def handle(self, *args, **kwargs):
        # Lista de categorías a crear
        categorias = [
            {'nombre': 'Herramientas', 'descripcion': 'Herramientas y equipos de trabajo'},
            {'nombre': 'Papelería', 'descripcion': 'Material de oficina y papelería'},
            {'nombre': 'Equipos electrónicos', 'descripcion': 'Equipos y dispositivos electrónicos'},
            {'nombre': 'Plataformas', 'descripcion': 'Plataformas y servicios digitales'},
            {'nombre': 'Otros', 'descripcion': 'Otros productos y servicios'}
        ]

        # Crear las categorías si no existen
        for cat_data in categorias:
            categoria, created = Categoria.objects.get_or_create(
                nombre=cat_data['nombre'],
                defaults={'descripcion': cat_data['descripcion']}
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Categoría creada: {categoria.nombre}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Categoría ya existente: {categoria.nombre}')
                ) 