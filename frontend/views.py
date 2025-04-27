from django.http import JsonResponse, HttpResponseRedirect
from django.urls import reverse
from django.shortcuts import render  # Añade esta importación
from rest_framework.decorators import api_view
from .models import Contact
import json
from rest_framework import generics
from .serializers import ContactSerializer
from django.contrib.auth.hashers import make_password
from django.shortcuts import render, redirect
# Añade al final de frontend/views.py
class ProveedoresListView(generics.ListAPIView):
    queryset = []  # Reemplaza con el modelo de Proveedores
    serializer_class = None  # Define un serializador para Proveedores

class ClientesListView(generics.ListAPIView):
    queryset = []  # Reemplaza con el modelo de Clientes
    serializer_class = None  # Define un serializador para Clientes


# Vista para el formulario inicial (GET)
def index(request):
    return render(request, 'frontend/index.html')

# Vista para manejar el registro (POST)
def register(request):
    if request.method == 'POST':
        try:
            # Obtener los datos del formulario
            name = request.POST.get('name')
            email = request.POST.get('email')
            username = request.POST.get('username')
            password = request.POST.get('password')

            # Depuración: Imprimir los datos recibidos
            print(f"Form data - Name: {name}, Email: {email}, Username: {username}, Password: {password}")

            # Validar los datos
            if not all([name, email, username, password]):
                return render(request, 'frontend/index.html', {
                    'error': 'Todos los campos son obligatorios.',
                    'form_data': request.POST
                })

            # Crear el contacto
            contact = Contact(
                name=name,
                email=email,
                username=username,
                password=make_password(password),
            )
            contact.save()

            return render(request, 'frontend/index.html', {
                'success': 'Contacto registrado exitosamente.'
            })

        except Exception as e:
            # Depuración: Imprimir el error
            print(f"Error al registrar contacto: {str(e)}")
            return render(request, 'frontend/index.html', {
                'error': f"Error al registrar: {str(e)}",
                'form_data': request.POST
            })

    # Si no es POST, redirigir al formulario
    return redirect('index')

# Vista para la API /api/Contacts/
class ContactListCreateView(generics.ListCreateAPIView):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer


def index(request):
    if request.method == 'POST':
        try:
            # Obtener los datos del formulario
            name = request.POST.get('name')
            email = request.POST.get('email')
            username = request.POST.get('username')
            password = request.POST.get('password')

            # Validar los datos (básico)
            if not all([name, email, username, password]):
                return render(request, 'frontend/index.html', {
                    'error': 'Todos los campos son obligatorios.',
                    'form_data': request.POST
                })

            # Crear el contacto
            contact = Contact(
                name=name,
                email=email,
                username=username,
                password=make_password(password),  # Hashear la contraseña
            )
            contact.save()

            # Redirigir o mostrar un mensaje de éxito
            return render(request, 'frontend/index.html', {
                'success': 'Contacto registrado exitosamente.'
            })

        except Exception as e:
            # Manejar errores (por ejemplo, email o username ya existen)
            return render(request, 'frontend/index.html', {
                'error': str(e),
                'form_data': request.POST
            })

    # GET: Mostrar el formulario
    return render(request, 'frontend/index.html')



@api_view(['GET'])
def list_contacts(request):
    if request.method == 'GET':
        contacts = Contact.objects.all()
        contacts_data = [
            {
                'id': contact.id,
                'name': contact.name,
                'email': contact.email,
                'username': contact.username,
            }
            for contact in contacts
        ]
        return JsonResponse({'success': True, 'contacts': contacts_data})
    return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)

@api_view(['GET'])
def auth_status(request):
    if request.session.get('user_id'):
        user = Contact.objects.get(id=request.session['user_id'])
        return JsonResponse({'authenticated': True, 'username': user.username})
    return JsonResponse({'authenticated': False})

@api_view(['POST'])
def save_contact(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name')
            email = data.get('email')
            message = data.get('message')

            if not all([name, email, message]):
                return JsonResponse({'success': False, 'error': 'Todos los campos son requeridos'}, status=400)

            if Contact.objects.filter(email=email).exists():
                return JsonResponse({'success': False, 'error': 'Este correo ya ha sido registrado'}, status=400)

            contact = Contact(name=name, email=email, message=message)
            contact.save()

            return JsonResponse({'success': True, 'message': 'Contacto guardado correctamente'})
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Datos inválidos'}, status=400)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)

from django.http import JsonResponse, HttpResponseRedirect
from django.urls import reverse
from django.shortcuts import render
from django.contrib.auth.hashers import make_password  # Importa make_password
from rest_framework.decorators import api_view
from .models import Contact
import json

@api_view(['POST'])
def register_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name')
            email = data.get('email')
            username = data.get('username')
            password = data.get('password')

            if not all([name, email, username, password]):
                return JsonResponse({'success': False, 'error': 'Todos los campos son requeridos'}, status=400)

            if Contact.objects.filter(email=email).exists():
                return JsonResponse({'success': False, 'error': 'Este correo ya está registrado'}, status=400)
            if Contact.objects.filter(username=username).exists():
                return JsonResponse({'success': False, 'error': 'Este nombre de usuario ya está en uso'}, status=400)

            # Hashear la contraseña antes de guardarla
            hashed_password = make_password(password)
            contact = Contact(name=name, email=email, username=username, password=hashed_password)
            contact.save()

            return JsonResponse({'success': True, 'message': 'Usuario registrado correctamente'})
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Datos inválidos'}, status=400)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)

from django.contrib.auth.hashers import check_password  # Importa check_password

@api_view(['POST'])
def login_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')

            if not all([username, password]):
                return JsonResponse({'success': False, 'error': 'Usuario y contraseña son requeridos'}, status=400)

            try:
                user = Contact.objects.get(username=username)
                if check_password(password, user.password):  # Comparar la contraseña con el hash
                    request.session['user_id'] = user.id
                    return JsonResponse({'success': True, 'message': 'Inicio de sesión exitoso'})
                else:
                    return JsonResponse({'success': False, 'error': 'Contraseña incorrecta'}, status=400)
            except Contact.DoesNotExist:
                return JsonResponse({'success': False, 'error': 'Usuario no encontrado'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Datos inválidos'}, status=400)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)

def index(request):
    return render(request, 'frontend/index.html')

def inicio(request):
    return render(request, 'frontend/inicio.html')

def logout_user(request):
    if 'user_id' in request.session:
        del request.session['user_id']
    return HttpResponseRedirect(reverse('index'))