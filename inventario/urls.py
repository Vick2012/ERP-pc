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
    path('', include(router.urls)),
    path('reporte/pdf/', views.reporte_inventario_pdf, name='reporte_inventario_pdf'),
    path('reporte/excel/', views.reporte_inventario_excel, name='reporte_inventario_excel'),
    path('stock_bajo/pdf/', views.stock_bajo_pdf, name='stock_bajo_pdf'),
    path('stock_bajo/excel/', views.stock_bajo_excel, name='stock_bajo_excel'),
    path('valor_inventario/pdf/', views.valor_inventario_pdf, name='valor_inventario_pdf'),
    path('valor_inventario/excel/', views.valor_inventario_excel, name='valor_inventario_excel'),
    path('movimientos/pdf/', views.movimientos_pdf, name='movimientos_pdf'),
    path('movimientos/excel/', views.movimientos_excel, name='movimientos_excel'),
] 