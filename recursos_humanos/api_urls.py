from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EmpleadoListCreateView, EmpleadoDetailView,
    AusentismoListCreateView, AusentismoDetailView,
    NominaListCreateView, NominaDetailView,
    HoraExtraListCreateView, HoraExtraDetailView,
    RecursosHumanosRootView,
    LiquidacionViewSet,
    calcular_liquidacion
)

app_name = 'recursos_humanos-api'

# Create a router for automatic routes
router = DefaultRouter()
router.register(r'liquidaciones', LiquidacionViewSet, basename='liquidacion')

urlpatterns = [
    # Root API route
    path('', RecursosHumanosRootView.as_view(), name='api-root'),

    # Empleados and nested liquidaciones
    path('empleados/', EmpleadoListCreateView.as_view(), name='empleado-list'),
    path('empleados/<int:pk>/', EmpleadoDetailView.as_view(), name='empleado-detail'),
    path('empleados/<int:empleado_id>/liquidaciones/', 
         LiquidacionViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='empleado-liquidaciones'),
    path('empleados/<int:empleado_id>/liquidaciones/<int:pk>/',
         LiquidacionViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='empleado-liquidacion-detail'),

    # Liquidación calculation endpoint
    path('calcular_liquidacion/', calcular_liquidacion, name='calcular-liquidacion'),

    # Include router URLs
    path('', include(router.urls)),

    # Other routes
    path('ausentismos/', AusentismoListCreateView.as_view(), name='ausentismo-list'),
    path('ausentismos/<int:pk>/', AusentismoDetailView.as_view(), name='ausentismo-detail'),
    path('horas-extras/', HoraExtraListCreateView.as_view(), name='horaextra-list'),
    path('horas-extras/<int:pk>/', HoraExtraDetailView.as_view(), name='horaextra-detail'),
    path('nominas/', NominaListCreateView.as_view(), name='nomina-list'),
    path('nominas/<int:pk>/', NominaDetailView.as_view(), name='nomina-detail'),
]
