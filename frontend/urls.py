from django.urls import path
from . import views
from .views import index

urlpatterns = [
    path('', index, name='index'),
    path('', views.index, name='index'),
    path('modulos/', views.inicio, name='modulos'),
    path('logout/', views.logout_user, name='logout'),
    path('status/', views.auth_status, name='auth_status'),
    path('save-contact/', views.save_contact, name='save_contact'),
    path('login/', views.login_user, name='login_user'),
    path('register/', views.register_user, name='register_user'),
]