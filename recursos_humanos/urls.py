# rrhh/urls.py
from django.urls import path
from . import views
from .views import EmpleadoListCreateView, EmpleadoDetailView
from .views import generar_pdf_nomina

app_name = 'recursos_humanos'

urlpatterns = [
    path('', views.index, name='rh_index'),
    path('api/empleados/', EmpleadoListCreateView.as_view(), name='empleados_list_create'),
    path('api/empleados/<int:pk>/', EmpleadoDetailView.as_view(), name='empleado_detail'),
    path('nomina/pdf/<int:nomina_id>/', generar_pdf_nomina, name='nomina_pdf'),
]
