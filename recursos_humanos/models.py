from django.db import models

class Empleado(models.Model):
    nombre = models.CharField(max_length=100)
    tipo_documento = models.CharField(max_length=20, choices=[
        ('cc', 'Cédula de Ciudadanía'),
        ('ce', 'Cédula de Extranjería'),
        ('ti', 'Tarjeta de Identidad'),
        ('pasaporte', 'Pasaporte'),
    ])
    documento = models.CharField(max_length=20, unique=True)
    fecha_ingreso = models.DateField()
    cargo = models.CharField(max_length=50, choices=[
        ('operario', 'Operario'),
        ('auxiliar', 'Auxiliar'),
        ('administrativo', 'Administrativo'),
    ])
    salario = models.DecimalField(max_digits=10, decimal_places=2)
    area = models.CharField(max_length=50, choices=[
        ('produccion', 'Producción'),
        ('almacen', 'Almacén'),
        ('oficina', 'Oficina'),
        ('despachos', 'Despachos'),
    ])
    telefono = models.CharField(max_length=20, blank=True)
    correo = models.EmailField(unique=True)
    contrato = models.CharField(max_length=50, choices=[
        ('fijo', 'Término Fijo'),
        ('indefinido', 'Indefinido'),
        ('temporal', 'Temporal'),
    ])
    contacto = models.CharField(max_length=100, blank=True)

    class Meta:
        db_table = 'rrhh_empleado'

    def __str__(self):
        return self.nombre


class Nomina(models.Model):
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='nominas')
    periodo_inicio = models.DateField()
    periodo_fin = models.DateField()
    salario_base = models.DecimalField(max_digits=10, decimal_places=2)
    deducciones = models.DecimalField(max_digits=10, decimal_places=2)
    bonificaciones = models.DecimalField(max_digits=10, decimal_places=2)
    salario_neto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_calculo = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'rrhh_nomina'

    def __str__(self):
        return f"Nómina de {self.empleado.nombre} ({self.periodo_inicio} - {self.periodo_fin})"


class Ausentismo(models.Model):
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='ausentismos')
    fecha = models.DateField()
    duracion_horas = models.DecimalField(max_digits=5, decimal_places=2)
    motivo = models.TextField(blank=True)

    class Meta:
        db_table = 'rrhh_ausentismo'

    def __str__(self):
        return f"Ausentismo de {self.empleado.nombre} el {self.fecha}"


class HoraExtra(models.Model):
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='horas_extras')
    fecha = models.DateField()
    horas = models.DecimalField(max_digits=5, decimal_places=2)

    class Meta:
        db_table = 'rrhh_hora_extra'

    def __str__(self):
        return f"Horas Extras de {self.empleado.nombre} el {self.fecha}"


class Contact(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'rrhh_contact'

    def __str__(self):
        return f"Contacto de {self.name} ({self.email})"