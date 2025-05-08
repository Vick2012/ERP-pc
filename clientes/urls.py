from django.urls import path
from . import views
from .views import ClienteListCreate, ClienteRetrieveUpdateDestroy

app_name = 'clientes'

urlpatterns = [
    # Rutas web
    path('', views.index, name='index'),
    path('registrar/', views.registrar, name='registrar'),
    path('editar/<int:cliente_id>/', views.editar, name='editar'),
    path('eliminar/<int:cliente_id>/', views.eliminar, name='eliminar'),

    # Rutas API
    path('api/', ClienteListCreate.as_view(), name='cliente-list-create'),
    path('api/<int:pk>/', ClienteRetrieveUpdateDestroy.as_view(), name='cliente-detail'),
]
