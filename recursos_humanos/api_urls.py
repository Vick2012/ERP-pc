from django.urls import path
from .views import (
    EmpleadoListCreateView, EmpleadoDetailView,
    NominaListCreateView, NominaDetailView,
    AusentismoListCreateView, AusentismoDetailView,
    HoraExtraListCreateView, HoraExtraDetailView,
    ContactListCreateView, ContactDetailView
)

app_name = 'rrhh-api'

urlpatterns = [
    path('empleados/', EmpleadoListCreateView.as_view(), name='empleado_list_create'),
    path('empleados/<int:pk>/', EmpleadoDetailView.as_view(), name='empleado_detail'),
    
    path('nominas/', NominaListCreateView.as_view(), name='nominas_list'),
    path('nominas/<int:pk>/', NominaDetailView.as_view(), name='nominas_detail'),
    
    path('ausentismos/', AusentismoListCreateView.as_view(), name='ausentismos_list'),
    path('ausentismos/<int:pk>/', AusentismoDetailView.as_view(), name='ausentismos_detail'),
    
    path('horas_extras/', HoraExtraListCreateView.as_view(), name='horas_extras_list'),
    path('horas_extras/<int:pk>/', HoraExtraDetailView.as_view(), name='horas_extras_detail'),
    
    path('contacts/', ContactListCreateView.as_view(), name='contacts_list'),
    path('contacts/<int:pk>/', ContactDetailView.as_view(), name='contacts_detail'),
]