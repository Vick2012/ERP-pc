from django.urls import path, include
from .views import (
    index, inicio, logout_user, list_contacts, auth_status, register,
    login_user, save_contact, ContactListCreateView, ProveedoresListCreateView,
    ClientesListCreateView, ProveedorDetailView, ClienteDetailView,
)
from recursos_humanos.views import RecursosHumanosListCreateView
from recursos_humanos.views import RecursosHumanosListCreateView, EmpleadoDetailView as RecursosHumanosDetailView
 


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

    #path('api/inventario/', InventarioListCreateView.as_view(), name='inventario_list_create'),
    #path('api/inventario/<int:pk>/', InventarioDetailView.as_view(), name='inventario_detail'),

    #path('api/contabilidad/', ContabilidadListCreateView.as_view(), name='contabilidad_list_create'),
    #path('api/contabilidad/<int:pk>/', ContabilidadDetailView.as_view(), name='contabilidad_detail'),

    #path('api/servicios/', ServiciosListCreateView.as_view(), name='servicios_list_create'),
    #path('api/servicios/<int:pk>/', ServiciosDetailView.as_view(), name='servicios_detail'),

    # Rutas internas de las apps
    path('recursos_humanos/', include('recursos_humanos.urls')),
    #path('inventario/', include('inventario.urls')),
    #path('contabilidad/', include('contabilidad.urls')),
    #path('servicios/', include('servicios.urls')),
]
