from django.http import JsonResponse
from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from proveedores.models import Proveedor
from proveedores.serializers import ProveedorSerializer  
from clientes.models import Cliente
from clientes.serializers import ClienteSerializer


from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

class ClienteListCreate(generics.ListCreateAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]  # Si quieres que solo los usuarios autenticados puedan crear clientes




# Vista de bienvenida (opcional, solo para frontend o pruebas)
def index(request):
    return JsonResponse({"mensaje": "¡Bienvenido al módulo de clientes"})

# Vista de registro (para formulario frontend, no API)
def registrar(request):
    return render(request, 'clientes/registrar.html')

# Vista API para listar y crear clientes
class ClienteListCreate(generics.ListCreateAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]

# Vista API para obtener, actualizar y eliminar un cliente específico
class ClienteRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]




# Frontend views
def home(request):
    return render(request, 'frontend/inicio.html')

def index(request):
    return render(request, 'proveedores/index.html')  # Creas este template

def registrar(request):
    return render(request, 'proveedores/registrar.html')  # Creas este template

def editar(request, proveedor_id):
    return render(request, 'proveedores/editar.html', {'proveedor_id': proveedor_id})  # Creas este template

def eliminar(request, proveedor_id):
    return render(request, 'proveedores/eliminar.html', {'proveedor_id': proveedor_id})  # Creas este template

# API views
class ProveedorListCreate(generics.ListCreateAPIView):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer
    permission_classes = [IsAuthenticated]

