# recursos_humanos/viewsets.py
from rest_framework import viewsets
from .models import Empleado, Liquidacion
from .serializers import EmpleadoSerializer, LiquidacionSerializer

class EmpleadoViewSet(viewsets.ModelViewSet):
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        documento = self.request.query_params.get('documento', None)
        if documento is not None:
            queryset = queryset.filter(documento=documento)
        return queryset

class LiquidacionViewSet(viewsets.ModelViewSet):
    queryset = Liquidacion.objects.all()
    serializer_class = LiquidacionSerializer
