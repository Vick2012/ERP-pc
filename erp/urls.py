from django.urls import path, include

urlpatterns = [
    path('', include('frontend.urls')),  # Incluir todas las URLs de la aplicación frontend
]