from django.db import models
from django.utils import timezone

class Contact(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    message = models.TextField()
    password = models.CharField(max_length=128, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Nomina(models.Model):
    empleado = models.CharField(max_length=255)
    salario_base = models.DecimalField(max_digits=10, decimal_places=2)
    bonificaciones = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deducciones = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fecha_generacion = models.DateTimeField(auto_now_add=True)
    periodo_inicio = models.DateField()
    periodo_fin = models.DateField()
    tipo_periodo = models.CharField(max_length=50, default='Quincenal')

    def __str__(self):
        return f"Nómina de {self.empleado} - {self.fecha_generacion.strftime('%Y-%m-%d')}"

    @property
    def salario_neto(self):
        return self.salario_base + self.bonificaciones - self.deducciones
