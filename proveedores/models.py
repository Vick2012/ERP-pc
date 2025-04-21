from django.db import models

class Proveedor(models.Model):
    nombre = models.CharField(max_length=100)
    contacto = models.CharField(max_length=100)
    direccion = models.CharField(max_length=200, default='Sin dirección')
    telefono = models.CharField(max_length=20)
    email = models.EmailField()
    tipo_proveedor = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre
