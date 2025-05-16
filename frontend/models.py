
from django.db import models

class Empleado(models.Model):
    nombre = models.CharField(max_length=100)
    documento = models.CharField(max_length=20)

class Nomina(models.Model):
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE)
    periodo_inicio = models.DateField()
    periodo_fin = models.DateField()
    salario_base = models.DecimalField(max_digits=12, decimal_places=2)
    bonificaciones = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    deducciones = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    salario_neto = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"Nómina de {self.empleado.nombre}"

class Contact(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    message = models.TextField()
    password = models.CharField(max_length=128, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'contacts'

class Proveedor(models.Model):
    nombre = models.CharField(max_length=255)
    contacto = models.CharField(max_length=255)
    direccion = models.CharField(max_length=255, blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    tipo_proveedor = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre
