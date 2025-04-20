from django.urls import path
from . import views

# Rutas del frontend
frontend_urlpatterns = [
    path('', views.index, name='index'),
    path('registrar/', views.registrar, name='registrar'),
    path('editar/<int:proveedor_id>/', views.editar, name='editar'),
    path('eliminar/<int:proveedor_id>/', views.eliminar, name='eliminar'),
]

# Rutas de API
api_urlpatterns = [
    path('', views.ProveedorListCreate.as_view(), name='proveedor-list-create'),  # Cambia 'list-create/' por ''
]
