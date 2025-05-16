from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from django.template.loader import get_template
from xhtml2pdf import pisa
from rest_framework import generics, viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
from django.template.loader import get_template
from django.conf import settings
from django.shortcuts import get_object_or_404
import os
from xhtml2pdf import pisa
from django.http import HttpResponse
from django.template.loader import get_template
from django.utils.timezone import now
from xhtml2pdf import pisa
from frontend.models import Nomina
import io
from django.http import JsonResponse



from .models import Empleado, Nomina, Ausentismo, HoraExtra, Contact, Liquidacion
from .serializers import (
    EmpleadoSerializer, NominaSerializer, AusentismoSerializer,
    HoraExtraSerializer, ContactSerializer, LiquidacionSerializer
)
from rest_framework import status
from rest_framework import generics
from .models import Nomina
from .serializers import NominaSerializer
from django.shortcuts import render

def serve_nomina_pdf_template(request):
    return render(request, 'recibos/nomina_pdf.html')


class NominaListCreateView(generics.ListCreateAPIView):
    queryset = Nomina.objects.all()
    serializer_class = NominaSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({'id': serializer.data['id']}, status=status.HTTP_201_CREATED)



class NominaListCreateView(generics.ListCreateAPIView):
    queryset = Nomina.objects.all()
    serializer_class = NominaSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("❌ Errores en serializer:", serializer.errors)
            return Response(serializer.errors, status=400)
        self.perform_create(serializer)
        return Response({'id': serializer.instance.id}, status=201)


# Vista raíz de Recursos Humanos (GET /api/rrhh/)
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
def link_callback(uri, rel):
    """
    Convert HTML URIs to absolute system paths so xhtml2pdf can access those resources.
    """
    if uri.startswith(settings.STATIC_URL):
        path = os.path.join(settings.STATIC_ROOT, uri.replace(settings.STATIC_URL, ""))
    elif uri.startswith(settings.MEDIA_URL):
        path = os.path.join(settings.MEDIA_ROOT, uri.replace(settings.MEDIA_URL, ""))
    else:
        return uri

    if not os.path.isfile(path):
        raise Exception(f"File {path} does not exist")
    return path

# GENERADOR DE PDF
def generar_pdf_nomina(request, nomina_id):
    nomina = get_object_or_404(Nomina, id=nomina_id)
    data = {
        'empleado': str(nomina.empleado),
        'documento': nomina.empleado.documento if hasattr(nomina.empleado, 'documento') else 'N/A',
        'salario_base': str(nomina.salario_base),
        'bonificaciones': str(nomina.bonificaciones),
        'deducciones': str(nomina.deducciones),
        'salario_neto': str(nomina.salario_neto),
        'periodo_inicio': str(nomina.periodo_inicio),
        'periodo_fin': str(nomina.periodo_fin),
    }
    return JsonResponse(data)
# Empleados
class EmpleadoViewSet(viewsets.ModelViewSet):
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializer

class EmpleadoListCreateView(generics.ListCreateAPIView):
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializer

    def get_queryset(self):
        queryset = Empleado.objects.all()
        documento = self.request.query_params.get('documento', None)
        if documento is not None:
            queryset = queryset.filter(documento=documento)
        return queryset

class EmpleadoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializer

# Nóminas
class NominaListCreateView(generics.ListCreateAPIView):
    queryset = Nomina.objects.all()
    serializer_class = NominaSerializer

class NominaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Nomina.objects.all()
    serializer_class = NominaSerializer

# Ausentismos
class AusentismoListCreateView(generics.ListCreateAPIView):
    queryset = Ausentismo.objects.all()
    serializer_class = AusentismoSerializer

    def get_queryset(self):
        queryset = Ausentismo.objects.all()
        documento = self.request.query_params.get('documento', None)
        if documento:
            queryset = queryset.filter(documento=documento)
        return queryset.select_related('empleado')

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

# Contactos
class ContactListCreateView(generics.ListCreateAPIView):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

class ContactDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

# Liquidaciones
class LiquidacionViewSet(viewsets.ModelViewSet):
    queryset = Liquidacion.objects.all()
    serializer_class = LiquidacionSerializer

# Página de inicio opcional
def index(request):
    return render(request, 'recursos_humanos/index.html')
