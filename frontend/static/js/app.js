// Configuración de módulos para Proveedores, Clientes y Recursos Humanos
// Define la estructura de datos para cada módulo, incluyendo URLs de API, IDs de elementos HTML y campos de formulario
const CONFIG = {
    proveedores: {
        apiUrl: "/api/proveedores/",
        tableId: "tabla-proveedores",
        formId: "formulario-proveedor",
        fields: [
            { id: "nombre-proveedor", key: "nombre", required: true },
            { id: "contacto-proveedor", key: "contacto", required: true },
            { id: "direccion-proveedor", key: "direccion", required: false },
            { id: "telefono-proveedor", key: "telefono", required: false },
            { id: "email-proveedor", key: "email", required: false },
            { id: "tipo_proveedor", key: "tipo_proveedor", required: false },
        ],
        tableHeaders: ["ID", "Nombre", "Contacto", "Dirección", "Teléfono", "Email", "Tipo de Proveedor", "Acciones"],
        getRowData: (item) => [
            item.id,
            item.nombre,
            item.contacto,
            item.direccion || "Sin dirección",
            item.telefono || "Sin teléfono",
            item.email || "Sin email",
            item.tipo_proveedor || "Sin tipo",
        ],
        searchFields: ["nombre", "contacto", "direccion", "telefono", "email", "tipo_proveedor"],
    },
    clientes: {
        apiUrl: "/clientes/api/",
        tableId: "tabla-clientes",
        formId: "formulario-cliente",
        fields: [
            { id: "nombre-cliente", key: "nombre", required: true },
            { id: "contacto-cliente", key: "contacto", required: true },
            { id: "preferencias-cliente", key: "preferencias", required: false },
        ],
        tableHeaders: ["ID", "Nombre", "Contacto", "Preferencias", "Acciones"],
        getRowData: (item) => [
            item.id,
            item.nombre,
            item.contacto,
            item.preferencias || "Sin preferencias",
        ],
        searchFields: ["nombre", "contacto", "preferencias"],
    },
    recursos_humanos: {
        apiUrl: "/api/recursos_humanos/empleados/",
        tableId: "tabla-recursos_humanos",
        formId: "formulario-recursos_humanos",
        fields: [
            { id: "nombre-recursos_humanos", key: "nombre", required: true },
            { id: "tipo_documento-recursos_humanos", key: "tipo_documento", required: true },
            { id: "documento-recursos_humanos", key: "documento", required: true },
            { id: "fecha_ingreso-recursos_humanos", key: "fecha_ingreso", required: true },
            { id: "cargo-recursos_humanos", key: "cargo", required: true },
            { id: "salario-recursos_humanos", key: "salario", required: true },
            { id: "area-recursos_humanos", key: "area", required: true },
            { id: "telefono-recursos_humanos", key: "telefono", required: true },
            { id: "correo-recursos_humanos", key: "correo", required: true },
            { id: "contrato-recursos_humanos", key: "contrato", required: true },
            { id: "contacto-recursos_humanos", key: "contacto", required: false },
        ],
        tableHeaders: ["ID", "Nombre", "Tipo Documento", "Documento", "Ingreso", "Cargo", "Salario", "Área", "Teléfono", "Correo", "Contrato", "Contacto", "Acciones"],
        getRowData: (item) => [
            item.id,
            item.nombre,
            item.tipo_documento,
            item.documento,
            item.fecha_ingreso,
            item.cargo,
            item.salario,
            item.area,
            item.telefono,
            item.correo,
            item.contrato,
            item.contacto || "Sin contacto",
        ],
        searchFields: ["nombre", "tipo_documento", "documento", "cargo", "area", "telefono", "correo", "contrato", "contacto"],
    },
    ausentismos: {
        apiUrl: "/api/ausentismos/",
        tableId: "tabla-ausentismos",
        formId: "form-ausentismos",
        fields: [
            { id: "ausentismos-empleado", key: "empleado", required: true },
            { id: "ausentismos-fecha", key: "fecha", required: true },
            { id: "ausentismos-tipo", key: "tipo", required: true },
            { id: "ausentismos-duracion", key: "duracion_horas", required: true },
            { id: "ausentismos-motivo", key: "motivo", required: false },
            { id: "horas-extra-diurnas", key: "horas_extra_diurnas", required: false },
            { id: "horas-extra-nocturnas", key: "horas_extra_nocturnas", required: false },
            { id: "recargos-nocturnos", key: "recargos_nocturnos", required: false },
            { id: "horas-extra-dominicales", key: "horas_extra_dominicales", required: false }
        ],
        tableHeaders: ["Documento", "Tipo", "Fecha", "Duración", "Motivo", "Acciones"]
    },
};

// Sistema de almacenamiento seguro que maneja múltiples métodos
const StorageManager = {
    // Verifica el mejor método de almacenamiento disponible
    checkStorageMethod() {
        try {
            // Intenta usar cookies primero
            document.cookie = "testcookie=1";
            if (document.cookie.indexOf("testcookie") !== -1) {
                document.cookie = "testcookie=1;expires=Thu, 01 Jan 1970 00:00:01 GMT";
                return 'cookie';
            }
        } catch (e) {
            console.log('Cookies no disponibles, probando localStorage...');
        }

        try {
            // Intenta usar localStorage
            localStorage.setItem('testlocal', '1');
            localStorage.removeItem('testlocal');
            return 'localStorage';
        } catch (e) {
            console.log('localStorage no disponible, probando sessionStorage...');
        }

        try {
            // Intenta usar sessionStorage como última opción
            sessionStorage.setItem('testsession', '1');
            sessionStorage.removeItem('testsession');
            return 'sessionStorage';
        } catch (e) {
            console.log('Ningún método de almacenamiento disponible');
            return 'memory';
        }
    },

    // Almacenamiento en memoria como último recurso
    memoryStorage: new Map(),

    // Guarda un valor usando el mejor método disponible
    setItem(key, value) {
        const method = this.checkStorageMethod();
        try {
            switch (method) {
                case 'cookie':
                    document.cookie = `${key}=${value};path=/;max-age=3600`;
                    break;
                case 'localStorage':
                    localStorage.setItem(key, value);
                    break;
                case 'sessionStorage':
                    sessionStorage.setItem(key, value);
                    break;
                case 'memory':
                    this.memoryStorage.set(key, value);
                    break;
            }
            return true;
        } catch (e) {
            console.error('Error al guardar datos:', e);
            return false;
        }
    },

    // Obtiene un valor usando el mejor método disponible
    getItem(key) {
        const method = this.checkStorageMethod();
        try {
            switch (method) {
                case 'cookie':
                    const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
                    return match ? match[2] : null;
                case 'localStorage':
                    return localStorage.getItem(key);
                case 'sessionStorage':
                    return sessionStorage.getItem(key);
                case 'memory':
                    return this.memoryStorage.get(key) || null;
            }
        } catch (e) {
            console.error('Error al obtener datos:', e);
            return null;
        }
    },

    // Elimina un valor usando el mejor método disponible
    removeItem(key) {
        const method = this.checkStorageMethod();
        try {
            switch (method) {
                case 'cookie':
                    document.cookie = `${key}=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT`;
                    break;
                case 'localStorage':
                    localStorage.removeItem(key);
                    break;
                case 'sessionStorage':
                    sessionStorage.removeItem(key);
                    break;
                case 'memory':
                    this.memoryStorage.delete(key);
                    break;
            }
            return true;
        } catch (e) {
            console.error('Error al eliminar datos:', e);
            return false;
        }
    }
};

