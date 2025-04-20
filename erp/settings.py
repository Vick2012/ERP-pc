from pathlib import Path
import os

# Ruta base del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent

# Clave secreta (cámbiala en producción)
SECRET_KEY = 'django-insecure-d^hjn8u&xsv@f$$t86ip%3=09rf)l%d6wx%oq_qibu+u$vtkj5'

# Modo debug (desactiva en producción)
DEBUG = True

# Hosts permitidos (ajústalos en producción)
ALLOWED_HOSTS = ['localhost', '127.0.0.1']  # Agregado para desarrollo local

# Aplicaciones instaladas
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',    # Para APIs
    'frontend',       # Para conectar con frontend externo
    'proveedores',       # Módulo Proveedores
    'clientes',          # Módulo Clientes
]

# Middleware
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# URLs raíz
ROOT_URLCONF = 'erp.urls'

# Configuración de plantillas
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'frontend/templates')],  # Directorio de plantillas
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


# Configuración de WSGI (necesaria para el despliegue)
WSGI_APPLICATION = 'erp.wsgi.application'  # Agregado explícitamente


# Base de datos PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'erp_logistica',
        'USER': 'erp_user',
        'PASSWORD': 'J@ir1017',
        'HOST': 'localhost',
        'PORT': '5432',  # Asegúrate de que coincide con tu configuración de PostgreSQL
    }
}
# Archivos estáticos
STATIC_URL = '/static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'frontend/static')]  # Directorio de archivos estáticos

# Configuración de CORS (para desarrollo)
CORS_ALLOW_ALL_ORIGINS = True  # En producción, usa CORS_ALLOWED_ORIGINS

# Configuración de REST Framework
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # Para pruebas; en producción, ajusta según necesites
    ],
}

# Asegúrate de que DEBUG esté activado para ver errores detallados
DEBUG = True
# Configuración de Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticated'],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',  # Agregado para más opciones
    ],
}

# Configuración de CORS (ajústalos según tu frontend)
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]

# Internacionalización
LANGUAGE_CODE = 'es'  # Cambiado a español, ya que el proyecto está en español
TIME_ZONE = 'America/Bogota'  # Ajustado para Colombia (ajústalo según tu ubicación)
USE_I18N = True
USE_TZ = True

# Campo primario por defecto
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Configuración de autenticación (opcional, para mejorar la seguridad de contraseñas)
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]