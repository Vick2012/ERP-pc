from django.urls import path
from . import views
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.contrib.auth import views as auth_views



urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/proveedores/', include('proveedores.urls')),
    path('api/clientes/', include('clientes.urls')),
    path('', TemplateView.as_view(template_name='frontend/index.html'), name='index'),  # Ruta para la página principal
    path('modulos/', TemplateView.as_view(template_name='frontend/inicio.html'), name='modulos'),  # Ruta para los módulos
    path('api/auth/', include('django.contrib.auth.urls')),  # URLs de autenticación
    path('api/auth/', include('frontend.urls')),  # URLs de frontend para auth_status
]


app_name = 'clientes'

# Rutas del frontend (usadas por vistas basadas en funciones, si las necesitas)
frontend_urlpatterns = [
    path('', views.index, name='index'),
    path('registrar/', views.registrar, name='registrar'),
    path('editar/<int:cliente_id>/', views.editar, name='editar'),
    path('eliminar/<int:cliente_id>/', views.eliminar, name='eliminar'),
]

# Rutas de la API (usadas por app.js)
api_urlpatterns = [
    path('', views.ClienteListCreate.as_view(), name='cliente-list-create'),
    path('<int:pk>/', views.ClienteRetrieveUpdateDestroy.as_view(), name='cliente-detail'),
]