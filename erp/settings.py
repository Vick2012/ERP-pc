from pathlib import Path
import os

# Ruta base del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent

# Clave secreta (cámbiala en producción)
SECRET_KEY = 'django-insecure-d^hjn8u&xsv@f$$t86ip%3=09rf)l%d6wx%oq_qibu+u$vtkj5'

# Modo debug (desactiva en producción)
DEBUG = True

# Hosts permitidos (ajústalos en producción)
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# Aplicaciones instaladas
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',    # Para APIs
    'corsheaders',      # Para manejar CORS
    'frontend',         # Para conectar con frontend externo
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
        'DIRS': [os.path.join(BASE_DIR, 'frontend/templates')],
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
WSGI_APPLICATION = 'erp.wsgi.application'

# Base de datos PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'erp_logistica',
        'USER': 'erp_user',
        'PASSWORD': 'J@ir1017',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Archivos estáticos
STATIC_URL = '/static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'frontend/static')]

# Configuración de CSRF
CSRF_COOKIE_SECURE = False  # Cambia a True en producción con HTTPS
CSRF_COOKIE_HTTPONLY = False
CSRF_TRUSTED_ORIGINS = ['http://localhost:8000', 'http://127.0.0.1:8000']

# Configuración de CORS
CORS_ALLOW_ALL_ORIGINS = True  # Para desarrollo; en producción, usa CORS_ALLOWED_ORIGINS
# CORS_ALLOWED_ORIGINS = [
#     'http://localhost:8000',
#     'http://127.0.0.1:8000',
# ]

# Configuración de REST Framework
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # Permitir acceso sin autenticación para pruebas
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
}

# Internacionalización
LANGUAGE_CODE = 'es'
TIME_ZONE = 'America/Bogota'
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