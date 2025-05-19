from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import (
    EmpleadoViewSet, EmpleadoListCreateView, EmpleadoDetailView,
    AusentismoListCreateView, AusentismoDetailView,
    NominaListCreateView, NominaDetailView,
    HoraExtraListCreateView, HoraExtraDetailView,
    ContactListCreateView, ContactDetailView,
    LiquidacionViewSet
)

app_name = 'recursos_humanos'

# Crear el router para las rutas automáticas
router = DefaultRouter()
router.register(r'empleados', EmpleadoViewSet, basename='empleado')
router.register(r'liquidaciones', LiquidacionViewSet, basename='liquidacion')

# URLs principales (no API)
main_urlpatterns = [
    path('', views.index, name='rh_index'),
    path('nomina/pdf/<int:nomina_id>/', views.generar_pdf_nomina, name='nomina_pdf'),
    path('liquidacion/', views.liquidacion_view, name='liquidacion'),
]

# URLs de la API
api_urlpatterns = [
    path('', views.RecursosHumanosRootView.as_view(), name='api-root'),
    
    # Rutas específicas de empleados
    path('empleados/<int:empleado_id>/liquidaciones/', 
         LiquidacionViewSet.as_view({'get': 'list'}), 
         name='empleado-liquidaciones'),
    
    # Rutas básicas
    path('empleados/', EmpleadoListCreateView.as_view(), name='empleado-list'),
    path('empleados/<int:pk>/', EmpleadoDetailView.as_view(), name='empleado-detail'),
    path('ausentismos/', AusentismoListCreateView.as_view(), name='ausentismo-list'),
    path('ausentismos/<int:pk>/', AusentismoDetailView.as_view(), name='ausentismo-detail'),
    path('horas_extras/', HoraExtraListCreateView.as_view(), name='horaextra-list'),
    path('horas_extras/<int:pk>/', HoraExtraDetailView.as_view(), name='horaextra-detail'),
    path('nominas/', NominaListCreateView.as_view(), name='nomina-list'),
    path('nominas/<int:pk>/', NominaDetailView.as_view(), name='nomina-detail'),
    path('contacts/', ContactListCreateView.as_view(), name='contact-list'),
    path('contacts/<int:pk>/', ContactDetailView.as_view(), name='contact-detail'),
]

# Combinar todas las URLs
urlpatterns = main_urlpatterns + [
    # Incluir las URLs de la API bajo el prefijo /api/recursos_humanos/
    path('api/recursos_humanos/', include(api_urlpatterns + router.urls)),
]