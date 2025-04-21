from django.urls import path
from . import views

# Rutas del frontend
frontend_urlpatterns = [
    path('', views.index, name='index'),
    path('registrar/', views.registrar, name='registrar'),
    path('editar/<int:cliente_id>/', views.editar, name='editar'),
    path('eliminar/<int:cliente_id>/', views.eliminar, name='eliminar'),
]

# Rutas de API
api_urlpatterns = [
    path('', views.ClienteListCreate.as_view(), name='cliente-list-create'),
    path('<int:pk>/', views.ClienteRetrieveUpdateDestroy.as_view(), name='cliente-detail'),
]

# Combinar las URLs
urlpatterns = frontend_urlpatterns + api_urlpatterns