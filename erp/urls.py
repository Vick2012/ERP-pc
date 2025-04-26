from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from clientes.urls import frontend_urlpatterns as clientes_frontend_urlpatterns, api_urlpatterns as clientes_api_urlpatterns
from proveedores.urls import frontend_urlpatterns as proveedores_frontend_urlpatterns, api_urlpatterns as proveedores_api_urlpatterns

urlpatterns = [
    path('', TemplateView.as_view(template_name='frontend/index.html'), name='index'),
    path('modulos/', TemplateView.as_view(template_name='frontend/inicio.html'), name='modulos'),
    path('admin/', admin.site.urls),
    path('proveedores/', include((proveedores_frontend_urlpatterns, 'proveedores'), namespace='proveedores')),
    path('clientes/', include((clientes_frontend_urlpatterns, 'clientes'), namespace='clientes')),
    path('api/proveedores/', include((proveedores_api_urlpatterns, 'proveedores'), namespace='proveedores-api')),
    path('api/clientes/', include((clientes_api_urlpatterns, 'clientes'), namespace='clientes-api')),
    path('api/auth/django/', include('django.contrib.auth.urls')),
    path('api/auth/', include('frontend.urls')),
]