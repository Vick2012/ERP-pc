from django.shortcuts import render
from rest_framework import generics
from .models import Empleado, Nomina, Ausentismo, HoraExtra, Contact
from .serializers import EmpleadoSerializer, NominaSerializer, AusentismoSerializer, HoraExtraSerializer, ContactSerializer
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from django.template.loader import get_template
from django.http import HttpResponse
from xhtml2pdf import pisa
from .models import Nomina
from rest_framework import viewsets
from .models import Liquidacion
from .serializers import LiquidacionSerializer

# Vista para manejar liquidaciones (usada en /api/rrhh/liquidaciones/)
class LiquidacionViewSet(viewsets.ModelViewSet):
    queryset = Liquidacion.objects.all()
    serializer_class = LiquidacionSerializer


def generar_pdf_nomina(request, nomina_id):
    nomina = Nomina.objects.select_related('empleado').get(id=nomina_id)
    template = get_template('recibos/nomina_pdf.html')  # ubicación plantilla
    html = template.render({'nomina': nomina})
    
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename=nomina_{nomina.empleado.nombre}.pdf'
    pisa.CreatePDF(html, dest=response)
    return response

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



# Vista para manejar empleados (usada en /api/rrhh/empleados/)
class EmpleadoViewSet(viewsets.ModelViewSet):
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializer


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
