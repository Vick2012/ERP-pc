from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view

@api_view(['GET'])
def auth_status(request):
    if request.user.is_authenticated:
        return JsonResponse({'authenticated': True, 'username': request.user.username})
    return JsonResponse({'authenticated': False})

def inicio(request):
    return render(request, 'frontend/inicio.html')