// Utilidades para manejar solicitudes HTTP, tokens CSRF y mensajes al usuario
const Utils = {
    // Obtiene el token CSRF para solicitudes seguras
    getCsrfToken() {
        try {
            // Intentar obtener el token del nuevo sistema de almacenamiento
            let token = StorageManager.getItem('csrftoken');

            if (!token) {
                // Si no está en el almacenamiento, intentar obtenerlo del DOM
                token = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

                if (token) {
                    // Guardar el token para futuros usos
                    StorageManager.setItem('csrftoken', token);
                } else {
                    throw new Error("Token CSRF no encontrado.");
                }
            }

            return token;
        } catch (error) {
            console.error('Error al obtener token CSRF:', error);
            throw error;
        }
    },

    // Realiza solicitudes HTTP a la API con manejo de errores mejorado
    async makeRequest(url, method = "GET", data = null) {
        console.log(`=== Iniciando solicitud ${method} a ${url} ===`);

        try {
        const headers = { 
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        };
        
        if (["POST", "PUT", "DELETE"].includes(method)) {
            headers["X-CSRFToken"] = this.getCsrfToken();
        }
        
        // Agregar timestamp para evitar caché
        const urlWithTimestamp = url + (url.includes('?') ? '&' : '?') + '_=' + new Date().getTime();
            console.log('URL con timestamp:', urlWithTimestamp);
        
        const options = { 
            method, 
            headers,
                cache: 'no-store',
                signal: AbortSignal.timeout(30000) // 30 second timeout
        };
        
            if (data) {
                options.body = JSON.stringify(data);
                console.log('Datos enviados:', data);
            }
        
            console.log('Opciones de la solicitud:', options);

            const response = await fetch(urlWithTimestamp, options);
            console.log('Respuesta recibida:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });

            if (!response.ok) {
                let errorMessage;
                try {
                    const errorData = await response.text();
                    console.log('Texto de error recibido:', errorData);

                    try {
                        const jsonError = JSON.parse(errorData);
                        errorMessage = jsonError.error || jsonError.detail || `Error ${response.status}: ${response.statusText}`;
                    } catch {
                        errorMessage = errorData || `Error ${response.status}: ${response.statusText}`;
                    }
                } catch (e) {
                    errorMessage = `Error ${response.status}: ${response.statusText}`;
                }

                throw new Error(errorMessage);
            }

            // Solo parsear JSON si la respuesta tiene contenido
            if (method === "DELETE" && response.status === 204) {
                console.log('Solicitud DELETE completada exitosamente');
                return null;
            }

            const responseData = await response.json();
            console.log('Datos recibidos:', responseData);
            console.log('=== Solicitud completada exitosamente ===');
            return responseData;

        } catch (error) {
            console.error('Error en la solicitud:', error);
            if (error.name === 'TimeoutError') {
                throw new Error('La solicitud tomó demasiado tiempo en completarse');
            }
            throw new Error(`Error en la solicitud a ${url}: ${error.message}`);
        }
    },

    // Muestra mensajes al usuario con mejor formato
    showMessage(message, type = 'error') {
        const types = {
            error: '🔴',
            success: '✅',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const icon = types[type] || types.info;
        alert(`${icon} ${message}`);
    },
};

// Gestión de entidades (empleados, proveedores, clientes, ausentismos, liquidaciones)
const EntityManager = {
    // Carga datos de la API y los renderiza en la tabla correspondiente
    async loadData(tipo) {
        try {
            console.log(`Cargando datos de ${tipo}...`);
            console.log('URL de la API:', CONFIG[tipo].apiUrl);
            
            // Verificar que la tabla existe
            const tabla = document.getElementById(CONFIG[tipo].tableId);
            if (!tabla) {
                console.error(`No se encontró la tabla para ${tipo}`, CONFIG[tipo].tableId);
                return;
            }

            // Mostrar indicador de carga
            const tbody = tabla.querySelector("tbody");
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="${CONFIG[tipo].tableHeaders.length}" class="text-center">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Cargando...</span>
                            </div>
                        </td>
                    </tr>
                `;
            }

            // Realizar la petición a la API
            console.log('Realizando petición a:', CONFIG[tipo].apiUrl);
            const data = await Utils.makeRequest(CONFIG[tipo].apiUrl);
            console.log(`Datos recibidos de ${tipo}:`, data);
            
            // Asegurarse de que la tabla aún existe antes de actualizar
            if (!document.getElementById(CONFIG[tipo].tableId)) {
                console.log('La tabla ya no existe en el DOM, cancelando actualización');
                return;
            }

            this.renderTable(tipo, data);
        } catch (error) {
            console.error(`Error al cargar ${tipo}:`, error);
            const tabla = document.getElementById(CONFIG[tipo].tableId);
            if (tabla) {
                const tbody = tabla.querySelector("tbody");
                if (tbody) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="${CONFIG[tipo].tableHeaders.length}" class="text-center text-danger">
                                <i class="fas fa-exclamation-circle me-2"></i>
                                Error al cargar los datos: ${error.message}
                            </td>
                        </tr>
                    `;
                }
            }
            Utils.showMessage(`Error al cargar ${tipo}: ${error.message}`);
        }
    },

    // Renderiza los datos en la tabla correspondiente
    renderTable(tipo, data) {
        const tabla = document.getElementById(CONFIG[tipo].tableId);
        if (!tabla) return;

        const tbody = tabla.querySelector("tbody");
        if (!tbody) return;

        tbody.innerHTML = '';

        if (!data || data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="${CONFIG[tipo].tableHeaders.length}" class="text-center">
                        No hay datos disponibles
                    </td>
                </tr>
            `;
            return;
        }

        data.forEach(item => {
            const row = document.createElement('tr');
            const rowData = CONFIG[tipo].getRowData(item);
            
            rowData.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                row.appendChild(td);
            });

            // Agregar botones de acción
            const actionsTd = document.createElement('td');
            actionsTd.innerHTML = `
                <button class="btn btn-sm btn-primary edit-btn" data-id="${item.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${item.id}">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            `;
            row.appendChild(actionsTd);

            tbody.appendChild(row);
        });

        // Configurar eventos para los botones de acción
        this.setupActionButtons(tipo, tbody);
    },

    // Configura los eventos para los botones de acción
    setupActionButtons(tipo, tbody) {
        tbody.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                try {
                    const data = await Utils.makeRequest(`${CONFIG[tipo].apiUrl}${id}/`);
                    this.populateForm(tipo, data);
        } catch (error) {
                    console.error(`Error al cargar datos para editar ${tipo}:`, error);
                    Utils.showMessage(`Error al cargar datos: ${error.message}`);
                }
            });
        });

        tbody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                if (confirm('¿Está seguro de que desea eliminar este registro?')) {
                    try {
                        await Utils.makeRequest(`${CONFIG[tipo].apiUrl}${id}/`, 'DELETE');
                        await this.loadData(tipo);
                        Utils.showMessage('Registro eliminado exitosamente');
        } catch (error) {
            console.error(`Error al eliminar ${tipo}:`, error);
                        Utils.showMessage(`Error al eliminar: ${error.message}`);
                    }
                }
            });
        });
    },

    // Guarda una entidad (crear o actualizar)
    async saveEntity(tipo) {
        try {
            const form = document.getElementById(CONFIG[tipo].formId);
            if (!form) return;

            const formData = new FormData(form);
            const data = {};
            CONFIG[tipo].fields.forEach(field => {
                data[field.key] = formData.get(field.id);
            });

            const method = form.dataset.id ? 'PUT' : 'POST';
            const url = form.dataset.id 
                ? `${CONFIG[tipo].apiUrl}${form.dataset.id}/`
                : CONFIG[tipo].apiUrl;

            await Utils.makeRequest(url, method, data);
            await this.loadData(tipo);
            form.reset();
            delete form.dataset.id;
            Utils.showMessage('Registro guardado exitosamente');
        } catch (error) {
            console.error(`Error al guardar ${tipo}:`, error);
            Utils.showMessage(`Error al guardar: ${error.message}`);
        }
    },

    // Popula el formulario con los datos para edición
    populateForm(tipo, data) {
        const form = document.getElementById(CONFIG[tipo].formId);
        if (!form) return;

        CONFIG[tipo].fields.forEach(field => {
            const input = document.getElementById(field.id);
            if (input) {
                input.value = data[field.key] || '';
            }
        });

        form.dataset.id = data.id;
    },

    // Función para buscar datos en las tablas
    searchData(tipo) {
        const searchInput = document.getElementById(`search-${tipo}`);
        if (!searchInput) return;

        const searchTerm = searchInput.value.toLowerCase();
        const tabla = document.getElementById(CONFIG[tipo].tableId);
        if (!tabla) return;

        const tbody = tabla.querySelector('tbody');
        if (!tbody) return;

        const rows = tbody.querySelectorAll('tr');
        rows.forEach(row => {
            const text = Array.from(row.cells)
                .map(cell => cell.textContent.toLowerCase())
                .join(' ');
            
            if (text.includes(searchTerm)) {
                row.style.display = '';
                } else {
                row.style.display = 'none';
                }
            });
        }
};

// Manejo de autenticación y eventos de login/registro/contacto
const AuthManager = {
    // Verifica si el usuario está autenticado para permitir acceso a ciertas páginas
    async checkAuth(url) {
        const response = await fetch('/api/auth/status/', { method: 'GET', headers: { 'Content-Type': 'application/json' } }); // Verifica el estado de autenticación
        const data = await response.json(); // Parsea la respuesta como JSON
        if (data.authenticated) window.location.href = url; // Si está autenticado, redirige a la URL especificada
        else {
            Utils.showMessage('Inicia sesión para acceder.'); // Muestra un mensaje si no está autenticado
            new bootstrap.Modal(document.getElementById('loginModal')).show(); // Muestra el modal de inicio de sesión
        }
    },

    // Verifica el estado de autenticación y ajusta la visibilidad de botones
    async verifyAuth() {
        const response = await fetch('/api/auth/status/').catch(console.error); // Verifica el estado de autenticación
        if (response?.ok) {
            const data = await response.json(); // Parsea la respuesta como JSON
            ['buy-erp-btn', 'login-btn', 'register-btn', 'logout-btn'].forEach(id => { // Itera sobre los botones de autenticación
                const el = document.getElementById(id); // Busca el botón en el DOM
                if (el) el.style.display = data.authenticated ? (id === 'buy-erp-btn' || id === 'logout-btn' ? 'inline-block' : 'none') : (id === 'login-btn' || id === 'register-btn' ? 'inline-block' : 'none'); // Ajusta la visibilidad según el estado de autenticación
            });
        }
    },

    // Muestra un modal (login o registro)
    showModal(modalId) {
        new bootstrap.Modal(document.getElementById(modalId)).show(); // Muestra el modal especificado (loginModal o registerModal)
    },

    // Maneja el inicio de sesión del usuario
    async login() {
        const username = document.getElementById('username').value; // Obtiene el nombre de usuario
        const password = document.getElementById('password').value; // Obtiene la contraseña
        if (!username || !password) return Utils.showMessage('Completa todos los campos.'); // Verifica que los campos no estén vacíos
        const response = await fetch('/api/auth/login/', { // Realiza la solicitud de inicio de sesión
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': Utils.getCsrfToken() },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json(); // Parsea la respuesta como JSON
        if (data.success) { // Si el inicio de sesión es exitoso
            ['login-btn', 'register-btn', 'logout-btn', 'buy-erp-btn'].forEach(id => { // Ajusta la visibilidad de los botones
                const el = document.getElementById(id);
                if (el) el.style.display = id === 'logout-btn' || id === 'buy-erp-btn' ? 'inline-block' : 'none';
            });
            bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide(); // Cierra el modal de inicio de sesión
            this.verifyAuth(); // Verifica el estado de autenticación
        } else Utils.showMessage('Error al iniciar sesión: ' + (data.error || 'Credenciales inválidas')); // Muestra un mensaje de error si falla
    },

    // Maneja el registro de un nuevo usuario
    async register() {
        const [name, email, username, password] = ['register-name', 'register-email', 'register-username', 'register-password']
            .map(id => document.getElementById(id).value.trim()); // Obtiene los datos del formulario de registro
        const errorDiv = document.getElementById('register-error'); // Busca el elemento para mostrar errores (no usado en este caso)
        if (!name || !email || !username || !password) return Utils.showMessage('Completa todos los campos.'); // Verifica que los campos no estén vacíos
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Utils.showMessage('Correo inválido.'); // Valida el formato del correo
        if (password.length < 8) return Utils.showMessage('Contraseña debe tener 8+ caracteres.'); // Valida la longitud de la contraseña
        if (username.length < 3) return Utils.showMessage('Usuario debe tener 3+ caracteres.'); // Valida la longitud del nombre de usuario
        const response = await fetch('/api/auth/register/', { // Realiza la solicitud de registro
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': Utils.getCsrfToken() },
            body: JSON.stringify({ name, email, username, password })
        });
        const data = await response.json(); // Parsea la respuesta como JSON
        if (data.success) { // Si el registro es exitoso
            Utils.showMessage('Usuario registrado. Inicia sesión.', 'success'); // Muestra un mensaje de éxito
            setTimeout(() => { // Cierra el modal después de 2 segundos
                bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
                document.getElementById('register-form').reset();
            }, 2000);
        } else Utils.showMessage('Error al registrar: ' + (data.error || 'Error desconocido')); // Muestra un mensaje de error si falla
    },

    // Envía un mensaje de contacto desde el formulario de contacto
    async sendContact() {
        const [name, email, message] = ['contact-name', 'contact-email', 'contact-message']
            .map(id => document.getElementById(id).value); // Obtiene los datos del formulario de contacto
        if (!name || !email || !message) return Utils.showMessage('Completa todos los campos.'); // Verifica que los campos no estén vacíos
        const response = await fetch('/api/auth/save-contact/', { // Realiza la solicitud para guardar el mensaje
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': Utils.getCsrfToken() },
            body: JSON.stringify({ name, email, message })
        });
        const data = await response.json(); // Parsea la respuesta como JSON
        if (data.success) { // Si el mensaje se envía correctamente
            Utils.showMessage('Mensaje enviado. Te contactaremos pronto.', 'success'); // Muestra un mensaje de éxito
            document.getElementById('contact-form').reset(); // Limpia el formulario de contacto
        } else Utils.showMessage('Error al enviar: ' + (data.error || 'Error desconocido')); // Muestra un mensaje de error si falla
    },
};

// Funciones auxiliares para el manejo de nómina
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-CO', options);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Constantes para el cálculo de nómina
const NOMINA_CONFIG = {
    HORAS_MES: 240,
    HORAS_QUINCENA: 120,
    FACTORES: {
        EXTRA_DIURNA: 1.25,
        EXTRA_NOCTURNA: 1.75,
        RECARGO_NOCTURNO: 0.35,
        FESTIVO_DIURNO: 1.75,
        FESTIVO_NOCTURNO: 2.1,
        EXTRA_FESTIVO_DIURNO: 2.0,
        EXTRA_FESTIVO_NOCTURNO: 2.5
    },
    DEDUCCIONES: {
        SALUD: 0.04,
        PENSION: 0.04
    }
};

/**
 * Carga las dependencias necesarias para el PDF
 */
async function loadDependencies() {
    try {
        // Verificar si jsPDF y QRious ya están cargados
        if (typeof window.jspdf !== 'undefined' &&
            typeof window.jspdf.jsPDF !== 'undefined' &&
            typeof window.QRious !== 'undefined') {
            return true;
        }

        // Cargar jsPDF si es necesario
        if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                script.onload = resolve;
                script.onerror = () => reject(new Error('Error al cargar jsPDF'));
                document.head.appendChild(script);
            });
        }

        // Cargar QRious si es necesario
        if (typeof window.QRious === 'undefined') {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
                script.onload = resolve;
                script.onerror = () => reject(new Error('Error al cargar QRious'));
                document.head.appendChild(script);
            });
        }

        // Verificar que ambas bibliotecas se cargaron correctamente
        if (typeof window.jspdf === 'undefined' ||
            typeof window.jspdf.jsPDF === 'undefined' ||
            typeof window.QRious === 'undefined') {
            throw new Error('No se pudieron cargar todas las dependencias necesarias');
        }

        return true;
    } catch (error) {
        throw new Error('Error al cargar dependencias: ' + error.message);
    }
}

// Función para cargar datos de nómina
async function cargarDatosNomina(documento) {
    try {
        if (!documento) {
            console.error('Documento no proporcionado');
            Utils.showMessage('Por favor ingrese un documento válido');
            return false;
        }

        console.log('=== Inicio de carga de datos ===');
        console.log('Documento a buscar:', documento);

        // Verificar que los elementos necesarios existen
        const elementosRequeridos = {
            'nomina-empleado': 'Contenedor de información del empleado',
            'nomina-empleado-data': 'Campo oculto para datos del empleado',
            'empleado-id-nomina': 'Campo oculto para ID del empleado',
            'info-empleado': 'Sección de información del empleado'
        };

        for (const [id, descripcion] of Object.entries(elementosRequeridos)) {
            const elemento = document.getElementById(id);
            if (!elemento) {
                console.error(`Elemento ${id} (${descripcion}) no encontrado en el DOM`);
                Utils.showMessage(`Error: No se encontró el elemento ${id}. Por favor recargue la página.`);
                return false;
            }
        }

        // Mostrar indicador de carga
        const nominaEmpleado = document.getElementById('nomina-empleado');
        nominaEmpleado.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <div class="mt-2">Buscando empleado...</div>
            </div>
        `;

        // Obtener datos del empleado desde la API
        console.log('Realizando petición a la API:', '/api/recursos_humanos/empleados/');
        const empleados = await Utils.makeRequest('/api/recursos_humanos/empleados/');
        console.log('Respuesta de la API:', empleados);

        if (!empleados || (Array.isArray(empleados) && empleados.length === 0)) {
            console.log('No se encontraron datos del empleado');
            nominaEmpleado.innerHTML = '<div class="alert alert-warning">No se encontró el empleado</div>';
            document.getElementById('info-empleado').classList.add('d-none');
            return false;
        }

        const empleado = empleados.find(e => e.documento === documento);
        console.log('Empleado encontrado:', empleado);

        if (!empleado) {
            console.log('No se encontró empleado con el documento:', documento);
            nominaEmpleado.innerHTML = '<div class="alert alert-warning">No se encontró empleado con el documento especificado</div>';
            document.getElementById('info-empleado').classList.add('d-none');
            return false;
        }

        // Guardar datos en campos ocultos
        const empleadoIdNomina = document.getElementById('empleado-id-nomina');
        const nominaEmpleadoData = document.getElementById('nomina-empleado-data');

        empleadoIdNomina.value = empleado.id;
        nominaEmpleadoData.value = JSON.stringify(empleado);
        console.log('Datos guardados en campos ocultos:', {
            'empleado-id-nomina': empleado.id,
            'nomina-empleado-data': empleado
        });

        // Actualizar información del empleado
        nominaEmpleado.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title mb-4">Información del Empleado</h5>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="fw-bold">Nombre:</label>
                                <div class="form-control-plaintext">${empleado.nombre}</div>
                            </div>
                            <div class="mb-3">
                                <label class="fw-bold">Documento:</label>
                                <div class="form-control-plaintext">${empleado.documento}</div>
                            </div>
                            <div class="mb-3">
                                <label class="fw-bold">Cargo:</label>
                                <div class="form-control-plaintext">${empleado.cargo}</div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="fw-bold">Área:</label>
                                <div class="form-control-plaintext">${empleado.area}</div>
                            </div>
                            <div class="mb-3">
                                <label class="fw-bold">Salario Base:</label>
                                <div class="form-control-plaintext">${formatCurrency(empleado.salario)}</div>
                            </div>
                            <div class="mb-3">
                                <label class="fw-bold">Fecha de Ingreso:</label>
                                <div class="form-control-plaintext">${empleado.fecha_ingreso || 'No especificada'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Mostrar sección de información
        document.getElementById('info-empleado').classList.remove('d-none');

        // Calcular y mostrar valores
        const periodoTipo = document.getElementById('nomina-periodo-tipo')?.value || 'Quincenal';
        const salarioCalculado = periodoTipo === 'Quincenal' ? empleado.salario / 2 : empleado.salario;
        const deducciones = salarioCalculado * 0.08; // 8% de deducciones (4% salud + 4% pensión)
        const salarioNeto = salarioCalculado - deducciones;

        // Actualizar resumen de nómina
        const elementosResumen = {
            'nomina-salario-base-resumen': formatCurrency(salarioCalculado),
            'nomina-bonificaciones': formatCurrency(0),
            'nomina-deducciones': formatCurrency(deducciones),
            'nomina-salario-neto': formatCurrency(salarioNeto)
        };

        for (const [id, valor] of Object.entries(elementosResumen)) {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = valor;
            } else {
                console.warn(`Elemento ${id} no encontrado para actualizar valor`);
            }
        }

        // Habilitar botones
        const generarPdfBtn = document.getElementById('generar-pdf');
        if (generarPdfBtn) {
            generarPdfBtn.disabled = false;
        }

        console.log('=== Carga de datos completada exitosamente ===');
        return true;
    } catch (error) {
        console.error('Error detallado al cargar datos de nómina:', error);
        const nominaEmpleado = document.getElementById('nomina-empleado');
        if (nominaEmpleado) {
            nominaEmpleado.innerHTML = `
                <div class="alert alert-danger">
                    <strong>Error al cargar datos:</strong><br>
                    ${error.message}
                </div>
            `;
        }
        return false;
    }
}

// Función para inicializar el input de documento
function initDocumentoInput(documentoInput) {
    if (!documentoInput) return;

    let typingTimer;
    const doneTypingInterval = 300; // 300ms de espera

    const doneTyping = async () => {
        const documento = documentoInput.value.trim();
        if (documento.length >= 5) {
            console.log('Iniciando búsqueda de empleado:', documento);
            await cargarDatosNomina(documento);
        } else {
            // Ocultar secciones si el documento es muy corto
            document.getElementById('info-empleado').classList.add('d-none');
            document.getElementById('nomina-resumen').classList.add('d-none');
        }
    };

    // Event listener para el input con debounce
    documentoInput.addEventListener('input', (e) => {
        console.log('Input detectado:', e.target.value);
        clearTimeout(typingTimer);
        typingTimer = setTimeout(doneTyping, doneTypingInterval);
    });

    // Event listener para la tecla Enter
    documentoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            clearTimeout(typingTimer);
            doneTyping();
        }
    });

    // Event listener para el botón de búsqueda
    const buscarBtn = document.getElementById('buscar-empleado');
    if (buscarBtn) {
        buscarBtn.addEventListener('click', () => {
            clearTimeout(typingTimer);
            doneTyping();
        });
    }

    // Si ya hay un valor en el campo, intentar cargar los datos
    if (documentoInput.value.trim().length >= 5) {
        doneTyping();
    }
}

