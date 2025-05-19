from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Frontend y APIs principales
    path('', include('frontend.urls')),

    # APIs por módulos
    path('api/proveedores/', include('proveedores.urls', namespace='proveedores-api')),
    path('api/clientes/', include('clientes.api_urls', namespace='clientes-api')),
    path('api/recursos_humanos/', include('recursos_humanos.api_urls', namespace='recursos_humanos-api')),
    path('api/inventario/', include('inventario.urls', namespace='inventario-api')),

    # Admin
    path('admin/', admin.site.urls),
] + static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])