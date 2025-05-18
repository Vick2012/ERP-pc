from django.contrib import admin
from django.urls import path, include
from .views import (
    index, inicio, logout_user, list_contacts, auth_status, register,
    login_user, save_contact, ContactListCreateView,
    desprendible_nomina_template, verificar_nomina, generar_pdf_nomina,
    EmpleadoListCreateView, EmpleadoDetailView, AusentismoListCreateView, AusentismoDetailView
)

app_name = 'frontend'

urlpatterns = [
    # Rutas frontend
    path('', index, name='index'),
    path('modulos/', inicio, name='modulos'),
    path('logout/', logout_user, name='logout'),
    path('nomina/desprendible/', desprendible_nomina_template, name='desprendible_nomina'),
    path('verificar-nomina/', verificar_nomina, name='verificar_nomina'),
    path('v/', verificar_nomina, name='v'),  # URL corta para el QR

    # Rutas API autenticación y contactos
    path('api/contacts/list/', list_contacts, name='list_contacts'),
    path('api/auth/status/', auth_status, name='auth_status'),
    path('api/auth/register/', register, name='register'),
    path('api/auth/login/', login_user, name='login'),
    path('api/auth/save-contact/', save_contact, name='save_contact'),
    path('api/contacts/', ContactListCreateView.as_view(), name='contact_list_create'),

    # Rutas internas de las apps con namespaces
    path('clientes/', include('clientes.urls', namespace='clientes')),
    path('proveedores/', include('proveedores.urls', namespace='proveedores')),
    path('recursos_humanos/', include('recursos_humanos.urls', namespace='recursos_humanos')),
    path('nomina/pdf/<int:nomina_id>/', generar_pdf_nomina, name='nomina_pdf'),

    # Módulo de Recursos Humanos
    path('api/recursos_humanos/empleados/', EmpleadoListCreateView.as_view(), name='empleados_api'),
    path('api/recursos_humanos/empleados/<int:pk>/', EmpleadoDetailView.as_view(), name='empleado_detail'),
    path('api/recursos_humanos/ausentismos/', AusentismoListCreateView.as_view(), name='ausentismos_api'),
    path('api/recursos_humanos/ausentismos/<int:pk>/', AusentismoDetailView.as_view(), name='ausentismo_detail'),
]