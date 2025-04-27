from django.urls import path
from .views import (
    index, inicio, logout_user, list_contacts, auth_status, register,
    login_user, save_contact, ContactListCreateView, ProveedoresListCreateView,
    ClientesListCreateView, ProveedorDetailView, ClienteDetailView
)

urlpatterns = [
    # Rutas para renderizar páginas
    path('', index, name='index'),  # Página principal
    path('modulos/', inicio, name='modulos'),  # Página de módulos
    path('logout/', logout_user, name='logout'),  # Cerrar sesión

    # Rutas de API
    path('api/contacts/list/', list_contacts, name='list_contacts'),
    path('api/auth/status/', auth_status, name='auth_status'),
    path('api/auth/register/', register, name='register'),
    path('api/auth/login/', login_user, name='login'),
    path('api/auth/save-contact/', save_contact, name='save_contact'),
    path('api/Contacts/', ContactListCreateView.as_view(), name='contact_list_create'),
    path('api/proveedores/', ProveedoresListCreateView.as_view(), name='proveedores_list_create'),
    path('api/clientes/', ClientesListCreateView.as_view(), name='clientes_list_create'),
    path('api/proveedores/<int:pk>/', ProveedorDetailView.as_view(), name='proveedor_detail'),
    path('api/clientes/<int:pk>/', ClienteDetailView.as_view(), name='cliente_detail'),
]