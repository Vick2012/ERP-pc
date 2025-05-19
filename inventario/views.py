from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, F
from datetime import datetime, timedelta
from decimal import Decimal

from .models import Categoria, UnidadMedida, Producto, Movimiento
from .serializers import (
    CategoriaSerializer, UnidadMedidaSerializer,
    ProductoSerializer, MovimientoSerializer
)

def index(request):
    return render(request, 'inventario/index.html')

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

class UnidadMedidaViewSet(viewsets.ModelViewSet):
    queryset = UnidadMedida.objects.all()
    serializer_class = UnidadMedidaSerializer

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    
    @action(detail=False, methods=['get'])
    def stock_bajo(self, request):
        """Retorna productos con stock bajo (menor al mínimo)"""
        productos = self.queryset.filter(
            stock_actual__lt=F('stock_minimo'),
            estado='activo'
        )
        serializer = self.get_serializer(productos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def valor_inventario(self, request):
        """Calcula el valor total del inventario"""
        total = self.queryset.aggregate(
            total=Sum(F('stock_actual') * F('precio_compra'))
        )['total'] or Decimal('0')
        return Response({'valor_total': total})

class MovimientoViewSet(viewsets.ModelViewSet):
    queryset = Movimiento.objects.all()
    serializer_class = MovimientoSerializer
    
    @action(detail=False, methods=['get'])
    def reporte_movimientos(self, request):
        """Genera reporte de movimientos por período"""
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')
        tipo = request.query_params.get('tipo')
        
        movimientos = self.queryset
        
        if fecha_inicio:
            movimientos = movimientos.filter(fecha__gte=fecha_inicio)
        if fecha_fin:
            movimientos = movimientos.filter(fecha__lte=fecha_fin)
        if tipo:
            movimientos = movimientos.filter(tipo=tipo)
            
        serializer = self.get_serializer(movimientos, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """Crear un nuevo movimiento y actualizar stock"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Actualizar estadísticas si es necesario
        producto = serializer.instance.producto
        if producto.stock_actual < producto.stock_minimo:
            # Aquí podrías enviar una notificación
            pass
            
        return Response(serializer.data, status=status.HTTP_201_CREATED) 