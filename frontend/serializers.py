from rest_framework import serializers
from .models import Contact, Proveedor, Cliente


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['id', 'name', 'email', 'message', 'password', 'created_at']
class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = ['id', 'nombre', 'contacto', 'direccion', 'telefono', 'email', 'tipo_proveedor', 'created_at']

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = ['id', 'nombre', 'contacto', 'preferencias', 'created_at']