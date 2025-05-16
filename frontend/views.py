from django.http import JsonResponse, HttpResponse, HttpResponseRedirect
from django.urls import reverse
from django.shortcuts import render, get_object_or_404
from rest_framework.decorators import api_view
from rest_framework import generics, status
from django.contrib.auth.hashers import make_password, check_password
from django.db import transaction, IntegrityError
from .models import Contact, Proveedor, Nomina
from .serializers import ContactSerializer, ProveedorSerializer
from clientes.models import Cliente
from clientes.serializers import ClienteSerializer
from recursos_humanos.models import Empleado
from django.template.loader import get_template
from xhtml2pdf import pisa

# ---------------------- PÁGINAS HTML ----------------------

def index(request):
    return render(request, 'frontend/index.html')

def inicio(request):
    return render(request, 'frontend/inicio.html')

def logout_user(request):
    if 'user_id' in request.session:
        del request.session['user_id']
    return HttpResponseRedirect(reverse('index'))

# ---------------------- API: CLIENTES, CONTACTOS, PROVEEDORES ----------------------

class ClientesListCreateView(generics.ListCreateAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

class ContactListCreateView(generics.ListCreateAPIView):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

class ProveedoresListCreateView(generics.ListCreateAPIView):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer

class ProveedorDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer

# ---------------------- AUTHENTICACIÓN ----------------------

@api_view(['GET'])
def auth_status(request):
    if request.session.get('user_id'):
        try:
            user = Contact.objects.get(id=request.session['user_id'])
            return JsonResponse({'success': True, 'authenticated': True, 'username': user.name})
        except Contact.DoesNotExist:
            return JsonResponse({'success': False, 'authenticated': False, 'error': 'Usuario no encontrado'}, status=404)
    return JsonResponse({'success': True, 'authenticated': False})

@api_view(['POST'])
def register(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)

    try:
        name = request.data.get('name')
        email = request.data.get('email')
        username = request.data.get('username')
        password = request.data.get('password')

        if not all([name, email, username, password]):
            return JsonResponse({'success': False, 'error': 'Todos los campos son obligatorios.'}, status=400)

        if Contact.objects.filter(email=email).exists():
            return JsonResponse({'success': False, 'error': 'Este correo ya está registrado.'}, status=400)

        if Contact.objects.filter(name=username).exists():
            return JsonResponse({'success': False, 'error': 'Este nombre de usuario ya está en uso.'}, status=400)

        with transaction.atomic():
            contact = Contact(name=name, email=email, message=username, password=make_password(password))
            contact.save()

        return JsonResponse({'success': True, 'message': 'Usuario registrado exitosamente.'}, status=201)

    except IntegrityError:
        return JsonResponse({'success': False, 'error': 'El email o username ya está registrado.'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@api_view(['POST'])
def login_user(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)

    try:
        username = request.data.get('username')
        password = request.data.get('password')

        if not all([username, password]):
            return JsonResponse({'success': False, 'error': 'Usuario y contraseña son requeridos'}, status=400)

        user = Contact.objects.get(message=username)
        if check_password(password, user.password):
            request.session['user_id'] = user.id
            return JsonResponse({'success': True, 'message': 'Inicio de sesión exitoso'})
        else:
            return JsonResponse({'success': False, 'error': 'Contraseña incorrecta'}, status=400)

    except Contact.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Usuario no encontrado'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

# ---------------------- FORMULARIO DE CONTACTO ----------------------

@api_view(['POST'])
def save_contact(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)

    try:
        name = request.data.get('name')
        email = request.data.get('email')
        message = request.data.get('message')

        if not all([name, email, message]):
            return JsonResponse({'success': False, 'error': 'Todos los campos son requeridos'}, status=400)

        with transaction.atomic():
            contact = Contact(name=name, email=email, message=message)
            contact.save()

        return JsonResponse({'success': True, 'message': 'Contacto guardado correctamente'}, status=201)

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

# ---------------------- LISTA CONTACTOS ----------------------

@api_view(['GET'])
def list_contacts(request):
    if request.method == 'GET':
        contacts = Contact.objects.all()
        serializer = ContactSerializer(contacts, many=True)
        return JsonResponse({'success': True, 'contacts': serializer.data})
    return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)

# ---------------------- PDF DE NÓMINA ----------------------

def generar_pdf_nomina(request, nomina_id):
    nomina = get_object_or_404(Nomina, pk=nomina_id)
    template = get_template('recibos/nomina_pdf.html')
    html = template.render({'nomina': nomina})

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="nomina_{nomina.empleado.nombre}.pdf"'

    pisa_status = pisa.CreatePDF(html, dest=response)

    if pisa_status.err:
        return HttpResponse("Error al generar PDF", status=500)
    
    return response
