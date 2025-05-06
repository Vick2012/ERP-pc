from django.urls import path
from . import views
from .views import EmpleadoListCreateView, EmpleadoDetailView

app_name = 'recursos_humanos'

urlpatterns = [
    path('', views.index, name='rh_index'),

    # API REST
    path('api/empleados/', EmpleadoListCreateView.as_view(), name='empleado_list_create'),
    path('api/empleados/<int:pk>/', EmpleadoDetailView.as_view(), name='empleado_detail'),
    path('recursos_humanos/', views.EmpleadoListCreateView.as_view(), name='recursos_humanos_list'),
    path('recursos_humanos/<int:pk>/', views.EmpleadoDetailView.as_view(), name='recursos_humanos_detail'),
]


