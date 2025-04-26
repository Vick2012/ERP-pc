
from rest_framework import serializers
from .models import Proveedor

class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = ['id', 'nombre', 'contacto', 'direccion', 'telefono', 'email', 'tipo_proveedor']


class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = ['id', 'nombre', 'contacto', 'direccion', 'telefono', 'email', 'tipo_proveedor']
        extra_kwargs = {
            'nombre': {'required': True},
            'contacto': {'required': True},
            'direccion': {'required': False},
            'telefono': {'required': True},
            'email': {'required': True},
            'tipo_proveedor': {'required': True},
        }