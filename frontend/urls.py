from django.urls import path
from . import views


urlpatterns = [
    path('status/', views.auth_status, name='auth_status'),
]

app_name = 'frontend'

urlpatterns = [
    path('', views.inicio, name='inicio'),
]