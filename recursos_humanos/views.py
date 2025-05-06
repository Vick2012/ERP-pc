from django.shortcuts import render
from rest_framework import generics
from .models import Empleado
from .serializers import EmpleadoSerializer


def index(request):
    return render(request, 'recursos_humanos/index.html')


class EmpleadoListCreateView(generics.ListCreateAPIView):
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializer

class EmpleadoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializer


class RecursosHumanosListCreateView(generics.ListCreateAPIView):
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializer
