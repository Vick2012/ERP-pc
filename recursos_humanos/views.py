from django.shortcuts import render
from rest_framework import generics
from .models import Empleado
from .serializers import EmpleadoSerializer
from .models import Empleado, Nomina, Ausentismo, HoraExtra, Contact
from .serializers import EmpleadoSerializer, NominaSerializer, AusentismoSerializer, HoraExtraSerializer, ContactSerializer



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

class EmpleadoListCreateView(generics.ListCreateAPIView):
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializer

class EmpleadoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializer

class NominaListCreateView(generics.ListCreateAPIView):
    queryset = Nomina.objects.all()
    serializer_class = NominaSerializer

class NominaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Nomina.objects.all()
    serializer_class = NominaSerializer

class AusentismoListCreateView(generics.ListCreateAPIView):
    queryset = Ausentismo.objects.all()
    serializer_class = AusentismoSerializer

class AusentismoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ausentismo.objects.all()
    serializer_class = AusentismoSerializer

class HoraExtraListCreateView(generics.ListCreateAPIView):
    queryset = HoraExtra.objects.all()
    serializer_class = HoraExtraSerializer

class HoraExtraDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = HoraExtra.objects.all()
    serializer_class = HoraExtraSerializer

class ContactListCreateView(generics.ListCreateAPIView):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

class ContactDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer