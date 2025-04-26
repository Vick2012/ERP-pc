from django.db import models
from django.utils import timezone

class Cliente(models.Model):
    nombre = models.CharField(max_length=100)
    contacto = models.CharField(max_length=100)
    preferencias = models.CharField(max_length=200, blank=True, default='Sin preferencias')
    created_at = models.DateTimeField(auto_now_add=True)  # Agrega este campo o ajusta el existente

    def __str__(self):
        return self.nombre