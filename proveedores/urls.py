from django.urls import path
from frontend.views import ProveedoresListCreateView, ProveedorDetailView

app_name = 'proveedores'

# Rutas del frontend (usadas por vistas basadas en funciones, si las necesitas)
frontend_urlpatterns = [
    # No definimos rutas de frontend porque no tenemos vistas específicas
]

# Rutas de la API (usadas por app.js)
api_urlpatterns = [
    path('', ProveedoresListCreateView.as_view(), name='proveedor-list-create'),
    path('<int:pk>/', ProveedorDetailView.as_view(), name='proveedor-detail'),
]