from rest_framework import serializers
from .models import Categoria, UnidadMedida, Producto, Movimiento

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class UnidadMedidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnidadMedida
        fields = '__all__'

class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    unidad_medida_nombre = serializers.CharField(source='unidad_medida.nombre', read_only=True)
    
    class Meta:
        model = Producto
        fields = '__all__'

class MovimientoSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    producto_codigo = serializers.CharField(source='producto.codigo', read_only=True)
    
    class Meta:
        model = Movimiento
        fields = '__all__'
        
    def validate(self, data):
        # Validar que hay suficiente stock para salidas
        if data.get('tipo') == 'salida':
            producto = data.get('producto')
            cantidad = data.get('cantidad')
            if producto.stock_actual < cantidad:
                raise serializers.ValidationError({
                    'cantidad': 'No hay suficiente stock disponible'
                })
        return data 