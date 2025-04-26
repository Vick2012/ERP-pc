from django.urls import path
from . import views

app_name = 'proveedores'

# Rutas del frontend (usadas por vistas basadas en funciones, si las necesitas)
frontend_urlpatterns = [
    path('', views.index, name='index'),
    path('registrar/', views.registrar, name='registrar'),
    path('editar/<int:proveedor_id>/', views.editar, name='editar'),
    path('eliminar/<int:proveedor_id>/', views.eliminar, name='eliminar'),
]

# Rutas de la API (usadas por app.js)
api_urlpatterns = [
    path('', views.ProveedorListCreate.as_view(), name='proveedor-list-create'),
    path('<int:pk>/', views.ProveedorRetrieveUpdateDestroy.as_view(), name='proveedor-detail'),
]