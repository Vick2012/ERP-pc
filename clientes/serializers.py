from rest_framework import serializers
from .models import Cliente

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = ['id', 'nombre', 'contacto', 'preferencias']
        extra_kwargs = {
            'nombre': {'required': True},
            'contacto': {'required': True},
            'preferencias': {'required': False},
        }