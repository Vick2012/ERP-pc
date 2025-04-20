from django.urls import path
from . import views

# Rutas del frontend
frontend_urlpatterns = [
    path('', views.index, name='index'),
    path('registrar/', views.registrar, name='registrar'),
    path('editar/<int:cliente_id>/', views.editar, name='editar'),
    path('desactivar/<int:cliente_id>/', views.desactivar, name='desactivar'),
    path('historial/<int:cliente_id>/', views.historial, name='historial'),
]

# Rutas de API
api_urlpatterns = [
    path('', views.ClienteListCreate.as_view(), name='cliente-list-create'),  # Cambia 'list-create/' por ''
]