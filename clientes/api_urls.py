# clientes/api_urls.py

from django.urls import path
from .views import ClienteListCreate, ClienteRetrieveUpdateDestroy

app_name = 'clientes-api'

urlpatterns = [
    path('', ClienteListCreate.as_view(), name='list-create'),
    path('<int:pk>/', ClienteRetrieveUpdateDestroy.as_view(), name='detail'),
]
