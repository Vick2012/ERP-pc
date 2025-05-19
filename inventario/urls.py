from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Definir el app_name para el namespace
app_name = 'inventario-api'

router = DefaultRouter()
router.register(r'categorias', views.CategoriaViewSet)
router.register(r'unidades-medida', views.UnidadMedidaViewSet)
router.register(r'productos', views.ProductoViewSet)
router.register(r'movimientos', views.MovimientoViewSet)

urlpatterns = [
    path('', views.index, name='inventario_index'),
    path('api/', include(router.urls)),
] 