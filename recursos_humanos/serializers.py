from rest_framework import serializers
from .models import Empleado

class EmpleadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empleado
        fields = '__all__'
        extra_kwargs = {
            'nombre': {'required': True},
            'cargo': {'required': True},
            'salario': {'required': True},
            'area': {'required': True},
            'telefono': {'required': False},
            'correo': {'required': False},
            'contrato': {'required': False},
        }