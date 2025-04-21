from django.contrib import admin
from django.urls import path, include
from .views import home
from clientes.urls import frontend_urlpatterns as clientes_frontend_urlpatterns, api_urlpatterns as clientes_api_urlpatterns
from proveedores.urls import frontend_urlpatterns as proveedores_frontend_urlpatterns, api_urlpatterns as proveedores_api_urlpatterns

urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    path('clientes/', include((clientes_frontend_urlpatterns, 'clientes'), namespace='clientes')),
    path('proveedores/', include((proveedores_frontend_urlpatterns, 'proveedores'), namespace='proveedores')),
    path('api/clientes/', include((clientes_api_urlpatterns, 'clientes'), namespace='clientes-api')),
    path('api/proveedores/', include((proveedores_api_urlpatterns, 'proveedores'), namespace='proveedores-api')),
]
