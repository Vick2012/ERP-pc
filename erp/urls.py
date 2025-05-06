from django.urls import path, include

urlpatterns = [
    path('', include('frontend.urls')),  # Incluir todas las URLs de la aplicación frontend
    path('recursos-humanos/', include('recursos_humanos.urls')),
    #path('inventario/', include('inventario.urls')),
    #path('contabilidad/', include('contabilidad.urls')),
    #path('servicios/', include('servicios.urls')),

]