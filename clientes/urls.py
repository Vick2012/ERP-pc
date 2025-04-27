from django.urls import path
from frontend.views import ClientesListCreateView, ClienteDetailView  # Importamos desde frontend.views

app_name = 'clientes'

# Rutas del frontend (usadas por vistas basadas en funciones, si las necesitas)
frontend_urlpatterns = [
    # No definimos rutas de frontend porque no tenemos vistas como registrar, editar, eliminar
    # Si las necesitas, crea las vistas correspondientes en frontend/views.py
]

# Rutas de la API (usadas por app.js)
api_urlpatterns = [
    path('', ClientesListCreateView.as_view(), name='cliente-list-create'),
    path('<int:pk>/', ClienteDetailView.as_view(), name='cliente-detail'),
]