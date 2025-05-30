from rest_framework import serializers
from .models import Empleado, Nomina, Ausentismo, HoraExtra, Contact, Liquidacion
# recursos_humanos/serializers.py
from rest_framework import serializers
from .models import Liquidacion

class LiquidacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Liquidacion
        fields = [
            'id', 'empleado', 'empleado_nombre', 'contrato', 
            'motivo_retiro', 'fecha_liquidacion',
            'cesantias', 'intereses_cesantias', 'prima_servicios',
            'vacaciones', 'indemnizacion', 'fondo_pensiones',
            'eps', 'caja_compensacion'
        ]
        read_only_fields = ['id']

class EmpleadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empleado
        fields = '__all__'

    def create(self, validated_data):
        print("Validated:", validated_data)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Si se está actualizando el estado a 'retirado', verificar si ya tiene una liquidación
        if 'estado' in validated_data and validated_data['estado'] == 'retirado':
            if not instance.liquidaciones.exists():
                raise serializers.ValidationError({
                    'estado': ['No se puede retirar un empleado sin generar su liquidación']
                })
        return super().update(instance, validated_data)

class NominaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nomina
        fields = '__all__'

class AusentismoSerializer(serializers.ModelSerializer):
    empleado_documento = serializers.CharField(source='empleado.documento', read_only=True)
    
    class Meta:
        model = Ausentismo
        fields = [
            'id', 'empleado', 'empleado_documento', 'fecha', 'tipo', 
            'duracion_horas', 'motivo', 'documento',
            'horas_extra_diurnas', 'horas_extra_nocturnas',
            'recargos_nocturnos', 'horas_extra_dominicales'
        ]

    def validate(self, data):
        tipo = data.get('tipo')
        if tipo == 'ausentismo':
            if not data.get('duracion_horas'):
                raise serializers.ValidationError({'duracion_horas': ['Este campo es requerido para ausentismos.']})
        elif tipo == 'horas_extras':
            # Calcular duración total de horas extras
            data['duracion_horas'] = (
                float(data.get('horas_extra_diurnas', 0)) +
                float(data.get('horas_extra_nocturnas', 0)) +
                float(data.get('recargos_nocturnos', 0)) +
                float(data.get('horas_extra_dominicales', 0))
            )
        return data

    def create(self, validated_data):
        documento = validated_data.get('documento')
        if documento:
            try:
                empleado = Empleado.objects.get(documento=documento)
                validated_data['empleado'] = empleado
            except Empleado.DoesNotExist:
                raise serializers.ValidationError({'documento': [f'No se encontró empleado con documento {documento}']})
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
