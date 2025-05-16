from django.contrib import admin
from django.urls import path, include
from recursos_humanos.views import generar_pdf_nomina
from django.conf import settings
from django.conf.urls.static import static
from frontend.views import (
    index, inicio, logout_user, list_contacts, auth_status,
    register, login_user, save_contact, ContactListCreateView
)

urlpatterns = [
    path('', index, name='index'),
    path('modulos/', inicio, name='modulos'),
    path('logout/', logout_user, name='logout'),

    # Autenticación
    path('api/auth/status/', auth_status, name='auth_status'),
    path('api/auth/register/', register, name='register'),
    path('api/auth/login/', login_user, name='login'),
    path('api/auth/save-contact/', save_contact, name='save_contact'),

    # Contactos
    path('api/contacts/', ContactListCreateView.as_view(), name='contact_list_create'),
    path('api/contacts/list/', list_contacts, name='list_contacts'),

    # APIs por módulos
    path('api/proveedores/', include('proveedores.urls', namespace='proveedores-api')),
    path('api/clientes/', include('clientes.api_urls', namespace='clientes-api')),
    path('api/recursos_humanos/', include('recursos_humanos.api_urls', namespace='recursos_humanos-api')),
    path('api/rrhh/', include('recursos_humanos.api_urls', namespace='rrhh-api')),

    # Frontend por módulos
    path('clientes/', include('clientes.urls', namespace='clientes')),
    path('recursos_humanos/', include('recursos_humanos.urls', namespace='recursos_humanos-frontend')),  # Changed to avoid conflict

    # ✅ Solo UNA ruta PDF bien definida
    path('recursos_humanos/nomina/pdf/<int:nomina_id>/', generar_pdf_nomina, name='nomina_pdf'),

    # Admin
    path('admin/', admin.site.urls),
] + static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])