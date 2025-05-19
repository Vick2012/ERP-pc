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
from rest_framework.decorators import api_view
from datetime import datetime
from decimal import Decimal

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
                "/api/recursos_humanos/empleados/",
                "/api/recursos_humanos/empleados/{id}/",
                "/api/recursos_humanos/empleados/{id}/liquidaciones/",
                "/api/recursos_humanos/empleados/{id}/liquidaciones/{liquidacion_id}/",
                "/api/recursos_humanos/nominas/",
                "/api/recursos_humanos/ausentismos/",
                "/api/recursos_humanos/horas-extras/",
                "/api/recursos_humanos/contacts/"
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

    def get_queryset(self):
        queryset = super().get_queryset()
        empleado_id = self.kwargs.get('empleado_id')
        
        if empleado_id is not None:
            queryset = queryset.filter(empleado_id=empleado_id)
        
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        empleado_id = self.kwargs.get('empleado_id')
        if empleado_id:
            request.data['empleado'] = empleado_id
        return super().create(request, *args, **kwargs)

# Página de inicio opcional
def index(request):
    return render(request, 'recursos_humanos/index.html')

# Vista para la página de liquidación
def liquidacion_view(request):
    return render(request, 'recursos_humanos/liquidacion.html')

@api_view(['POST'])
def calcular_liquidacion(request):
    try:
        # Obtener datos del request
        data = request.data
        documento = data.get('documento')
        fecha_inicio = datetime.strptime(data.get('fecha_inicio'), '%Y-%m-%d')
        fecha_fin = datetime.strptime(data.get('fecha_fin'), '%Y-%m-%d')
        motivo_retiro = data.get('motivo_retiro')
        tipo_contrato = data.get('tipo_contrato', 'indefinido')
        
        # Obtener el empleado
        empleado = Empleado.objects.get(documento=documento)
        salario = Decimal(str(empleado.salario))

        # Calcular días trabajados
        dias_trabajados = (fecha_fin - fecha_inicio).days + 1
        
        # Base para prestaciones (salario + auxilio de transporte si aplica)
        aplica_auxilio = salario <= (Decimal('1300000') * 2)  # 2 SMLV 2024
        auxilio_transporte = Decimal('140606') if aplica_auxilio else Decimal('0')  # Auxilio 2024
        base_prestaciones = salario + auxilio_transporte

        # 1. Calcular Vacaciones (Art. 186 CST)
        # - Por un año: 15 días hábiles
        # - Por fracción de año: proporcional al tiempo laborado
        # - Base de cálculo: salario ordinario (sin auxilio de transporte)
        # - Fórmula: (Salario × Días trabajados) / 720
        # - El factor 720 sale de: 360 días × 2 (porque son 15 días por cada 360 días)
        vacaciones = (salario * Decimal(str(dias_trabajados))) / Decimal('720')

        # 2. Calcular Indemnización según tipo de contrato y motivo (Art. 64 CST)
        indemnizacion = Decimal('0')
        if motivo_retiro == 'despido_sin_justa_causa':
            if tipo_contrato == 'fijo':
                # Para contratos a término fijo: el valor de los salarios que faltan por terminar el contrato
                # Si el tiempo faltante es superior a 3 meses, se paga solo 3 meses
                tiempo_restante = min((fecha_fin - datetime.now()).days, 90)  # máximo 90 días (3 meses)
                if tiempo_restante > 0:
                    indemnizacion = (salario / Decimal('30')) * Decimal(str(tiempo_restante))
            
            elif tipo_contrato == 'indefinido':
                # Para contratos a término indefinido
                # Calcular años de servicio exactos
                anos_servicio = Decimal(str(dias_trabajados)) / Decimal('365')
                salario_dia = salario / Decimal('30')
                
                if anos_servicio < 1:
                    # Menos de 1 año: 30 días de salario
                    indemnizacion = salario
                else:
                    if salario < (Decimal('10') * Decimal('1300000')):  # Menos de 10 SMLV
                        # 30 días por el primer año
                        indemnizacion = salario
                        
                        # 20 días adicionales por cada año después del primero
                        anos_adicionales = int(anos_servicio)
                        dias_adicionales = anos_adicionales * 20
                        indemnizacion += salario_dia * Decimal(str(dias_adicionales))
                        
                        # Proporcional por fracción de año
                        fraccion_ano = anos_servicio - int(anos_servicio)
                        if fraccion_ano > 0:
                            dias_fraccion = int(fraccion_ano * 20)
                            indemnizacion += salario_dia * Decimal(str(dias_fraccion))
                    
                    else:  # 10 SMLV o más
                        # 20 días por el primer año
                        indemnizacion = salario_dia * Decimal('20')
                        
                        # 15 días adicionales por cada año después del primero
                        anos_adicionales = int(anos_servicio)
                        dias_adicionales = anos_adicionales * 15
                        indemnizacion += salario_dia * Decimal(str(dias_adicionales))
                        
                        # Proporcional por fracción de año
                        fraccion_ano = anos_servicio - int(anos_servicio)
                        if fraccion_ano > 0:
                            dias_fraccion = int(fraccion_ano * 15)
                            indemnizacion += salario_dia * Decimal(str(dias_fraccion))
            
            elif tipo_contrato == 'obra_labor':
                # Para contratos por obra o labor
                # Se paga el valor de los salarios que faltan por terminar la obra
                # Mínimo 15 días de salario
                indemnizacion = max(salario / 2, salario / Decimal('30') * Decimal('15'))

        # 3. Prima de servicios (Un mes de salario por año)
        prima = (base_prestaciones * Decimal(str(dias_trabajados))) / Decimal('360')

        # 4. Cesantías (Un mes de salario por año)
        cesantias = (base_prestaciones * Decimal(str(dias_trabajados))) / Decimal('360')

        # 5. Intereses sobre cesantías (12% anual)
        intereses_cesantias = (cesantias * Decimal('0.12') * Decimal(str(dias_trabajados))) / Decimal('360')

        return Response({
            'cesantias': round(cesantias, 2),
            'intereses_cesantias': round(intereses_cesantias, 2),
            'prima': round(prima, 2),
            'vacaciones': round(vacaciones, 2),
            'indemnizacion': round(indemnizacion, 2),
            'dias_trabajados': dias_trabajados
        })

    except Empleado.DoesNotExist:
        return Response({'error': 'Empleado no encontrado'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=400)