/**
 * Calcula el valor de las horas extras
 */
function calcularValorHorasExtras(salarioBase, horasExtras) {
    const valorHoraNormal = salarioBase / NOMINA_CONFIG.HORAS_MES;
    
    return {
        diurnas: horasExtras.horas_extra_diurnas * valorHoraNormal * NOMINA_CONFIG.FACTORES.EXTRA_DIURNA,
        nocturnas: horasExtras.horas_extra_nocturnas * valorHoraNormal * NOMINA_CONFIG.FACTORES.EXTRA_NOCTURNA,
        recargos: horasExtras.recargos_nocturnos * valorHoraNormal * NOMINA_CONFIG.FACTORES.RECARGO_NOCTURNO,
        dominicales: horasExtras.horas_extra_dominicales * valorHoraNormal * NOMINA_CONFIG.FACTORES.EXTRA_FESTIVO_DIURNO
    };
}

/**
 * Calcula el valor de los ausentismos
 */
function calcularValorAusentismos(salarioBase, horasAusentismo) {
    const valorHoraNormal = salarioBase / NOMINA_CONFIG.HORAS_MES;
    return horasAusentismo * valorHoraNormal;
}

/**
 * Obtiene los ausentismos y horas extras para un período
 */
async function obtenerRegistrosPeriodo(empleadoId, fechaInicio, fechaFin) {
    try {
        const registros = await Utils.makeRequest(`${CONFIG.ausentismos.apiUrl}?empleado=${empleadoId}&fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
        
        const resultado = {
            ausentismos: 0,
            horas_extras: {
                horas_extra_diurnas: 0,
                horas_extra_nocturnas: 0,
                recargos_nocturnos: 0,
                horas_extra_dominicales: 0
            }
        };

        registros.forEach(registro => {
            if (registro.tipo === 'ausentismo') {
                resultado.ausentismos += parseFloat(registro.duracion_horas);
            } else if (registro.tipo === 'horas_extras') {
                resultado.horas_extras.horas_extra_diurnas += parseFloat(registro.horas_extra_diurnas || 0);
                resultado.horas_extras.horas_extra_nocturnas += parseFloat(registro.horas_extra_nocturnas || 0);
                resultado.horas_extras.recargos_nocturnos += parseFloat(registro.recargos_nocturnos || 0);
                resultado.horas_extras.horas_extra_dominicales += parseFloat(registro.horas_extra_dominicales || 0);
            }
        });

        return resultado;
    } catch (error) {
        console.error('Error al obtener registros del período:', error);
        throw error;
    }
}

// Función para calcular la nómina
async function calcularNomina() {
    try {
        // Validar que haya un empleado seleccionado
        const empleadoData = document.getElementById('nomina-empleado-data')?.value;
        if (!empleadoData) {
            Utils.showMessage('Por favor seleccione un empleado');
                return false;
            }

        const empleado = JSON.parse(empleadoData);
        const periodoTipo = document.getElementById('nomina-periodo-tipo').value;
        const periodoInicio = document.getElementById('nomina-periodo-inicio').value;
        const periodoFin = document.getElementById('nomina-periodo-fin').value;

        if (!periodoInicio || !periodoFin) {
            Utils.showMessage('Por favor seleccione el período de nómina');
            return false;
        }

        // Calcular salario base según el periodo
        const salarioBase = parseFloat(empleado.salario);
        const salarioPeriodo = periodoTipo === 'Quincenal' ? salarioBase / 2 : salarioBase;

        // Obtener ausentismos y horas extras del período
        const registros = await obtenerRegistrosPeriodo(empleado.id, periodoInicio, periodoFin);
        
        // Calcular deducciones por ausentismos
        const valorAusentismos = calcularValorAusentismos(salarioPeriodo, registros.ausentismos);
        
        // Calcular valor de horas extras
        const valorHorasExtras = calcularValorHorasExtras(salarioPeriodo, registros.horas_extras);
        const totalHorasExtras = Object.values(valorHorasExtras).reduce((a, b) => a + b, 0);

        // Calcular deducciones (4% salud, 4% pensión)
        const deducciones = salarioPeriodo * 0.08 + valorAusentismos;

        // Calcular salario neto
        const salarioNeto = salarioPeriodo + totalHorasExtras - deducciones;

        // Actualizar la interfaz
        document.getElementById('nomina-salario-base-resumen').textContent = formatCurrency(salarioPeriodo);
        document.getElementById('nomina-bonificaciones').textContent = formatCurrency(totalHorasExtras);
        document.getElementById('nomina-deducciones').textContent = formatCurrency(deducciones);
        document.getElementById('nomina-salario-neto').textContent = formatCurrency(salarioNeto);

        // Mostrar detalles de ausentismos y horas extras
        const detallesContainer = document.getElementById('detalles-nomina');
        if (detallesContainer) {
            detallesContainer.innerHTML = `
                <div class="alert alert-info mt-3">
                    <h6 class="alert-heading">Detalles del período:</h6>
                    <div class="row">
                        <div class="col-md-6">
                            <strong>Ausentismos:</strong>
                            <ul>
                                <li>Total horas: ${registros.ausentismos}</li>
                                <li>Valor: ${formatCurrency(valorAusentismos)}</li>
                            </ul>
                        </div>
                        <div class="col-md-6">
                            <strong>Horas Extras:</strong>
                            <ul>
                                <li>Diurnas (25%): ${registros.horas_extras.horas_extra_diurnas}h - ${formatCurrency(valorHorasExtras.diurnas)}</li>
                                <li>Nocturnas (75%): ${registros.horas_extras.horas_extra_nocturnas}h - ${formatCurrency(valorHorasExtras.nocturnas)}</li>
                                <li>Recargo Nocturno (35%): ${registros.horas_extras.recargos_nocturnos}h - ${formatCurrency(valorHorasExtras.recargos)}</li>
                                <li>Dominicales/Festivos (100%): ${registros.horas_extras.horas_extra_dominicales}h - ${formatCurrency(valorHorasExtras.dominicales)}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        }

        // Habilitar el botón de generar PDF
        const generarPdfBtn = document.getElementById('generar-pdf');
        if (generarPdfBtn) {
            generarPdfBtn.disabled = false;
        }

        Utils.showMessage('Nómina calculada exitosamente', 'success');
        return true;
    } catch (error) {
        console.error('Error al calcular nómina:', error);
        Utils.showMessage('Error al calcular nómina: ' + error.message);
        return false;
    }
}

/**
 * Control de debounce para evitar múltiples clics
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Genera el PDF del desprendible
 */
async function generarDesprendiblePDF() {
    try {
        // Verificar que tengamos los datos necesarios
        verificarDatosNecesarios();

        const empleadoData = document.getElementById('nomina-empleado-data')?.value;
        if (!empleadoData) {
            throw new Error('No hay datos del empleado disponibles');
        }

        const empleado = JSON.parse(empleadoData);
        const periodoInicio = document.getElementById('nomina-periodo-inicio')?.value;
        const periodoFin = document.getElementById('nomina-periodo-fin')?.value;
        const salarioBase = document.getElementById('nomina-salario-base-resumen')?.textContent;
        const bonificaciones = document.getElementById('nomina-bonificaciones')?.textContent;
        const deducciones = document.getElementById('nomina-deducciones')?.textContent;
        const salarioNeto = document.getElementById('nomina-salario-neto')?.textContent;

        // Crear nuevo documento PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'letter'
        });

        // Cargar y agregar el logo
        const logoImg = document.querySelector('img[src="/static/img/logo.png"]');
        if (logoImg) {
            doc.addImage(logoImg, 'PNG', 150, 10, 40, 40);
        }

        // Generar el texto para el QR
        const textoQR = generarTextoQR(empleado, periodoInicio, periodoFin, salarioNeto);

        // Generar y agregar código QR
        const qr = new QRious({
            value: textoQR,
            size: 250, // Tamaño fijo para el QR (para buena calidad)
            level: 'H' // Alta corrección de errores para mejor lectura
        });
        const qrDataUrl = qr.toDataURL();
        
        // Calcular dimensiones para mantener el QR legible
        const qrSize = 35; // Tamaño fijo en el PDF (en mm, igual que en CSS)
        doc.addImage(qrDataUrl, 'PNG', 20, 15, qrSize, qrSize); // Mantener el mismo tamaño que en el CSS (35mm)

        // Configurar fuentes y estilos
        doc.setFont('helvetica');
        doc.setFontSize(16);

        // Agregar encabezado (ajustado para el nuevo tamaño del QR)
        doc.setTextColor(0, 0, 139); // Azul oscuro
        doc.text('DESPRENDIBLE DE NÓMINA', 105, 30, { align: 'center' });
        
        // Información de la empresa (ajustada para el nuevo tamaño del QR)
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('EMPRESA S.A.S', 105, 40, { align: 'center' });
        doc.setFontSize(10);
        doc.text('NIT: 900.123.456-7', 105, 45, { align: 'center' });
        doc.text('Calle Principal #123', 105, 50, { align: 'center' });
        doc.text('Ciudad - Tel: (1) 234 5678', 105, 55, { align: 'center' });

        // Línea divisoria
        doc.setLineWidth(0.5);
        doc.line(20, 60, 190, 60);

        // Información del empleado
        doc.setFontSize(11);
        doc.text('INFORMACIÓN DEL EMPLEADO', 20, 70);
        
        const infoEmpleado = [
            ['Nombre:', empleado.nombre],
            ['Documento:', `${empleado.tipo_documento || 'CC'} ${empleado.documento}`],
            ['Cargo:', empleado.cargo],
            ['Área:', empleado.area],
            ['Fecha de Ingreso:', empleado.fecha_ingreso || 'No especificada'],
            ['Tipo de Contrato:', empleado.contrato || 'No especificado'],
            ['Teléfono:', empleado.telefono || 'No especificado'],
            ['Correo:', empleado.correo || 'No especificado']
        ];

        let y = 80;
        infoEmpleado.forEach(([label, value]) => {
            doc.setFont('helvetica', 'bold');
            doc.text(label, 20, y);
            doc.setFont('helvetica', 'normal');
            doc.text(value, 60, y);
            y += 7;
        });

        // Línea divisoria
        doc.line(20, y + 5, 190, y + 5);

        // Información del período
        y += 15;
        doc.setFont('helvetica', 'bold');
        doc.text('PERÍODO DE PAGO', 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`Del ${periodoInicio} al ${periodoFin}`, 80, y);

        // Detalle de pago
        y += 15;
        doc.setFont('helvetica', 'bold');
        doc.text('DETALLE DE PAGO', 20, y);

        const detallePago = [
            ['Salario Base:', salarioBase],
            ['Bonificaciones:', bonificaciones],
            ['Deducciones:', deducciones],
            ['TOTAL A PAGAR:', salarioNeto]
        ];

        y += 10;
        detallePago.forEach(([concepto, valor], index) => {
            doc.setFont('helvetica', index === detallePago.length - 1 ? 'bold' : 'normal');
            doc.text(concepto, 20, y);
            doc.text(valor, 160, y, { align: 'right' });
            y += 7;
        });

        // Pie de página
        doc.setFontSize(8);
        doc.text('Este documento es un comprobante de pago. Para verificar su autenticidad escanee el código QR.', 105, y + 35, { align: 'center' });
        doc.text(`Generado el ${new Date().toLocaleDateString()}`, 105, y + 40, { align: 'center' });

        // Guardar el PDF
        const fileName = `desprendible_${empleado.documento}_${periodoInicio}.pdf`;
        doc.save(fileName);

        return true;
    } catch (error) {
        console.error('Error al generar PDF:', error);
        throw error;
    }
}

