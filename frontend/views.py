from django.http import JsonResponse, HttpResponseRedirect
from django.urls import reverse
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework import generics
from django.contrib.auth.hashers import make_password, check_password
from django.db import transaction, IntegrityError
from .models import Contact, Proveedor
from .serializers import ContactSerializer, ProveedorSerializer
from rest_framework import generics
from clientes.models import Cliente
from clientes.serializers import ClienteSerializer

class ClientesListCreateView(generics.ListCreateAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer


class ContactListCreateView(generics.ListCreateAPIView):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

    def create(self, request, *args, **kwargs):
        print("Recibiendo solicitud POST para crear un contacto:", request.data)  # Depuración
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            print("Datos validados:", serializer.validated_data)  # Depuración
            self.perform_create(serializer)
            print("Contacto creado con ID:", serializer.instance.id)  # Depuración
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            print("Error al crear el contacto:", str(e))  # Depuración
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Vista para la página principal (GET)
def index(request):
    return render(request, 'frontend/index.html')

# Vista para la página de inicio (después de login)
def inicio(request):
    return render(request, 'frontend/inicio.html')

# Vista para cerrar sesión
def logout_user(request):
    if 'user_id' in request.session:
        del request.session['user_id']
    return HttpResponseRedirect(reverse('index'))

# Vista API para listar contactos
@api_view(['GET'])
def list_contacts(request):
    if request.method == 'GET':
        contacts = Contact.objects.all()
        serializer = ContactSerializer(contacts, many=True)
        return JsonResponse({'success': True, 'contacts': serializer.data})
    return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)

# Vista API para verificar el estado de autenticación
@api_view(['GET'])
def auth_status(request):
    if request.session.get('user_id'):
        try:
            user = Contact.objects.get(id=request.session['user_id'])
            return JsonResponse({'success': True, 'authenticated': True, 'username': user.name})  # Usar 'name' en lugar de 'username'
        except Contact.DoesNotExist:
            return JsonResponse({'success': False, 'authenticated': False, 'error': 'Usuario no encontrado'}, status=404)
    return JsonResponse({'success': True, 'authenticated': False})

# Vista API para registrar un usuario
@api_view(['POST'])
def register(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)

    try:
        name = request.data.get('name')
        email = request.data.get('email')
        username = request.data.get('username')
        password = request.data.get('password')

        print(f"Registrando usuario: name={name}, email={email}, username={username}")  # Depuración

        if not all([name, email, username, password]):
            return JsonResponse({'success': False, 'error': 'Todos los campos son obligatorios.'}, status=400)

        if Contact.objects.filter(email=email).exists():
            return JsonResponse({'success': False, 'error': 'Este correo ya está registrado.'}, status=400)

        if Contact.objects.filter(name=username).exists():
            return JsonResponse({'success': False, 'error': 'Este nombre de usuario ya está en uso.'}, status=400)

        with transaction.atomic():
            contact = Contact(
                name=name,
                email=email,
                message=username,  # Usamos 'message' para almacenar el username
                password=make_password(password),
            )
            contact.save()
            print("Usuario registrado con ID:", contact.id)  # Depuración

        return JsonResponse({'success': True, 'message': 'Usuario registrado exitosamente.'}, status=201)

    except IntegrityError:
        return JsonResponse({'success': False, 'error': 'El email o username ya está registrado.'}, status=400)
    except Exception as e:
        print("Error al registrar el usuario:", str(e))  # Depuración
        return JsonResponse({'success': False, 'error': str(e)}, status=500)
    
# Vista API para guardar un contacto (formulario de contacto)
@api_view(['POST'])
def save_contact(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)

    try:
        name = request.data.get('name')
        email = request.data.get('email')
        message = request.data.get('message')

        print(f"Guardando contacto: name={name}, email={email}, message={message}")  # Depuración

        if not all([name, email, message]):
            return JsonResponse({'success': False, 'error': 'Todos los campos son requeridos'}, status=400)

        with transaction.atomic():
            contact = Contact(name=name, email=email, message=message)
            contact.save()
            print("Contacto guardado con ID:", contact.id)  # Depuración

            saved_contact = Contact.objects.get(id=contact.id)
            if not saved_contact:
                raise Exception("El contacto no se encontró en la base de datos después de guardarlo")

        return JsonResponse({'success': True, 'message': 'Contacto guardado correctamente'}, status=201)

    except Exception as e:
        print("Error al guardar el contacto:", str(e))  # Depuración
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

# Vista API para iniciar sesión
@api_view(['POST'])
def login_user(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)

    try:
        username = request.data.get('username')
        password = request.data.get('password')

        print(f"Iniciando sesión: username={username}")  # Depuración

        if not all([username, password]):
            return JsonResponse({'success': False, 'error': 'Usuario y contraseña son requeridos'}, status=400)

        user = Contact.objects.get(message=username)  # Buscar por 'message' (donde se almacena el username)
        if check_password(password, user.password):
            request.session['user_id'] = user.id
            print("Sesión iniciada para usuario ID:", user.id)  # Depuración
            return JsonResponse({'success': True, 'message': 'Inicio de sesión exitoso'})
        else:
            return JsonResponse({'success': False, 'error': 'Contraseña incorrecta'}, status=400)

    except Contact.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Usuario no encontrado'}, status=400)
    except Exception as e:
        print("Error al iniciar sesión:", str(e))  # Depuración
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


# Vista para la API /api/Contacts/
class ContactListCreateView(generics.ListCreateAPIView):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

# Vista para la API /api/proveedores/
class ProveedoresListCreateView(generics.ListCreateAPIView):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer

# Vista para la API /api/clientes/

# Vista para actualizar o eliminar un proveedor
class ProveedorDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer

class ContactListCreateView(generics.ListCreateAPIView):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer