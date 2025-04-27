from django.urls import path
from frontend.views import list_contacts
from frontend.views import ContactListCreateView
from django.urls import path
from frontend.views import ContactListCreateView, register
from frontend.views import ProveedoresListView, ClientesListView

urlpatterns = [
    path('Contacts/', ContactListCreateView.as_view(), name='list_contacts'),
    path('auth/register/', register, name='register'),
    path('proveedores/', ProveedoresListView.as_view(), name='proveedores_list'),
    path('clientes/', ClientesListView.as_view(), name='clientes_list'),
    path('Contacts/', list_contacts, name='list_contacts'),
]



