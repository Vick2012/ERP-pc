from django.urls import path
from frontend.views import ProveedoresListCreateView, ProveedorDetailView
from .views import ProveedorListCreate, ProveedorRetrieveUpdateDestroy

app_name = 'proveedores'

urlpatterns = [
    # Rutas de API
    path('api/', ProveedorListCreate.as_view(), name='api-proveedor-list'),
    path('api/<int:pk>/', ProveedorRetrieveUpdateDestroy.as_view(), name='api-proveedor-detail'),

    # Rutas frontend
    path('', ProveedoresListCreateView.as_view(), name='proveedor-list-create'),
    path('<int:pk>/', ProveedorDetailView.as_view(), name='proveedor-detail'),
]
