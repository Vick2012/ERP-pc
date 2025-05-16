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
    empleado_documento = serializers.CharField(source='empleado.documento', read_only=True)
    
    class Meta:
        model = Ausentismo
        fields = ['id', 'empleado', 'empleado_documento', 'fecha', 'tipo', 'duracion_horas', 'motivo', 'documento']
        read_only_fields = ['empleado']

    def create(self, validated_data):
        documento = validated_data.pop('documento', None)
        if documento:
            try:
                empleado = Empleado.objects.get(documento=documento)
                validated_data['empleado'] = empleado
                validated_data['documento'] = documento
            except Empleado.DoesNotExist:
                raise serializers.ValidationError(f"No se encontró empleado con documento {documento}")
        return super().create(validated_data)

class HoraExtraSerializer(serializers.ModelSerializer):
    empleado_documento = serializers.CharField(source='empleado.documento', read_only=True)
    
    class Meta:
        model = HoraExtra
        fields = ['id', 'empleado', 'empleado_documento', 'fecha', 'duracion_horas', 'motivo', 'documento',
                 'horas_extra_diurnas', 'horas_extra_nocturnas', 'recargos_nocturnos', 'horas_extra_dominicales']
        read_only_fields = ['empleado']

    def create(self, validated_data):
        documento = validated_data.pop('documento', None)
        if documento:
            try:
                empleado = Empleado.objects.get(documento=documento)
                validated_data['empleado'] = empleado
                validated_data['documento'] = documento
            except Empleado.DoesNotExist:
                raise serializers.ValidationError(f"No se encontró empleado con documento {documento}")
        return super().create(validated_data)

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = '__all__'
