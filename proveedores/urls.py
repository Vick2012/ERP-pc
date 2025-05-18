from django.urls import path
from .views import ProveedorListCreate, ProveedorRetrieveUpdateDestroy

app_name = 'proveedores'

urlpatterns = [
    # Rutas de API
    path('', ProveedorListCreate.as_view(), name='proveedor-list'),
    path('<int:pk>/', ProveedorRetrieveUpdateDestroy.as_view(), name='proveedor-detail'),
]
