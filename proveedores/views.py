from django.shortcuts import render, redirect
from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import Proveedor
from .serializers import ProveedorSerializer

# Vista de API para listar y crear proveedores
class ProveedorListCreate(generics.ListCreateAPIView):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer
    permission_classes = [AllowAny]

# Vista de API para obtener, actualizar y eliminar un proveedor específico
class ProveedorRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer
    permission_classes = [AllowAny]

# Vistas del frontend
def index(request):
    proveedores = Proveedor.objects.all()
    return render(request, 'proveedores/index.html', {'proveedores': proveedores})

def registrar(request):
    if request.method == 'POST':
        nombre = request.POST.get('nombre')
        contacto = request.POST.get('contacto')
        direccion = request.POST.get('direccion')
        telefono = request.POST.get('telefono')
        email = request.POST.get('email')
        tipo_proveedor = request.POST.get('tipo_proveedor')
        Proveedor.objects.create(
            nombre=nombre,
            contacto=contacto,
            direccion=direccion,
            telefono=telefono,
            email=email,
            tipo_proveedor=tipo_proveedor
        )
        return redirect('proveedores:index')
    return render(request, 'proveedores/registrar.html')

def editar(request, proveedor_id):
    proveedor = Proveedor.objects.get(id=proveedor_id)
    if request.method == 'POST':
        proveedor.nombre = request.POST.get('nombre')
        proveedor.contacto = request.POST.get('contacto')
        proveedor.direccion = request.POST.get('direccion')
        proveedor.telefono = request.POST.get('telefono')
        proveedor.email = request.POST.get('email')
        proveedor.tipo_proveedor = request.POST.get('tipo_proveedor')
        proveedor.save()
        return redirect('proveedores:index')
    return render(request, 'proveedores/editar.html', {'proveedor': proveedor})

def eliminar(request, proveedor_id):
    proveedor = Proveedor.objects.get(id=proveedor_id)
    proveedor.delete()
    return redirect('proveedores:index')