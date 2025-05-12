from django.contrib import admin
from django.urls import path, include
from recursos_humanos.views import generar_pdf_nomina


# Vistas frontend globales
from frontend.views import (
    index, inicio, logout_user, list_contacts, auth_status,
    register, login_user, save_contact, ContactListCreateView
)

urlpatterns = [
    # Rutas frontend
    path('', index, name='index'),
    path('modulos/', inicio, name='modulos'),
    path('logout/', logout_user, name='logout'),

    # Rutas API de autenticación y contactos
    path('api/auth/status/', auth_status, name='auth_status'),
    path('api/auth/register/', register, name='register'),
    path('api/auth/login/', login_user, name='login'),
    path('api/auth/save-contact/', save_contact, name='save_contact'),
    path('api/contacts/', ContactListCreateView.as_view(), name='contact_list_create'),
    path('api/contacts/list/', list_contacts, name='list_contacts'),

    # ✅ Rutas API completas por módulo
    path('api/proveedores/', include('proveedores.urls', namespace='proveedores-api')),  # Ya estaba bien
    path('api/clientes/', include('clientes.api_urls', namespace='clientes-api')),        # Asegúrate que existe
    path('api/recursos_humanos/', include('recursos_humanos.api_urls', namespace='recursos_humanos-api')),
    path('api/rrhh/', include('recursos_humanos.api_urls', namespace='rrhh-api')),
        # Asegúrate que existe

    # ✅ Rutas web por módulo (HTML render)
    path('clientes/', include('clientes.urls', namespace='clientes')),
    path('recursos_humanos/', include('recursos_humanos.urls', namespace='recursos_humanos')),

    # Admin
    path('admin/', admin.site.urls),

    # Creacion PDF Nomina
    path('nomina/pdf/<int:nomina_id>/', generar_pdf_nomina, name='nomina_pdf'),
    path('recursos_humanos/nomina/pdf/<int:nomina_id>/', generar_pdf_nomina, name='nomina_pdf'),


]
