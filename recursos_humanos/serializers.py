from rest_framework import serializers
from .models import Empleado, Nomina, Ausentismo, HoraExtra, Contact


class EmpleadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empleado
        fields = '__all__'


class NominaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nomina
        fields = '__all__'


class AusentismoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ausentismo
        fields = '__all__'


class HoraExtraSerializer(serializers.ModelSerializer):
    class Meta:
        model = HoraExtra
        fields = '__all__'


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = '__all__'
