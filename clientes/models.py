from django.db import models

# Modelo para los clientes
class Cliente(models.Model):
    nombre = models.CharField(max_length=100)  # Nombre del cliente
    contacto = models.EmailField()  # Email de contacto
    preferencias = models.TextField()  # Preferencias del cliente
    created_at = models.DateTimeField(auto_now_add=True)  # Fecha de creación

    def __str__(self):
        return self.nombre  # Representación del cliente como su nombre