/**
 * Genera el texto para el código QR
 */
function generarTextoQR(empleado, periodoInicio, periodoFin, salarioNeto) {
    return `     DESPRENDIBLE
---------------------------------------
NOMBRE: ${empleado.nombre}
DOCUMENTO: ${empleado.tipo_documento || 'CC'} ${empleado.documento}
SALARIO NETO: ${salarioNeto}
PERIODO DE PAGO: ${periodoInicio} al ${periodoFin}`;
}

// Variable para controlar si hay una generación en proceso
let isGeneratingPDF = false;

/**
 * Genera el PDF del desprendible de nómina
 */
async function generarPdfNomina() {
    const botonPDF = document.getElementById('generar-pdf');
    if (!botonPDF || botonPDF.disabled || isGeneratingPDF) return;
    
    try {
        isGeneratingPDF = true;
        botonPDF.disabled = true;
        botonPDF.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generando...';

        await loadDependencies();
        await generarDesprendiblePDF();
        Utils.showMessage('PDF generado exitosamente', 'success');
    } catch (error) {
        console.error('Error al generar PDF:', error);
        Utils.showMessage('Error al generar el PDF: ' + error.message, 'error');
    } finally {
        isGeneratingPDF = false;
        botonPDF.disabled = false;
        botonPDF.innerHTML = '<i class="fas fa-file-pdf me-2"></i>PDF';
    }
}

// Función para inicializar el módulo de nómina
async function initNominaModule() {
    try {
        console.log('Iniciando inicialización del módulo de nómina...');

        // Verificar que estamos en la página correcta
        const nominaPanel = document.getElementById('nomina-panel');
        if (!nominaPanel) {
            console.log('No estamos en la página de nómina');
            return false;
        }

        // Esperar a que el DOM esté completamente cargado
        if (document.readyState !== 'complete') {
            console.log('Esperando a que el DOM esté completamente cargado...');
            await new Promise(resolve => {
                window.addEventListener('load', resolve);
            });
        }

        // Verificar si ya existe el contenedor de resumen
        let nominaResumen = document.getElementById('nomina-resumen');
        
        // Si no existe el contenedor de resumen, crearlo
        if (!nominaResumen) {
            console.log('Creando estructura del módulo de nómina...');
            nominaResumen = document.createElement('div');
            nominaResumen.id = 'nomina-resumen';
            nominaResumen.className = 'container-fluid mt-4';
            nominaPanel.appendChild(nominaResumen);
        }

        // Verificar y crear el contenedor de datos ocultos
        let datosOcultos = document.getElementById('datos-ocultos-nomina');
        if (!datosOcultos) {
            console.log('Creando contenedor de datos ocultos...');
            datosOcultos = document.createElement('div');
            datosOcultos.id = 'datos-ocultos-nomina';
            datosOcultos.style.display = 'none';
            nominaResumen.appendChild(datosOcultos);

            // Crear los campos ocultos necesarios
            const camposOcultos = [
                { id: 'empleado-id-nomina', name: 'empleado-id-nomina' },
                { id: 'nomina-empleado-data', name: 'nomina-empleado-data' }
            ];

            camposOcultos.forEach(campo => {
                if (!document.getElementById(campo.id)) {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.id = campo.id;
                    input.name = campo.name;
                    datosOcultos.appendChild(input);
                }
            });
        }

        // Inicializar el input de documento
        const documentoInput = document.getElementById('nomina-documento');
        if (documentoInput) {
            // Remover eventos existentes para evitar duplicados
            const nuevoInput = documentoInput.cloneNode(true);
            documentoInput.parentNode.replaceChild(nuevoInput, documentoInput);

            // Configurar el debounce para la búsqueda
            let typingTimer;
            const doneTypingInterval = 300;

            nuevoInput.addEventListener('input', (e) => {
                clearTimeout(typingTimer);
                typingTimer = setTimeout(() => {
                    const documento = e.target.value.trim();
                    if (documento.length >= 5) {
                        buscarEmpleado(documento);
                    }
                }, doneTypingInterval);
            });

            nuevoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const documento = e.target.value.trim();
                    if (documento.length >= 5) {
                        buscarEmpleado(documento);
                    }
                }
            });
        }

        // Configurar eventos para los botones
        const calcularBtn = document.getElementById('calcular-nomina');
        if (calcularBtn) {
            calcularBtn.addEventListener('click', calcularNomina);
        }

        const generarPdfBtn = document.getElementById('generar-pdf');
        if (generarPdfBtn) {
            generarPdfBtn.addEventListener('click', generarPdfNomina);
        }

        console.log('Módulo de nómina inicializado correctamente');
        return true;
    } catch (error) {
        console.error('Error al inicializar el módulo de nómina:', error);
        Utils.showMessage('Error al inicializar el módulo de nómina: ' + error.message, 'error');
        return false;
    }
}

// Asegurarse de que el módulo se inicialice cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('DOM cargado, inicializando módulos...');
        
        // Verificar autenticación primero
        await AuthManager.verifyAuth();

        // Inicializar el módulo de nómina si estamos en la página correcta
        const nominaPanel = document.getElementById('nomina-panel');
        if (nominaPanel) {
            await initNominaModule();
        }

        console.log('Inicialización completada');
    } catch (error) {
        console.error('Error durante la inicialización:', error);
        Utils.showMessage('Error al inicializar la aplicación: ' + error.message);
    }
});

// Función para cargar datos según la pestaña
async function cargarDatosPestaña(targetId) {
    try {
        console.log('Cargando datos para pestaña:', targetId);
        switch (targetId) {
            case '#empleados-panel':
                await EntityManager.loadData('recursos_humanos');
                break;
            case '#proveedores-section':
            case '#proveedores':
                console.log('Cargando datos de proveedores...');
                await EntityManager.loadData('proveedores');
                break;
            case '#clientes-section':
            case '#clientes':
                console.log('Cargando datos de clientes...');
                await EntityManager.loadData('clientes');
                break;
            case '#nomina-panel':
                if (typeof initNominaModule === 'function') {
                    console.log('Inicializando módulo de nómina...');
                    await initNominaModule();
                }
                break;
            case '#ausentismos-panel':
                // Manejar ausentismos si es necesario
                break;
            case '#liquidacion-panel':
                // Inicializar la calculadora de liquidación
                if (typeof LiquidacionLaboral !== 'undefined') {
                    new LiquidacionLaboral();
                }
                break;
        }
    } catch (error) {
        console.error('Error al cargar datos de pestaña:', error);
        Utils.showMessage('Error al cargar los datos: ' + error.message);
    }
}

// Función para verificar elementos del módulo de nómina
function verificarElementosNomina() {
    console.log('Verificando elementos del módulo de nómina...');

    const elementosRequeridos = [
        { id: 'nomina-empleado', tipo: 'div', descripcion: 'Contenedor de información del empleado' },
        { id: 'nomina-documento', tipo: 'input', descripcion: 'Campo de documento' },
        { id: 'nomina-salario-base-resumen', tipo: 'span', descripcion: 'Campo de salario base' },
        { id: 'nomina-bonificaciones', tipo: 'span', descripcion: 'Campo de bonificaciones' },
        { id: 'nomina-deducciones', tipo: 'span', descripcion: 'Campo de deducciones' },
        { id: 'nomina-salario-neto', tipo: 'span', descripcion: 'Campo de salario neto' },
        { id: 'info-empleado', tipo: 'div', descripcion: 'Sección de información del empleado' },
        { id: 'nomina-resumen', tipo: 'div', descripcion: 'Sección de resumen de nómina' }
    ];

    const elementosFaltantes = elementosRequeridos.filter(elemento => {
        const elementoDOM = document.getElementById(elemento.id);
        if (!elementoDOM) {
            console.error(`Elemento faltante: ${elemento.id} (${elemento.descripcion})`);
            return true;
        }
        console.log(`Elemento encontrado: ${elemento.id} (${elemento.tipo})`);
        return false;
    });

    return elementosFaltantes.length === 0;
}

// Inicialización de la página y eventos al cargar el DOM
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Página cargada, inicializando...');
        
        // Verificar autenticación
        await AuthManager.verifyAuth();

        // Cargar datos iniciales de cada módulo
        console.log('Cargando datos iniciales de los módulos...');
        await EntityManager.loadData('recursos_humanos');
        await EntityManager.loadData('proveedores');
        await EntityManager.loadData('clientes');

        // Configurar eventos de las pestañas
        const moduloTabs = document.getElementById('moduloTabs');
        if (moduloTabs) {
            console.log('Configurando eventos de pestañas...');
            
            // Cargar datos iniciales de la pestaña activa
            const activeTab = moduloTabs.querySelector('.nav-link.active');
            if (activeTab) {
                const targetId = activeTab.getAttribute('href');
                console.log('Cargando datos de pestaña activa:', targetId);
                await cargarDatosPestaña(targetId);
            }

            // Configurar eventos de cambio de pestaña
            moduloTabs.querySelectorAll('.nav-link').forEach(tab => {
                tab.addEventListener('shown.bs.tab', async (e) => {
                    const targetId = e.target.getAttribute('href');
                    console.log('Cambiando a pestaña:', targetId);
                    await cargarDatosPestaña(targetId);
                });
            });
        }

        // Configurar eventos para cambios de sección
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', async (e) => {
                const targetId = link.getAttribute('href');
                if (targetId === '#proveedores' || targetId === '#clientes') {
                    console.log('Cambiando a sección:', targetId);
                    await cargarDatosPestaña(targetId);
                }
            });
        });

        // Configurar formularios y botones para cada módulo
        ['proveedores', 'clientes', 'recursos_humanos'].forEach(tipo => {
            // Configurar formulario
                const form = document.getElementById(CONFIG[tipo].formId);
                if (form) {
                // Manejar envío del formulario
                form.addEventListener('submit', async (e) => {
        e.preventDefault();
                    await EntityManager.saveEntity(tipo);
                });

                // Configurar botón de agregar
                const addButton = document.getElementById(`add-${tipo}`);
                if (addButton) {
                    addButton.addEventListener('click', () => {
                        // Toggle del formulario con animación
                        if (form.classList.contains('form-visible')) {
                            // Si está visible, lo ocultamos
                            form.classList.remove('form-visible');
                            form.classList.add('form-hidden');
                            setTimeout(() => {
                                form.classList.add('hidden');
                                form.classList.remove('form-transition', 'form-hidden');
                            }, 300);
                } else {
                            // Si está oculto, lo mostramos
                            form.classList.remove('hidden');
                            form.classList.add('form-transition');
                            // Usar setTimeout para asegurar que la transición funcione
                            setTimeout(() => {
                                form.classList.add('form-visible');
                            }, 10);
                        }
                    });
                }

                // Configurar botón de cancelar
                const cancelButton = document.getElementById(`cancel-${tipo}`);
                if (cancelButton) {
                    cancelButton.addEventListener('click', () => {
                    form.reset();
                        form.classList.remove('form-visible');
                        form.classList.add('form-hidden');
                        setTimeout(() => {
                            form.classList.add('hidden');
                            form.classList.remove('form-transition', 'form-hidden');
                        }, 300);
                    });
                }

                // Configurar búsqueda con debounce
                const searchInput = document.getElementById(`search-${tipo}`);
                if (searchInput) {
                    let debounceTimer;
                    searchInput.addEventListener('input', () => {
                        clearTimeout(debounceTimer);
                        debounceTimer = setTimeout(() => {
                            EntityManager.searchData(tipo);
                        }, 300);
        });
    }
}
        });

        console.log('Inicialización completada');
    } catch (error) {
        console.error('Error durante la inicialización:', error);
        Utils.showMessage('Error al inicializar la aplicación: ' + error.message);
    }
});

/**
 * Actualiza los datos del empleado en el formulario
 * @param {Object} empleado - Datos del empleado
 */
function actualizarDatosEmpleado(empleado) {
    try {
        console.log('Actualizando datos del empleado:', empleado);
        
        if (!empleado || !empleado.nombre) {
            throw new Error('Datos del empleado inválidos o incompletos');
        }

        // Verificar y crear el contenedor de resumen si no existe
        let resumenContainer = document.getElementById('resumen-nomina-container');
        if (!resumenContainer) {
            console.log('Creando contenedor de resumen de nómina...');
            resumenContainer = document.createElement('div');
            resumenContainer.id = 'resumen-nomina-container';
            resumenContainer.className = 'card mt-4';
            
            // Crear la estructura del resumen con controles de período y botones
            resumenContainer.innerHTML = `
                <div class="card-header">
                    <h5 class="card-title mb-0">Resumen de Nómina</h5>
                </div>
                <div class="card-body">
                    <!-- Controles de período -->
                    <div class="row mb-4">
                        <div class="col-md-4">
                            <label class="form-label">Tipo de Período</label>
                            <select class="form-select" id="nomina-periodo-tipo">
                                <option value="Quincenal">Quincenal</option>
                                <option value="Mensual">Mensual</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Fecha Inicio</label>
                            <input type="date" class="form-control" id="nomina-periodo-inicio">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Fecha Fin</label>
                            <input type="date" class="form-control" id="nomina-periodo-fin">
                        </div>
                    </div>

                    <!-- Resumen de valores -->
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="fw-bold">Salario Base:</label>
                                <span id="nomina-salario-base-resumen">0</span>
                            </div>
                            <div class="mb-3">
                                <label class="fw-bold">Bonificaciones:</label>
                                <span id="nomina-bonificaciones">0</span>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="fw-bold">Deducciones:</label>
                                <span id="nomina-deducciones">0</span>
                            </div>
                            <div class="mb-3">
                                <label class="fw-bold">Salario Neto:</label>
                                <span id="nomina-salario-neto">0</span>
                            </div>
                        </div>
                    </div>

                    <!-- Botones de acción -->
                    <div class="row mt-4">
                        <div class="col-12 text-end">
                            <button type="button" class="btn btn-secondary me-2" id="calcular-nomina">
                                <i class="fas fa-calculator me-2"></i>Calcular
                            </button>
                            <button type="button" class="btn btn-success me-2" id="guardar-nomina">
                                <i class="fas fa-save me-2"></i>Guardar
                            </button>
                            <button type="button" class="btn btn-primary" id="generar-pdf" disabled>
                                <i class="fas fa-file-pdf me-2"></i>PDF
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            // Agregar el contenedor al resumen de nómina
            const nominaResumen = document.getElementById('nomina-resumen');
            if (nominaResumen) {
                nominaResumen.appendChild(resumenContainer);
            }

            // Configurar eventos de los botones
            const calcularBtn = document.getElementById('calcular-nomina');
            if (calcularBtn) {
                calcularBtn.addEventListener('click', calcularNomina);
            }

            const guardarBtn = document.getElementById('guardar-nomina');
            if (guardarBtn) {
                guardarBtn.addEventListener('click', async () => {
                    try {
                        // Aquí iría la lógica para guardar la nómina
                        Utils.showMessage('Nómina guardada exitosamente', 'success');
    } catch (error) {
                        Utils.showMessage('Error al guardar la nómina: ' + error.message, 'error');
                    }
                });
            }

            const generarPdfBtn = document.getElementById('generar-pdf');
            if (generarPdfBtn) {
                generarPdfBtn.addEventListener('click', generarPdfNomina);
            }

            // Configurar eventos de los campos de período
            const periodoTipo = document.getElementById('nomina-periodo-tipo');
            if (periodoTipo) {
                periodoTipo.addEventListener('change', calcularNomina);
            }
        }

        // ... resto del código existente ...
        // Actualizar el campo oculto con los datos del empleado
        const empleadoDataInput = document.getElementById('nomina-empleado-data');
        if (empleadoDataInput) {
            empleadoDataInput.value = JSON.stringify(empleado);
            console.log('Datos del empleado actualizados en campo oculto');
        }

        // Actualizar la visualización de los datos del empleado
        const nominaEmpleado = document.getElementById('nomina-empleado');
        if (!nominaEmpleado) {
            throw new Error('No se encontró el contenedor para mostrar la información del empleado');
        }

        // Actualizar la interfaz con los datos del empleado
        nominaEmpleado.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title mb-4">Información del Empleado</h5>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="fw-bold">Nombre:</label>
                                <div class="form-control-plaintext">${empleado.nombre}</div>
                            </div>
                            <div class="mb-3">
                                <label class="fw-bold">Documento:</label>
                                <div class="form-control-plaintext">${empleado.tipo_documento || 'CC'} ${empleado.documento}</div>
                            </div>
                            <div class="mb-3">
                                <label class="fw-bold">Cargo:</label>
                                <div class="form-control-plaintext">${empleado.cargo}</div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="fw-bold">Área:</label>
                                <div class="form-control-plaintext">${empleado.area}</div>
                            </div>
                            <div class="mb-3">
                                <label class="fw-bold">Salario Base:</label>
                                <div class="form-control-plaintext">${formatCurrency(empleado.salario)}</div>
                            </div>
                            <div class="mb-3">
                                <label class="fw-bold">Fecha de Ingreso:</label>
                                <div class="form-control-plaintext">${empleado.fecha_ingreso || 'No especificada'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Mostrar el contenedor del resumen si está oculto
        const infoEmpleado = document.getElementById('info-empleado');
        if (infoEmpleado) {
            infoEmpleado.classList.remove('d-none');
        }

        // Calcular y mostrar valores iniciales
        const periodoTipo = document.getElementById('nomina-periodo-tipo')?.value || 'Quincenal';
        const salarioCalculado = periodoTipo === 'Quincenal' ? empleado.salario / 2 : empleado.salario;
        const deducciones = salarioCalculado * 0.08; // 8% de deducciones (4% salud + 4% pensión)
        const salarioNeto = salarioCalculado - deducciones;

        // Actualizar resumen de nómina
        const elementosResumen = {
            'nomina-salario-base-resumen': formatCurrency(salarioCalculado),
            'nomina-bonificaciones': formatCurrency(0),
            'nomina-deducciones': formatCurrency(deducciones),
            'nomina-salario-neto': formatCurrency(salarioNeto)
        };

        for (const [id, valor] of Object.entries(elementosResumen)) {
        const elemento = document.getElementById(id);
        if (elemento) {
                elemento.textContent = valor;
        } else {
                console.warn(`Elemento ${id} no encontrado para actualizar valor`);
            }
        }

        // Habilitar el botón de generar PDF
        const generarPdfBtn = document.getElementById('generar-pdf');
        if (generarPdfBtn) {
            generarPdfBtn.disabled = false;
        }

        console.log('Interfaz actualizada exitosamente');
        Utils.showMessage('Datos del empleado cargados exitosamente', 'success');
        return true;
    } catch (error) {
        console.error('Error al actualizar datos del empleado:', error);
        Utils.showMessage('Error al actualizar datos del empleado: ' + error.message, 'error');
        return false;
    }
}

/**
 * Busca un empleado por documento
 */
async function buscarEmpleado(documento) {
    try {
        if (!documento) {
            console.log('Documento no proporcionado');
            Utils.showMessage('Por favor ingrese un número de documento', 'warning');
            return null;
        }

        console.log('=== Inicio de búsqueda de empleado ===');
        console.log('Documento a buscar:', documento);

        // Verificar y crear el contenedor principal si no existe
        let nominaResumen = document.getElementById('nomina-resumen');
        const nominaPanel = document.getElementById('nomina-panel');
        
        if (!nominaPanel) {
            console.error('No se encontró el panel de nómina');
            Utils.showMessage('Error: No se encontró el panel de nómina', 'error');
            return null;
        }

        if (!nominaResumen) {
            console.log('Creando contenedor principal de nómina...');
            nominaResumen = document.createElement('div');
            nominaResumen.id = 'nomina-resumen';
            nominaResumen.className = 'container-fluid mt-4';
            nominaPanel.appendChild(nominaResumen);
        }

        // Verificar y crear el contenedor de datos ocultos si no existe
        let datosOcultos = document.getElementById('datos-ocultos-nomina');
        if (!datosOcultos) {
            console.log('Creando contenedor de datos ocultos...');
            datosOcultos = document.createElement('div');
            datosOcultos.id = 'datos-ocultos-nomina';
            datosOcultos.style.display = 'none';
            nominaResumen.appendChild(datosOcultos);

            // Crear campos ocultos necesarios
            const camposOcultos = [
                { id: 'nomina-empleado-data', name: 'nomina-empleado-data' },
                { id: 'empleado-id-nomina', name: 'empleado-id-nomina' }
            ];

            camposOcultos.forEach(campo => {
                if (!document.getElementById(campo.id)) {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.id = campo.id;
                    input.name = campo.name;
                    datosOcultos.appendChild(input);
            }
        });
    }

        // Verificar y crear el contenedor de información del empleado si no existe
        let nominaEmpleado = document.getElementById('nomina-empleado');
        if (!nominaEmpleado) {
            console.log('Creando contenedor de información del empleado...');
            nominaEmpleado = document.createElement('div');
            nominaEmpleado.id = 'nomina-empleado';
            nominaResumen.appendChild(nominaEmpleado);
        }

        // Verificar y crear la sección de información si no existe
        let infoEmpleado = document.getElementById('info-empleado');
        if (!infoEmpleado) {
            console.log('Creando sección de información del empleado...');
            infoEmpleado = document.createElement('div');
            infoEmpleado.id = 'info-empleado';
            infoEmpleado.className = 'd-none';
            nominaResumen.appendChild(infoEmpleado);
        }

        // Mostrar indicador de carga
        nominaEmpleado.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Buscando empleado...</span>
                </div>
                <div class="mt-2">Buscando empleado...</div>
            </div>
        `;

        console.log('Realizando petición a la API...');
        const response = await fetch('/api/recursos_humanos/empleados/');
        
        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
        }

        const empleados = await response.json();
        console.log('Respuesta de la API:', empleados);

        const empleado = empleados.find(emp => emp.documento === documento);
        console.log('Empleado encontrado:', empleado);
        
        if (empleado) {
            // Guardar los datos del empleado
            const empleadoDataInput = document.getElementById('nomina-empleado-data');
            empleadoDataInput.value = JSON.stringify(empleado);
            console.log('Datos guardados en campo oculto:', empleado);

            // Actualizar la interfaz
            const actualizacionExitosa = actualizarDatosEmpleado(empleado);
            if (!actualizacionExitosa) {
                throw new Error('Error al actualizar la interfaz con los datos del empleado');
            }

            console.log('=== Búsqueda completada exitosamente ===');
            return empleado;
        } else {
            console.log('No se encontró empleado con el documento:', documento);
            Utils.showMessage('No se encontró empleado con el documento especificado', 'warning');
            
            nominaEmpleado.innerHTML = `
                <div class="alert alert-warning">
                    No se encontró empleado con el documento ${documento}
                </div>
            `;
            infoEmpleado.classList.add('d-none');
            return null;
        }
            } catch (error) {
        console.error('Error detallado al buscar empleado:', error);
        const errorMessage = error.message || 'Error desconocido al buscar empleado';
        Utils.showMessage(errorMessage, 'error');
        
        const nominaEmpleado = document.getElementById('nomina-empleado');
        if (nominaEmpleado) {
            nominaEmpleado.innerHTML = `
                <div class="alert alert-danger">
                    <strong>Error al buscar empleado:</strong><br>
                    ${errorMessage}
                </div>
            `;
        }
        
        const infoEmpleado = document.getElementById('info-empleado');
        if (infoEmpleado) {
            infoEmpleado.classList.add('d-none');
        }
        
        return null;
    }
}

/**
 * Verifica que los datos necesarios estén presentes
 */
function verificarDatosNecesarios() {
    const empleadoData = document.getElementById('nomina-empleado-data')?.value;
    if (!empleadoData) {
        throw new Error('No hay datos del empleado para generar el PDF');
    }

    const periodoInicio = document.getElementById('nomina-periodo-inicio')?.value;
    const periodoFin = document.getElementById('nomina-periodo-fin')?.value;
    
    if (!periodoInicio || !periodoFin) {
        throw new Error('Por favor seleccione el período de nómina');
    }

    return true;
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const documentoInput = document.getElementById('nomina-documento');
    if (documentoInput) {
        const buscarEmpleadoDebounced = debounce(async (documento) => {
            if (documento.length >= 5) {
                await buscarEmpleado(documento);
            }
        }, 300);

        documentoInput.addEventListener('input', (e) => {
            buscarEmpleadoDebounced(e.target.value.trim());
        });

        documentoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
        e.preventDefault();
                buscarEmpleado(e.target.value.trim());
            }
        });
    }

    // Configurar el botón de calcular nómina
    const calcularBtn = document.getElementById('calcular-nomina');
    if (calcularBtn) {
        calcularBtn.addEventListener('click', async () => {
            try {
                const resultado = await calcularNomina();
                if (resultado) {
                    Utils.showMessage('Nómina calculada exitosamente', 'success');
                }
        } catch (error) {
                Utils.showMessage('Error al calcular nómina: ' + error.message, 'error');
            }
        });
    }

    // Configurar el botón de generar PDF (una sola vez)
    const generarPdfBtn = document.getElementById('generar-pdf');
    if (generarPdfBtn) {
        // Remover el atributo onclick para evitar duplicación
        generarPdfBtn.removeAttribute('onclick');
        
        // Remover cualquier event listener existente
        const nuevoBoton = generarPdfBtn.cloneNode(true);
        generarPdfBtn.parentNode.replaceChild(nuevoBoton, generarPdfBtn);
        
        // Agregar un único event listener con debounce
        nuevoBoton.addEventListener('click', debounce(async () => {
            if (!isGeneratingPDF) {
                await generarPdfNomina();
            }
        }, 1000));
        
        // Deshabilitar inicialmente
        nuevoBoton.disabled = true;
    }
});

/**
 * Maneja el cambio de tipo de registro (ausentismo/horas extras)
 */
function handleTipoChange() {
    const tipo = document.getElementById('ausentismos-tipo').value;
    const horasExtrasDetalles = document.getElementById('horas-extras-detalles');
    const ausentismoDuracion = document.getElementById('ausentismo-duracion');
    const motivoContainer = document.getElementById('ausentismos-motivo-container');
    const motivoLabel = document.querySelector('label[for="ausentismos-motivo"]');
    const motivoInput = document.getElementById('ausentismos-motivo');

    if (tipo === 'horas_extras') {
        horasExtrasDetalles.classList.remove('d-none');
        ausentismoDuracion.classList.add('d-none');
        motivoLabel.textContent = 'Descripción del trabajo realizado:';
        motivoInput.placeholder = 'Detalle la labor realizada durante las horas extras';
    } else if (tipo === 'ausentismo') {
        horasExtrasDetalles.classList.add('d-none');
        ausentismoDuracion.classList.remove('d-none');
        motivoLabel.textContent = 'Motivo del ausentismo:';
        motivoInput.placeholder = 'Especifique el motivo del ausentismo';
    } else {
        horasExtrasDetalles.classList.add('d-none');
        ausentismoDuracion.classList.add('d-none');
    }
}

/**
 * Calcula el total de horas extras
 */
function calcularTotalHorasExtras() {
    const diurnas = parseFloat(document.getElementById('horas-extra-diurnas').value) || 0;
    const nocturnas = parseFloat(document.getElementById('horas-extra-nocturnas').value) || 0;
    const recargos = parseFloat(document.getElementById('recargos-nocturnos').value) || 0;
    const dominicales = parseFloat(document.getElementById('horas-extra-dominicales').value) || 0;
    
    const total = diurnas + nocturnas + recargos + dominicales;
    document.getElementById('total-horas-extras').textContent = total.toFixed(1);
    
    // También actualizar el campo de duración
    document.getElementById('ausentismos-duracion').value = total.toFixed(1);
}

/**
 * Guarda un registro de ausentismo o horas extras
 */
async function guardarRegistro(event) {
    event.preventDefault();
    
    try {
        const form = document.getElementById('form-ausentismos');
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const tipo = document.getElementById('ausentismos-tipo').value;
        const empleadoId = document.getElementById('ausentismos-empleado').value;
        const fecha = document.getElementById('ausentismos-fecha').value;
        const motivo = document.getElementById('ausentismos-motivo').value;
        const documento = document.getElementById('buscar-documento-ausentismo').value.trim();

        if (!documento || !empleadoId) {
            Utils.showMessage('Por favor busque y seleccione un empleado primero');
            return;
        }

        let data = {
            empleado: empleadoId,
            empleado_documento: documento,
            fecha: fecha,
            tipo: tipo,
            motivo: motivo || '',
            duracion_horas: 0,
            horas_extra_diurnas: 0,
            horas_extra_nocturnas: 0,
            recargos_nocturnos: 0,
            horas_extra_dominicales: 0
        };
        
        if (tipo === 'ausentismo') {
            data.duracion_horas = parseFloat(document.getElementById('ausentismos-duracion').value) || 0;
        } else if (tipo === 'horas_extras') {
            data.horas_extra_diurnas = parseFloat(document.getElementById('horas-extra-diurnas').value) || 0;
            data.horas_extra_nocturnas = parseFloat(document.getElementById('horas-extra-nocturnas').value) || 0;
            data.recargos_nocturnos = parseFloat(document.getElementById('recargos-nocturnos').value) || 0;
            data.horas_extra_dominicales = parseFloat(document.getElementById('horas-extra-dominicales').value) || 0;
            
            // Calcular duración total para horas extras
            data.duracion_horas = (
                data.horas_extra_diurnas +
                data.horas_extra_nocturnas +
                data.recargos_nocturnos +
                data.horas_extra_dominicales
            );
        }

        // Validar que haya al menos alguna duración
        if (data.duracion_horas <= 0) {
            Utils.showMessage('Por favor ingrese una duración válida mayor a 0');
            return;
        }

        console.log('Guardando registro:', data);
        await Utils.makeRequest(CONFIG.ausentismos.apiUrl, 'POST', data);
        
        Utils.showMessage('Registro guardado exitosamente', 'success');
        
        // Limpiar formulario
                    form.reset();
                    form.classList.remove('was-validated');
        document.getElementById('total-horas-extras').textContent = '0.0';
        
        // Recargar registros
        await cargarRegistrosEmpleado(documento);
        
    } catch (error) {
        console.error('Error al guardar registro:', error);
        Utils.showMessage('Error al guardar el registro: ' + error.message);
    }
}

/**
 * Filtra los registros por tipo
 */
function filtrarRegistros(tipo) {
    const tabla = document.getElementById('tabla-ausentismos');
    const filas = tabla.querySelectorAll('tbody tr');
    
    filas.forEach(fila => {
        const tipoRegistro = fila.cells[1].textContent;
        if (tipo === 'todos' || tipoRegistro === tipo) {
            fila.style.display = '';
        } else {
            fila.style.display = 'none';
        }
    });
}

// Función para buscar empleado por documento en el módulo de ausentismos
async function buscarEmpleadoAusentismo() {
    const documentoInput = document.getElementById('buscar-documento-ausentismo');
    const documento = documentoInput.value.trim();
    
    if (!documento) {
        Utils.showMessage('Por favor ingrese un documento', 'warning');
        return;
    }

    try {
        const response = await fetch('/api/recursos_humanos/empleados/');
        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
        }

        const empleados = await response.json();
        const empleado = empleados.find(emp => emp.documento === documento);

        const infoEmpleado = document.getElementById('info-empleado-ausentismo');
        const datosEmpleado = document.getElementById('datos-empleado-ausentismo');
        const empleadoIdInput = document.getElementById('ausentismos-empleado');

        if (empleado) {
            // Mostrar información del empleado
            datosEmpleado.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Nombre:</strong> ${empleado.nombre}</p>
                        <p><strong>Documento:</strong> ${empleado.documento}</p>
                        <p><strong>Cargo:</strong> ${empleado.cargo}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Área:</strong> ${empleado.area}</p>
                        <p><strong>Teléfono:</strong> ${empleado.telefono || 'No especificado'}</p>
                        <p><strong>Correo:</strong> ${empleado.correo || 'No especificado'}</p>
                    </div>
                </div>
            `;
            
            // Guardar el ID del empleado
            empleadoIdInput.value = empleado.id;
            
            // Mostrar el contenedor de información
            infoEmpleado.classList.remove('d-none');
            
            // Cargar los registros del empleado
            await cargarRegistrosEmpleado(empleado.documento);
            
            Utils.showMessage('Empleado encontrado', 'success');
        } else {
            infoEmpleado.classList.add('d-none');
            empleadoIdInput.value = '';
            Utils.showMessage('No se encontró el empleado con el documento especificado', 'warning');
        }
    } catch (error) {
        console.error('Error al buscar empleado:', error);
        Utils.showMessage('Error al buscar empleado: ' + error.message, 'error');
    }
}

// Función para cargar los registros de un empleado
async function cargarRegistrosEmpleado(documento) {
    try {
        console.log('Cargando registros para documento:', documento);
        const registros = await Utils.makeRequest(`${CONFIG.ausentismos.apiUrl}?documento=${documento}`);
        console.log('Registros obtenidos:', registros);
        
        const tabla = document.getElementById('tabla-ausentismos');
        if (!tabla) {
            console.error('Tabla de ausentismos no encontrada');
            return;
        }

        const tbody = tabla.querySelector('tbody');
        tbody.innerHTML = '';

        if (!registros || registros.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center p-3">
                        <div class="alert alert-info mb-0">
                            <i class="fas fa-info-circle me-2"></i>
                            No hay registros para este empleado
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Ordenar registros por fecha (más recientes primero)
        registros.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        registros.forEach(registro => {
            const row = document.createElement('tr');
            
            // Formatear la fecha
            const fecha = new Date(registro.fecha);
            const fechaFormateada = fecha.toISOString().split('T')[0];
            
            // Formatear la duración
            let duracionFormateada = '';
            if (registro.tipo === 'ausentismo') {
                duracionFormateada = `${registro.duracion_horas} horas`;
            } else {
                const total = (
                    parseFloat(registro.horas_extra_diurnas || 0) +
                    parseFloat(registro.horas_extra_nocturnas || 0) +
                    parseFloat(registro.recargos_nocturnos || 0) +
                    parseFloat(registro.horas_extra_dominicales || 0)
                ).toFixed(1);
                duracionFormateada = `${total} horas`;
            }

            // Construir la fila
            row.innerHTML = `
                <td class="text-center">${registro.empleado_documento || documento}</td>
                <td class="text-center">
                    <span class="badge ${registro.tipo === 'horas_extras' ? 'bg-primary' : 'bg-warning text-dark'} p-2">
                        ${registro.tipo === 'horas_extras' ? 'Horas Extras' : 'Ausentismo'}
                    </span>
                </td>
                <td class="text-center">${fechaFormateada}</td>
                <td class="text-center">${duracionFormateada}</td>
                <td>${registro.motivo || '<em class="text-muted">Sin motivo</em>'}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-danger" onclick="eliminarRegistro(${registro.id})" title="Eliminar registro">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

            tbody.appendChild(row);
        });

        // Asegurar que la tabla tenga los estilos correctos
        tabla.classList.add('table', 'table-hover', 'table-striped', 'align-middle');
        
    } catch (error) {
        console.error('Error al cargar registros:', error);
        Utils.showMessage('Error al cargar los registros: ' + error.message, 'error');
    }
}

// Función para eliminar un registro
async function eliminarRegistro(id) {
    if (confirm('¿Está seguro de que desea eliminar este registro?')) {
        try {
            await Utils.makeRequest(`${CONFIG.ausentismos.apiUrl}${id}/`, 'DELETE');
            Utils.showMessage('Registro eliminado exitosamente', 'success');
            
            // Recargar los registros del empleado actual
            const documentoInput = document.getElementById('buscar-documento-ausentismo');
            if (documentoInput.value) {
                await cargarRegistrosEmpleado(documentoInput.value.trim());
            }
    } catch (error) {
            console.error('Error al eliminar registro:', error);
            Utils.showMessage('Error al eliminar el registro: ' + error.message, 'error');
        }
    }
}

// Función para limpiar el formulario
function limpiarFormularioAusentismo() {
    const form = document.getElementById('form-ausentismos');
    const infoEmpleado = document.getElementById('info-empleado-ausentismo');
    
    form.reset();
    form.classList.remove('was-validated');
    infoEmpleado.classList.add('d-none');
    document.getElementById('ausentismos-empleado').value = '';
    document.getElementById('total-horas-extras').textContent = '0';
    
    // Ocultar contenedores específicos
    document.getElementById('horas-extras-detalles').classList.add('d-none');
    document.getElementById('ausentismo-duracion').classList.add('d-none');
}

// ... (mantener el código existente) ...

// Agregar al DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // ... (código existente) ...

    // Configurar eventos para el módulo de ausentismos
    const buscarEmpleadoBtn = document.getElementById('buscar-empleado-ausentismo');
    if (buscarEmpleadoBtn) {
        buscarEmpleadoBtn.addEventListener('click', buscarEmpleadoAusentismo);
    }

    const documentoInput = document.getElementById('buscar-documento-ausentismo');
    if (documentoInput) {
        documentoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                buscarEmpleadoAusentismo();
            }
        });
    }

    const limpiarBtn = document.getElementById('limpiar-ausentismos');
    if (limpiarBtn) {
        limpiarBtn.addEventListener('click', limpiarFormularioAusentismo);
    }

    const formAusentismos = document.getElementById('form-ausentismos');
    if (formAusentismos) {
        formAusentismos.addEventListener('submit', async (e) => {
            e.preventDefault();
            await guardarRegistro(e);
        });
    }
});