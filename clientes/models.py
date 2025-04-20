from django.db import models

# Modelo para los clientes
class Cliente(models.Model):
    nombre = models.CharField(max_length=100)  # Nombre del cliente
    contacto = models.EmailField()  # Email de contacto
    preferencias = models.TextField()  # Preferencias del cliente
    created_at = models.DateTimeField(auto_now_add=True)  # Fecha de creación

    def __str__(self):
        return self.nombre  # Representación del cliente como su nombre

# Modelo para los pedidos de los clientes
class Pedido(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)  # Relación con el cliente
    descripcion = models.TextField()  # Descripción del pedido
    estado = models.CharField(max_length=20, default='Pendiente')  # Estado del pedido
    created_at = models.DateTimeField(auto_now_add=True)  # Fecha de creación

    def __str__(self):
        return f"Pedido {self.id} - {self.cliente.nombre}"  # Representación del pedido