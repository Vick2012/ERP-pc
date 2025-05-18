from django.urls import path
from .views import (
    EmpleadoListCreateView, EmpleadoDetailView,
    AusentismoListCreateView, AusentismoDetailView,
    NominaListCreateView, NominaDetailView,
    HoraExtraListCreateView, HoraExtraDetailView,
    RecursosHumanosRootView
)

app_name = 'recursos_humanos-api'

urlpatterns = [
    # Ruta raíz de la API
    path('', RecursosHumanosRootView.as_view(), name='api-root'),

    # Empleados
    path('empleados/', EmpleadoListCreateView.as_view(), name='empleado-list'),
    path('empleados/<int:pk>/', EmpleadoDetailView.as_view(), name='empleado-detail'),

    # Ausentismos y Horas Extras
    path('ausentismos/', AusentismoListCreateView.as_view(), name='ausentismo-list'),
    path('ausentismos/<int:pk>/', AusentismoDetailView.as_view(), name='ausentismo-detail'),
    path('horas-extras/', HoraExtraListCreateView.as_view(), name='horaextra-list'),
    path('horas-extras/<int:pk>/', HoraExtraDetailView.as_view(), name='horaextra-detail'),

    # Nóminas
    path('nominas/', NominaListCreateView.as_view(), name='nomina-list'),
    path('nominas/<int:pk>/', NominaDetailView.as_view(), name='nomina-detail'),
]
