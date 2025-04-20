from django.http import JsonResponse
from django.shortcuts import render

def home(request):
    return render(request, 'frontend/inicio.html')  # Asegúrate de que este archivo exista
