from django.shortcuts import render, redirect
from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import Cliente
from .serializers import ClienteSerializer

# Vista de API para listar y crear clientes
class ClienteListCreate(generics.ListCreateAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [AllowAny]

# Vistas del frontend
def index(request):
    clientes = Cliente.objects.all()
    return render(request, 'clientes/index.html', {'clientes': clientes})

def registrar(request):
    if request.method == 'POST':
        nombre = request.POST.get('nombre')
        contacto = request.POST.get('contacto')
        direccion = request.POST.get('direccion')
        telefono = request.POST.get('telefono')
        email = request.POST.get('email')
        tipo_cliente = request.POST.get('tipo_cliente')
        Cliente.objects.create(
            nombre=nombre,
            contacto=contacto,
            direccion=direccion,
            telefono=telefono,
            email=email,
            tipo_cliente=tipo_cliente
        )
        return redirect('clientes:index')
    return render(request, 'clientes/registrar.html')

def editar(request, cliente_id):
    cliente = Cliente.objects.get(id=cliente_id)
    if request.method == 'POST':
        cliente.nombre = request.POST.get('nombre')
        cliente.contacto = request.POST.get('contacto')
        cliente.direccion = request.POST.get('direccion')
        cliente.telefono = request.POST.get('telefono')
        cliente.email = request.POST.get('email')
        cliente.tipo_cliente = request.POST.get('tipo_cliente')
        cliente.save()
        return redirect('clientes:index')
    return render(request, 'clientes/editar.html', {'cliente': cliente})

def desactivar(request, cliente_id):
    cliente = Cliente.objects.get(id=cliente_id)
    cliente.estado = 'inactivo'
    cliente.save()
    return redirect('clientes:index')

def historial(request, cliente_id):
    cliente = Cliente.objects.get(id=cliente_id)
    # Aquí podrías agregar lógica para mostrar el historial
    return render(request, 'clientes/historial.html', {'cliente': cliente})



# Vista de API para listar y crear clientes
class ClienteListCreate(generics.ListCreateAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [AllowAny]

# Vista de API para obtener, actualizar y eliminar un cliente específico
class ClienteRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [AllowAny]

# Vistas del frontend (si las necesitas)
def index(request):
    clientes = Cliente.objects.all()
    return render(request, 'clientes/index.html', {'clientes': clientes})

def registrar(request):
    if request.method == 'POST':
        nombre = request.POST.get('nombre')
        contacto = request.POST.get('contacto')
        preferencias = request.POST.get('preferencias')
        Cliente.objects.create(
            nombre=nombre,
            contacto=contacto,
            preferencias=preferencias
        )
        return redirect('clientes:index')
    return render(request, 'clientes/registrar.html')

def editar(request, cliente_id):
    cliente = Cliente.objects.get(id=cliente_id)
    if request.method == 'POST':
        cliente.nombre = request.POST.get('nombre')
        cliente.contacto = request.POST.get('contacto')
        cliente.preferencias = request.POST.get('preferencias')
        cliente.save()
        return redirect('clientes:index')
    return render(request, 'clientes/editar.html', {'cliente': cliente})

def eliminar(request, cliente_id):
    cliente = Cliente.objects.get(id=cliente_id)
    cliente.delete()
    return redirect('clientes:index')