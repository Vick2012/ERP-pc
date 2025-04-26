from django.http import JsonResponse

def home(request):
    return JsonResponse({"message": "Bienvenido al ERP Logística de Eventos API"})