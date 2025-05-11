# recursos_humanos/viewsets.py
from rest_framework import viewsets
from .models import Empleado, Liquidacion
from .serializers import EmpleadoSerializer, LiquidacionSerializer

class EmpleadoViewSet(viewsets.ModelViewSet):
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializer

class LiquidacionViewSet(viewsets.ModelViewSet):
    queryset = Liquidacion.objects.all()
    serializer_class = LiquidacionSerializer
