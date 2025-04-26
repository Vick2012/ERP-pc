from django.db import models
from django.utils import timezone

class Proveedor(models.Model):
    nombre = models.CharField(max_length=100)
    contacto = models.CharField(max_length=100)
    direccion = models.CharField(max_length=200, blank=True)
    telefono = models.CharField(max_length=15, blank=True)
    email = models.EmailField(blank=True)
    tipo_proveedor = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)  # Agrega este campo o ajusta el existente

    def __str__(self):
        return self.nombre