from django.shortcuts import render, redirect
from rest_framework import generics
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Cliente
from .serializers import ClienteSerializer

@method_decorator(csrf_exempt, name='dispatch')
class ClienteListCreate(generics.ListCreateAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [AllowAny]

@method_decorator(csrf_exempt, name='dispatch')
class ClienteRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [AllowAny]

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