from django.urls import path
from . import views
from .views import (
    EmpleadoListCreateView, EmpleadoDetailView,
    AusentismoListCreateView, AusentismoDetailView,
    NominaListCreateView, NominaDetailView,
    HoraExtraListCreateView, HoraExtraDetailView,
    RecursosHumanosRootView, serve_nomina_pdf_template
)

app_name = 'recursos_humanos'

urlpatterns = [
    # Vistas principales
    path('', views.index, name='rh_index'),
    path('nomina/pdf/<int:nomina_id>/', views.generar_pdf_nomina, name='nomina_pdf'),
    
    # API Endpoints
    path('api/', RecursosHumanosRootView.as_view(), name='api-root'),
    
    # API Empleados
    path('api/empleados/', EmpleadoListCreateView.as_view(), name='empleado-list'),
    path('api/empleados/<int:pk>/', EmpleadoDetailView.as_view(), name='empleado-detail'),
    
    # API Ausentismos y Horas Extras
    path('api/ausentismos/', AusentismoListCreateView.as_view(), name='ausentismo-list'),
    path('api/ausentismos/<int:pk>/', AusentismoDetailView.as_view(), name='ausentismo-detail'),
    path('api/horas-extras/', HoraExtraListCreateView.as_view(), name='horaextra-list'),
    path('api/horas-extras/<int:pk>/', HoraExtraDetailView.as_view(), name='horaextra-detail'),
    
    # API Nóminas
    path('api/nominas/', NominaListCreateView.as_view(), name='nomina-list'),
    path('api/nominas/<int:pk>/', NominaDetailView.as_view(), name='nomina-detail'),
]