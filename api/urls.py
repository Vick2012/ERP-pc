from django.urls import path
from frontend.views import (
    register, login_user, auth_status, save_contact, list_contacts,
    ContactListCreateView, ProveedoresListCreateView, ClientesListCreateView,
    ProveedorDetailView, ClienteDetailView
)

urlpatterns = [
    path('auth/register/', register, name='register'),
    path('auth/login/', login_user, name='login_user'),
    path('auth/status/', auth_status, name='auth_status'),
    path('auth/save-contact/', save_contact, name='save_contact'),
    path('Contacts/', ContactListCreateView.as_view(), name='list_contacts'),
    path('contacts/', list_contacts, name='list_contacts_api'),
    path('proveedores/', ProveedoresListCreateView.as_view(), name='proveedores_list'),
    path('proveedores/<int:pk>/', ProveedorDetailView.as_view(), name='proveedor_detail'),
    path('clientes/', ClientesListCreateView.as_view(), name='clientes_list'),
    path('clientes/<int:pk>/', ClienteDetailView.as_view(), name='cliente_detail'),
    
]