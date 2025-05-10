from django.shortcuts import render
from rest_framework import generics
from .models import Empleado, Nomina, Ausentismo, HoraExtra, Contact
from .serializers import EmpleadoSerializer, NominaSerializer, AusentismoSerializer, HoraExtraSerializer, ContactSerializer
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response

# Vista de renderizado (opcional si usas template HTML)
def index(request):
    return render(request, 'recursos_humanos/index.html')

class RecursosHumanosRootView(APIView):
    def get(self, request, format=None):
        return Response({
            "status": "ok",
            "message": "API Recursos Humanos disponible.",
            "endpoints": [
                "/api/rrhh/empleados/",
                "/api/rrhh/nominas/",
                "/api/rrhh/ausentismos/",
                "/api/rrhh/horas_extras/",
                "/api/rrhh/contacts/"
            ]
        })


# Empleado
class EmpleadoListCreateView(generics.ListCreateAPIView):
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializer

class EmpleadoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializer


# Nómina
class NominaListCreateView(generics.ListCreateAPIView):
    queryset = Nomina.objects.all()
    serializer_class = NominaSerializer

class NominaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Nomina.objects.all()
    serializer_class = NominaSerializer


# Ausentismo
class AusentismoListCreateView(generics.ListCreateAPIView):
    queryset = Ausentismo.objects.all()
    serializer_class = AusentismoSerializer

class AusentismoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ausentismo.objects.all()
    serializer_class = AusentismoSerializer


# Horas Extras
class HoraExtraListCreateView(generics.ListCreateAPIView):
    queryset = HoraExtra.objects.all()
    serializer_class = HoraExtraSerializer

class HoraExtraDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = HoraExtra.objects.all()
    serializer_class = HoraExtraSerializer


# Contacto
class ContactListCreateView(generics.ListCreateAPIView):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

class ContactDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
