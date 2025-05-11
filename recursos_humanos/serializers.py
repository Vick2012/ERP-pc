from rest_framework import serializers
from .models import Empleado, Nomina, Ausentismo, HoraExtra, Contact, Liquidacion
# recursos_humanos/serializers.py
from rest_framework import serializers
from .models import Liquidacion

class LiquidacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Liquidacion
        fields = ['id', 'empleado_nombre', 'contrato', 'fondo_pensiones', 'cesantias', 'eps', 'caja_compensacion']

class EmpleadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empleado
        fields = '__all__'

    def create(self, validated_data):
        print("Validated:", validated_data)
        return super().create(validated_data)

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
