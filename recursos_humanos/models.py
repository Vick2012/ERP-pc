from django.db import models

class Empleado(models.Model):
    CONTRATO_CHOICES = [
        ('fijo', 'Término Fijo'),
        ('indefinido', 'Indefinido'),
        ('temporal', 'Temporal'),
    ]

    CARGO_CHOICES = [
        ('operario', 'Operario'),
        ('auxiliar', 'Auxiliar'),
        ('administrativo', 'Administrativo'),
    ]

    AREA_CHOICES = [
        ('produccion', 'Producción'),
        ('almacen', 'Almacén'),
        ('administrativo', 'Administrativo'),
        ('despachos', 'Despachos'),
    ]

    nombre = models.CharField(max_length=100)
    cargo = models.CharField(max_length=100, choices=CARGO_CHOICES, default='administrativo')
    salario = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    area = models.CharField(max_length=50, choices=AREA_CHOICES, default='oficina')
    telefono = models.CharField(max_length=20, blank=True)
    correo = models.EmailField()
    contrato = models.CharField(max_length=20, choices=CONTRATO_CHOICES, default='fijo')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} - {self.cargo}"

    class Meta:
        db_table = 'rrhh_empleado'