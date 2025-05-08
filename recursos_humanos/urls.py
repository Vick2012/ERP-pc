# rrhh/urls.py
from django.urls import path
from . import views

app_name = 'rrhh'

urlpatterns = [
    path('', views.index, name='rh_index'),  # Solo vista web
]
