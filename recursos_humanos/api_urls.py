from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .viewsets import EmpleadoViewSet, LiquidacionViewSet
from .views import (
    RecursosHumanosRootView,
    EmpleadoListCreateView, EmpleadoDetailView,
    NominaListCreateView, NominaDetailView,
    AusentismoListCreateView, AusentismoDetailView,
    HoraExtraListCreateView, HoraExtraDetailView,
    ContactListCreateView, ContactDetailView,
)

# Configuración del router para ViewSets
router = DefaultRouter()
router.register(r'empleados', EmpleadoViewSet, basename='empleados')
router.register(r'liquidaciones', LiquidacionViewSet, basename='liquidaciones')

app_name = 'rrhh-api'

urlpatterns = [
    # Vista raíz (opcional)
    path('', RecursosHumanosRootView.as_view(), name='rrhh_root'),

    # Endpoints API clásicos (no ViewSet)
    path('empleados-list/', EmpleadoListCreateView.as_view(), name='empleados_list'),
    path('empleados-list/<int:pk>/', EmpleadoDetailView.as_view(), name='empleado_detail'),

    path('nominas/', NominaListCreateView.as_view(), name='nominas_list'),
    path('nominas/<int:pk>/', NominaDetailView.as_view(), name='nominas_detail'),

    path('ausentismos/', AusentismoListCreateView.as_view(), name='ausentismos_list'),
    path('ausentismos/<int:pk>/', AusentismoDetailView.as_view(), name='ausentismos_detail'),

    path('horas_extras/', HoraExtraListCreateView.as_view(), name='horas_extras_list'),
    path('horas_extras/<int:pk>/', HoraExtraDetailView.as_view(), name='horas_extras_detail'),

    path('contacts/', ContactListCreateView.as_view(), name='contacts_list'),
    path('contacts/<int:pk>/', ContactDetailView.as_view(), name='contacts_detail'),

    # Rutas generadas automáticamente por los ViewSets
    path('', include(router.urls)),
]
