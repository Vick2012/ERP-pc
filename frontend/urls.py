from django.contrib import admin
from django.urls import path, include
from .views import (
    index, inicio, logout_user, list_contacts, auth_status, register,
    login_user, save_contact, ContactListCreateView, ProveedoresListCreateView,
    ClientesListCreateView, ProveedorDetailView, ClienteDetailView,
)
from recursos_humanos.views import RecursosHumanosListCreateView, EmpleadoDetailView as RecursosHumanosDetailView
from recursos_humanos.models import Empleado


app_name = 'frontend'

urlpatterns = [
    # Rutas frontend
    path('', index, name='index'),
    path('modulos/', inicio, name='modulos'),
    path('logout/', logout_user, name='logout'),

    # Rutas API autenticación y contactos
    path('api/contacts/list/', list_contacts, name='list_contacts'),
    path('api/auth/status/', auth_status, name='auth_status'),
    path('api/auth/register/', register, name='register'),
    path('api/auth/login/', login_user, name='login'),
    path('api/auth/save-contact/', save_contact, name='save_contact'),

    # Rutas API por módulo
    path('api/contacts/', ContactListCreateView.as_view(), name='contact_list_create'),
    path('api/proveedores/', ProveedoresListCreateView.as_view(), name='proveedores_list_create'),
    path('api/proveedores/<int:pk>/', ProveedorDetailView.as_view(), name='proveedor_detail'),
    path('api/clientes/', ClientesListCreateView.as_view(), name='clientes_list_create'),
    path('api/clientes/<int:pk>/', ClienteDetailView.as_view(), name='cliente_detail'),
    path('api/recursos_humanos/', RecursosHumanosListCreateView.as_view(), name='recursos_humanos_list_create'),
    path('api/recursos_humanos/<int:pk>/', RecursosHumanosDetailView.as_view(), name='recursos_humanos_detail'),

    # Rutas internas de las apps con namespaces
    path('recursos_humanos/', include('recursos_humanos.urls', namespace='recursos_humanos')),
    #path('inventario/', include('inventario.urls', namespace='inventario')),
    #path('contabilidad/', include('contabilidad.urls', namespace='contabilidad')),
    #path('servicios/', include('servicios.urls', namespace='servicios')),
    path('admin/', admin.site.urls),
]