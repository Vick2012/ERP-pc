// Configuración de módulos para Proveedores, Clientes y Recursos Humanos
// Define la estructura de datos para cada módulo, incluyendo URLs de API, IDs de elementos HTML y campos de formulario
const CONFIG = {
    proveedores: {
        apiUrl: "/api/proveedores/", // URL base para la API de proveedores
        tableId: "tabla-proveedores", // ID de la tabla HTML donde se mostrarán los proveedores
        formId: "formulario-proveedor", // ID del formulario para agregar/editar proveedores
        fields: [ // Lista de campos del formulario con sus propiedades
            { id: "nombre-proveedor", key: "nombre", required: true }, // Nombre del proveedor, obligatorio
            { id: "contacto-proveedor", key: "contacto", required: true }, // Contacto del proveedor, obligatorio
            { id: "direccion-proveedor", key: "direccion", required: false }, // Dirección del proveedor, opcional
            { id: "telefono-proveedor", key: "telefono", required: false }, // Teléfono del proveedor, opcional
            { id: "email-proveedor", key: "email", required: false }, // Email del proveedor, opcional
            { id: "tipo_proveedor", key: "tipo_proveedor", required: false }, // Tipo de proveedor, opcional
        ],
        tableHeaders: ["ID", "Nombre", "Contacto", "Dirección", "Teléfono", "Email", "Tipo de Proveedor", "Acciones"], // Encabezados de la tabla de proveedores
        getRowData: (item) => [ // Función para mapear un objeto proveedor a una fila de la tabla
            item.id, // ID del proveedor
            item.nombre, // Nombre del proveedor
            item.contacto, // Contacto del proveedor
            item.direccion || "Sin dirección", // Dirección, con valor por defecto si no está definida
            item.telefono || "Sin teléfono", // Teléfono, con valor por defecto si no está definido
            item.email || "Sin email", // Email, con valor por defecto si no está definido
            item.tipo_proveedor || "Sin tipo", // Tipo de proveedor, con valor por defecto si no está definido
        ],
        searchFields: ["nombre", "contacto", "direccion", "telefono", "email", "tipo_proveedor"], // Campos en los que se puede buscar dentro de la tabla de proveedores
    },
    clientes: {
        apiUrl: "/api/clientes/", // URL base para la API de clientes
        tableId: "tabla-clientes", // ID de la tabla HTML donde se mostrarán los clientes
        formId: "formulario-cliente", // ID del formulario para agregar/editar clientes
        fields: [ // Lista de campos del formulario con sus propiedades
            { id: "nombre-cliente", key: "nombre", required: true }, // Nombre del cliente, obligatorio
            { id: "contacto-cliente", key: "contacto", required: true }, // Contacto del cliente, obligatorio
            { id: "preferencias-cliente", key: "preferencias", required: false }, // Preferencias del cliente, opcional
        ],
        tableHeaders: ["ID", "Nombre", "Contacto", "Preferencias", "Acciones"], // Encabezados de la tabla de clientes
        getRowData: (item) => [ // Función para mapear un objeto cliente a una fila de la tabla
            item.id, // ID del cliente
            item.nombre, // Nombre del cliente
            item.contacto, // Contacto del cliente
            item.preferencias || "Sin preferencias", // Preferencias, con valor por defecto si no está definida
        ],
        searchFields: ["nombre", "contacto", "preferencias"], // Campos en los que se puede buscar dentro de la tabla de clientes
    },
    recursos_humanos: {
        apiUrl: "/api/rrhh/empleados/", // URL base para la API de recursos humanos (empleados)
        tableId: "tabla-recursos_humanos", // ID de la tabla HTML donde se mostrarán los empleados
        formId: "formulario-recursos_humanos", // ID del formulario para agregar/editar empleados
        fields: [ // Lista de campos del formulario con sus propiedades
            { id: "nombre-recursos_humanos", key: "nombre", required: true }, // Nombre del empleado, obligatorio
            { id: "tipo_documento-recursos_humanos", key: "tipo_documento", required: true }, // Tipo de documento del empleado, obligatorio
            { id: "documento-recursos_humanos", key: "documento", required: true }, // Número de documento del empleado, obligatorio
            { id: "fecha_ingreso-recursos_humanos", key: "fecha_ingreso", required: true }, // Fecha de ingreso del empleado, obligatoria
            { id: "cargo-recursos_humanos", key: "cargo", required: true }, // Cargo del empleado, obligatorio
            { id: "salario-recursos_humanos", key: "salario", required: true }, // Salario del empleado, obligatorio
            { id: "area-recursos_humanos", key: "area", required: true }, // Área del empleado, obligatoria
            { id: "telefono-recursos_humanos", key: "telefono", required: true }, // Teléfono del empleado, obligatorio
            { id: "correo-recursos_humanos", key: "correo", required: true }, // Correo del empleado, obligatorio
            { id: "contrato-recursos_humanos", key: "contrato", required: true }, // Tipo de contrato del empleado, obligatorio
            { id: "contacto-recursos_humanos", key: "contacto", required: false }, // Contacto adicional del empleado, opcional
        ],
        tableHeaders: ["ID", "Nombre", "Tipo de Documento", "Documento", "Fecha de Ingreso", "Cargo", "Salario", "Área", "Teléfono", "Correo", "Contrato", "Contacto", "Acciones"], // Encabezados de la tabla de empleados
        getRowData: (item) => [ // Función para mapear un objeto empleado a una fila de la tabla
            item.id, // ID del empleado
            item.nombre, // Nombre del empleado
            item.tipo_documento, // Tipo de documento del empleado
            item.documento, // Número de documento del empleado
            item.fecha_ingreso, // Fecha de ingreso del empleado
            item.cargo, // Cargo del empleado
            item.salario, // Salario del empleado
            item.area, // Área del empleado
            item.telefono, // Teléfono del empleado
            item.correo, // Correo del empleado
            item.contrato, // Tipo de contrato del empleado
            item.contacto, // Contacto adicional, sin valor por defecto (puede ser vacío)
        ],
        searchFields: ["nombre", "tipo_documento", "documento", "fecha_ingreso", "cargo", "salario", "area", "telefono", "correo", "contrato", "contacto"], // Campos en los que se puede buscar dentro de la tabla de empleados
    },
};

// Utilidades para manejar solicitudes HTTP, tokens CSRF y mensajes al usuario
const Utils = {
    // Obtiene el token CSRF para solicitudes seguras (necesario para métodos POST, PUT, DELETE)
    getCsrfToken() {
        const token = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
        if (token) return token;
        const name = "csrftoken";
        const cookie = document.cookie.split(";").find((c) => c.trim().startsWith(name + "="));
        return cookie ? decodeURIComponent(cookie.split("=")[1]) : (() => { throw new Error("Token CSRF no encontrado."); })();
    },

    // Realiza solicitudes HTTP a la API con manejo de errores
    async makeRequest(url, method = "GET", data = null) {
        const headers = { "Content-Type": "application/json" };
        if (["POST", "PUT", "DELETE"].includes(method)) headers["X-CSRFToken"] = this.getCsrfToken();
        const options = { method, headers };
        if (data) options.body = JSON.stringify(data);
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const errorData = await response.text().then(text => {
                    try { return JSON.parse(text); } catch { return { detail: text || `Error ${response.status}: ${response.statusText}` }; }
                }).catch(() => ({}));
                console.log("Error details:", errorData);
                throw new Error(errorData.error || errorData.detail || `Error ${response.status}: ${response.statusText}`);
            }
            // Only parse JSON if the response has content
            return method === "DELETE" && response.status === 204 ? null : await response.json();
        } catch (error) {
            throw new Error(`Error en la solicitud a ${url}: ${error.message}`);
        }
    },

    // Muestra mensajes al usuario (error, éxito, advertencia) en consola y como alerta
    showMessage(message, type = 'error') {
        console.log(`Mensaje: ${message}, Tipo: ${type}`); // Registra el mensaje en la consola con su tipo
        alert(message); // Muestra el mensaje como una alerta en la interfaz
    },
};

// Gestión de entidades (empleados, proveedores, clientes, ausentismos, liquidaciones)
const EntityManager = {
    // Carga datos de la API y los renderiza en la tabla correspondiente
    async loadData(tipo) {
        try {
            const data = await Utils.makeRequest(CONFIG[tipo].apiUrl); // Obtiene los datos desde la API según el tipo (proveedores, clientes, etc.)
            this.renderTable(tipo, data); // Renderiza los datos en la tabla correspondiente
        } catch (error) {
            console.error(`Error al cargar ${tipo}:`, error); // Registra el error en la consola
            Utils.showMessage(`Error al cargar ${tipo}: ${error.message}`); // Muestra un mensaje de error al usuario
        }
    },

    // Renderiza los datos en una tabla HTML
    renderTable(tipo, data) {
        const { tableId, getRowData, tableHeaders } = CONFIG[tipo];
        const table = document.getElementById(tableId);
        if (!table) return;

        const thead = table.querySelector("thead");
        if (thead) {
            thead.innerHTML = `<tr><th>${tableHeaders.join("</th><th>")}</th></tr>`;
        }

        const tbody = table.querySelector("tbody");
        if (!tbody) return;
        tbody.innerHTML = "";
        data.forEach((item) => {
            const row = document.createElement("tr");
            // Add data cells
            getRowData(item).forEach((cell) => {
                const td = document.createElement("td");
                td.textContent = cell;
                row.appendChild(td);
            });

            // Add action cell with buttons
            const actionTd = document.createElement("td");
            actionTd.classList.add("text-nowrap");

            const editButton = document.createElement("button");
            editButton.classList.add("btn", "btn-warning", "btn-sm", "me-1");
            editButton.textContent = "Editar";
            editButton.addEventListener("click", () => EntityManager.editEntity(tipo, item.id));

            const deleteButton = document.createElement("button");
            deleteButton.classList.add("btn", "btn-danger", "btn-sm");
            deleteButton.textContent = "Eliminar";
            deleteButton.addEventListener("click", () => EntityManager.deleteEntity(tipo, item.id));

            actionTd.appendChild(editButton);
            actionTd.appendChild(deleteButton);
            row.appendChild(actionTd);

            tbody.appendChild(row);
        });
    },

    // Busca datos en la tabla según el término ingresado por el usuario
    searchData(tipo) {
        const { apiUrl, searchFields } = CONFIG[tipo]; // Obtiene la URL de la API y los campos de búsqueda
        const searchTerm = document.getElementById(`search-${tipo}`).value.toLowerCase(); // Obtiene el término de búsqueda en minúsculas
        fetch(apiUrl) // Realiza una solicitud para obtener todos los datos
            .then(response => response.json()) // Parsea la respuesta como JSON
            .then(data => {
                const filtered = data.filter(item => // Filtra los datos según el término de búsqueda
                    searchFields.some(field => item[field]?.toLowerCase().includes(searchTerm))
                );
                this.renderTable(tipo, filtered); // Renderiza los datos filtrados en la tabla
            })
            .catch(error => {
                console.error(`Error al buscar ${tipo}:`, error); // Registra el error en la consola
                Utils.showMessage(`Error al buscar ${tipo}: ${error.message}`); // Muestra un mensaje de error al usuario
            });
    },

    // Carga los datos de una entidad en el formulario para edición
    async editEntity(tipo, id) {
        try {
            const { apiUrl, fields, formId } = CONFIG[tipo]; // Obtiene la URL de la API, los campos y el ID del formulario
            const item = await Utils.makeRequest(`${apiUrl}${id}/`); // Obtiene los datos de la entidad específica desde la API
            fields.forEach(field => { // Itera sobre cada campo del formulario
                const element = document.getElementById(field.id); // Busca el elemento del campo en el DOM
                if (element.tagName === 'SELECT') { // Si el elemento es un <select>
                    element.value = item[field.key] || ''; // Establece el valor del <select>
                } else {
                    element.value = item[field.key] || ''; // Establece el valor del campo (input, textarea, etc.)
                }
            });
            document.getElementById(`${tipo}-id`).value = id; // Establece el ID de la entidad en un campo oculto
            if (document.getElementById(formId).classList.contains('hidden')) this.toggleForm(tipo); // Si el formulario está oculto, lo muestra
        } catch (error) {
            console.error(`Error al editar ${tipo}:`, error); // Registra el error en la consola
            Utils.showMessage(`Error al cargar ${tipo} para editar: ${error.message}`); // Muestra un mensaje de error al usuario
        }
    },

    // Elimina una entidad tras confirmar con el usuario
    async deleteEntity(tipo, id) {
        console.log(`Attempting to delete ${tipo} with ID: ${id}`);
        if (!confirm(`¿Eliminar ${tipo.slice(0, -1)} ${id}?`)) return;
        try {
            const currentData = await Utils.makeRequest(CONFIG[tipo].apiUrl);
            console.log("Current data:", currentData);
            const exists = currentData.some(item => item.id === id);
            if (!exists) {
                Utils.showMessage(`El ${tipo.slice(0, -1)} con ID ${id} ya no existe. Actualizando tabla.`, "warning");
                this.loadData(tipo);
                return;
            }

            const response = await Utils.makeRequest(`${CONFIG[tipo].apiUrl}${id}/`, "DELETE");
            console.log("Delete response:", response); // Debug log
            Utils.showMessage(`${tipo.slice(0, -1)} eliminado`, "success");
            this.loadData(tipo);
        } catch (error) {
            console.error(`Error al eliminar ${tipo}:`, error);
            Utils.showMessage(`Error al eliminar ${tipo}: ${error.message}`);
        }
    },

    // Guarda una entidad (nueva o editada) en la API
    async saveEntity(tipo) {
        try {
            console.log("Starting saveEntity for tipo:", tipo);
            const { apiUrl, fields } = CONFIG[tipo];
            const rawData = Object.fromEntries(
                fields.map((field) => [field.key, document.getElementById(field.id)?.value || ""])
            );
            // Transform data
            const data = { ...rawData };
            if (tipo === "recursos_humanos") {
                // Convert salario to a float
                if (data.salario) data.salario = parseFloat(data.salario) || 0;
                // Ensure fecha_ingreso is in the correct format (e.g., YYYY-MM-DD)
                if (data.fecha_ingreso) {
                    const date = new Date(data.fecha_ingreso);
                    if (!isNaN(date.getTime())) {
                        data.fecha_ingreso = date.toISOString().split("T")[0]; // YYYY-MM-DD
                    } else {
                        delete data.fecha_ingreso; // Remove invalid date
                    }
                }
            }
            console.log("Transformed data to save:", data);
            const requiredFields = fields.filter((f) => f.required);
            if (requiredFields.some((f) => !data[f.key])) {
                Utils.showMessage("Completa todos los campos obligatorios.");
                return;
            }
            const id = document.getElementById(`${tipo}-id`)?.value;
            const method = id ? "PUT" : "POST";
            const url = id ? `${apiUrl}${id}/` : apiUrl;
            console.log("Request URL:", url, "Method:", method);
            const response = await Utils.makeRequest(url, method, data);
            console.log("Server response:", response);
            Utils.showMessage(`${tipo.slice(0, -1)} guardado`, "success");
            this.loadData(tipo);
            this.clearForm(tipo);
        } catch (error) {
            console.error(`Error al guardar ${tipo}:`, error);
            Utils.showMessage(`Error al guardar ${tipo}: ${error.message}`);
        }
    },
    // Carga los datos de liquidaciones y los muestra en la tabla
    async loadLiquidacion() {
        try {
            const data = await Utils.makeRequest('/api/rrhh/liquidaciones/'); // Obtiene las liquidaciones desde la API
            const table = document.getElementById('tabla-liquidacion'); // Busca la tabla de liquidaciones en el DOM
            const tbody = table.querySelector('tbody'); // Selecciona el cuerpo de la tabla
            tbody.innerHTML = ''; // Limpia el contenido actual de la tabla
            data.forEach(item => { // Itera sobre cada liquidación
                const row = document.createElement('tr'); // Crea una nueva fila
                row.innerHTML = ` // Llena la fila con los datos de la liquidación y botones de acción
                <td>${item.id}</td>
                <td>${item.empleado_nombre || 'Sin nombre'}</td>
                <td>${item.contrato || 'Sin contrato'}</td>
                <td>${item.fondo_pensiones || '0'}</td>
                <td>${item.cesantias || '0'}</td>
                <td>${item.eps || '0'}</td>
                <td>${item.caja_compensacion || '0'}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="EntityManager.editEntity('liquidacion', ${item.id})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="EntityManager.deleteEntity('liquidacion', ${item.id})">Eliminar</button>
                </td>
            `;
                tbody.appendChild(row); // Agrega la fila al cuerpo de la tabla
            });
        } catch (error) {
            Utils.showMessage(`Error al cargar liquidaciones: ${error.message}`); // Muestra un mensaje de error al usuario
        }
    },

    // Carga los datos de ausentismos y los muestra en la tabla
    async loadAusentismos() {
        try {
            const data = await Utils.makeRequest('/api/rrhh/ausentismos/'); // Obtiene los ausentismos desde la API
            const table = document.getElementById('tabla-ausentismos'); // Busca la tabla de ausentismos en el DOM
            const tbody = table.querySelector('tbody'); // Selecciona el cuerpo de la tabla
            tbody.innerHTML = ''; // Limpia el contenido actual de la tabla
            data.forEach(item => { // Itera sobre cada ausentismo
                const row = document.createElement('tr'); // Crea una nueva fila
                row.innerHTML = ` // Llena la fila con los datos del ausentismo
                    <td>${item.empleado_nombre || item.empleado}</td>
                    <td>${item.tipo}</td>
                    <td>${item.fecha}</td>
                    <td>${item.duracion}</td>
                    <td>${item.motivo || 'N/A'}</td>
                `;
                tbody.appendChild(row); // Agrega la fila al cuerpo de la tabla
            });
        } catch (error) {
            Utils.showMessage(`Error al cargar ausentismos: ${error.message}`); // Muestra un mensaje de error al usuario
        }
    },

    // Guarda un nuevo registro de ausentismo o horas extras
    async saveAusentismo() {
        const empleadoId = document.getElementById('ausentismos-empleado').value; // Obtiene el ID del empleado
        const fecha = document.getElementById('ausentismos-fecha').value; // Obtiene la fecha del ausentismo
        const tipo = document.getElementById('ausentismos-tipo').value; // Obtiene el tipo (ausentismo o horas extras)
        const duracion = parseFloat(document.getElementById('ausentismos-duracion').value); // Obtiene la duración en horas
        const motivo = document.getElementById('ausentismos-motivo').value || ''; // Obtiene el motivo (opcional)

        if (!empleadoId || !fecha || !tipo || !duracion) { // Verifica que los campos obligatorios estén completos
            Utils.showMessage('Completa todos los campos obligatorios.'); // Muestra un mensaje de error si faltan datos
            return;
        }

        const payload = { empleado: empleadoId, fecha, tipo, duracion, motivo }; // Crea el objeto con los datos a enviar
        try {
            const response = await Utils.makeRequest(tipo === 'ausentismo' ? '/api/rrhh/ausentismos/' : '/api/rrhh/horas_extras/', 'POST', payload); // Envía la solicitud a la API
            Utils.showMessage('Registro guardado', 'success'); // Muestra un mensaje de éxito
            document.getElementById('ausentismos-empleado').value = ''; // Limpia el campo de empleado
            document.getElementById('ausentismos-fecha').value = ''; // Limpia el campo de fecha
            document.getElementById('ausentismos-tipo').value = ''; // Limpia el campo de tipo
            document.getElementById('ausentismos-duracion').value = ''; // Limpia el campo de duración
            document.getElementById('ausentismos-motivo').value = ''; // Limpia el campo de motivo
            this.loadAusentismos(); // Recarga la tabla de ausentismos
        } catch (error) {
            Utils.showMessage(`Error al registrar: ${error.message}`); // Muestra un mensaje de error al usuario
        }
    },

    // Muestra u oculta el formulario de un módulo
    toggleForm(tipo) {
        document.getElementById(CONFIG[tipo].formId).classList.toggle('hidden'); // Alterna la visibilidad del formulario (muestra u oculta)
    },

    // Limpia los campos del formulario y lo oculta
    clearForm(tipo) {
        const { fields } = CONFIG[tipo]; // Obtiene los campos del formulario
        fields.forEach(field => document.getElementById(field.id).value = ''); // Limpia cada campo del formulario
        const idField = document.getElementById(`${tipo}-id`); // Busca el campo oculto del ID
        if (idField) idField.value = ''; // Limpia el campo del ID
        this.toggleForm(tipo); // Oculta el formulario
    },
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

// Función para calcular la nómina
function calcularNomina(event) {
    event.preventDefault();
    console.log('Iniciando cálculo de nómina...');
    
    try {
        // Obtener valores del formulario
        const documento = document.getElementById('nomina-documento').value;
        const periodoInicio = document.getElementById('nomina-periodo-inicio').value;
        const periodoFin = document.getElementById('nomina-periodo-fin').value;
        const periodoTipo = document.getElementById('nomina-periodo-tipo').value;
        const salarioBase = parseFloat(document.getElementById('nomina-salario-base').value);
        const nombre = document.getElementById('nomina-nombre').value;

        console.log('Valores obtenidos:', { documento, periodoInicio, periodoFin, periodoTipo, salarioBase, nombre });

        if (!documento || !periodoInicio || !periodoFin || !periodoTipo || isNaN(salarioBase) || !nombre) {
            throw new Error('Por favor complete todos los campos requeridos');
        }

        // Obtener horas trabajadas
        const horasExtras = {
            diurnas: parseFloat(document.getElementById('nomina-horas-extra-diurnas').value || 0),
            nocturnas: parseFloat(document.getElementById('nomina-horas-extra-nocturnas').value || 0),
            recargoNocturno: parseFloat(document.getElementById('nomina-recargos-nocturnos').value || 0),
            festivasDiurnas: parseFloat(document.getElementById('nomina-horas-diurnas-festivas').value || 0),
            festivasNocturnas: parseFloat(document.getElementById('nomina-horas-nocturnas-festivas').value || 0),
            extrasFestivasDiurnas: parseFloat(document.getElementById('nomina-horas-extras-diurnas-festivas').value || 0),
            extrasFestivasNocturnas: parseFloat(document.getElementById('nomina-horas-extras-nocturnas-festivas').value || 0),
            ausencias: parseFloat(document.getElementById('nomina-horas-ausente').value || 0)
        };

        console.log('Horas extras:', horasExtras);

        // Calcular valor hora
        const valorHora = salarioBase / NOMINA_CONFIG.HORAS_MES;
        console.log('Valor hora:', valorHora);

        // Calcular bonificaciones
        const bonificaciones = {
            extraDiurna: valorHora * NOMINA_CONFIG.FACTORES.EXTRA_DIURNA * horasExtras.diurnas,
            extraNocturna: valorHora * NOMINA_CONFIG.FACTORES.EXTRA_NOCTURNA * horasExtras.nocturnas,
            recargoNocturno: valorHora * NOMINA_CONFIG.FACTORES.RECARGO_NOCTURNO * horasExtras.recargoNocturno,
            festivaDiurna: valorHora * NOMINA_CONFIG.FACTORES.FESTIVO_DIURNO * horasExtras.festivasDiurnas,
            festivaNocturna: valorHora * NOMINA_CONFIG.FACTORES.FESTIVO_NOCTURNO * horasExtras.festivasNocturnas,
            extraFestivaDiurna: valorHora * NOMINA_CONFIG.FACTORES.EXTRA_FESTIVO_DIURNO * horasExtras.extrasFestivasDiurnas,
            extraFestivaNocturna: valorHora * NOMINA_CONFIG.FACTORES.EXTRA_FESTIVO_NOCTURNO * horasExtras.extrasFestivasNocturnas
        };

        console.log('Bonificaciones:', bonificaciones);

        // Calcular deducciones
        const deducciones = {
            ausencias: valorHora * horasExtras.ausencias,
            salud: salarioBase * NOMINA_CONFIG.DEDUCCIONES.SALUD,
            pension: salarioBase * NOMINA_CONFIG.DEDUCCIONES.PENSION
        };

        console.log('Deducciones:', deducciones);

        // Calcular totales
        const totalBonificaciones = Object.values(bonificaciones).reduce((a, b) => a + b, 0);
        const totalDeducciones = Object.values(deducciones).reduce((a, b) => a + b, 0);
        const salarioNeto = salarioBase + totalBonificaciones - totalDeducciones;

        console.log('Totales:', { totalBonificaciones, totalDeducciones, salarioNeto });

        // Actualizar UI
        const resumenNomina = document.getElementById('nomina-resumen');
        resumenNomina.classList.remove('hidden');
        
        // Información del empleado
        document.getElementById('nomina-empleado').textContent = nombre;
        document.getElementById('nomina-periodo-inicio-resumen').textContent = formatDate(periodoInicio);
        document.getElementById('nomina-periodo-fin-resumen').textContent = formatDate(periodoFin);
        document.getElementById('nomina-periodo-tipo-resumen').textContent = periodoTipo;

        // Información salarial
        document.getElementById('nomina-salario-base-resumen').textContent = formatCurrency(salarioBase);
        document.getElementById('nomina-bonificaciones').textContent = formatCurrency(totalBonificaciones);
        document.getElementById('nomina-deducciones').textContent = formatCurrency(totalDeducciones);
        document.getElementById('nomina-salario-neto').textContent = formatCurrency(salarioNeto);

        console.log('UI actualizada correctamente');

        // Mostrar botones
        const botonPDF = document.getElementById('generar-pdf');
        const botonGuardar = document.getElementById('guardar-nomina');
        if (botonPDF) botonPDF.style.display = 'block';
        if (botonGuardar) botonGuardar.style.display = 'block';

    } catch (error) {
        console.error('Error en cálculo de nómina:', error);
        Utils.showMessage(`Error al calcular nómina: ${error.message}`);
    }
}

// Función para generar PDF
function generarPDFNomina() {
    try {
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            throw new Error('La librería jsPDF no está disponible');
        }

        const doc = new jsPDF();
        
        // Configuración inicial
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        
        // Encabezado
        doc.text('RECIBO DE NÓMINA', 105, 20, { align: 'center' });
        
        // Información de la empresa
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('EventSync', 20, 35);
        doc.text('NIT: 900.XXX.XXX-X', 20, 42);
        
        // Información del empleado
        const empleado = document.getElementById('nomina-empleado').textContent;
        const periodoInicio = document.getElementById('nomina-periodo-inicio-resumen').textContent;
        const periodoFin = document.getElementById('nomina-periodo-fin-resumen').textContent;
        const periodoTipo = document.getElementById('nomina-periodo-tipo-resumen').textContent;
        
        doc.text(`Empleado: ${empleado}`, 20, 55);
        doc.text(`Periodo: ${periodoInicio} al ${periodoFin}`, 20, 65);
        doc.text(`Tipo de Periodo: ${periodoTipo}`, 20, 75);
        
        // Información salarial
        const salarioBase = document.getElementById('nomina-salario-base-resumen').textContent;
        const bonificaciones = document.getElementById('nomina-bonificaciones').textContent;
        const deducciones = document.getElementById('nomina-deducciones').textContent;
        const salarioNeto = document.getElementById('nomina-salario-neto').textContent;
        
        doc.line(20, 85, 190, 85);
        doc.text('CONCEPTO', 20, 95);
        doc.text('VALOR', 150, 95);
        doc.line(20, 98, 190, 98);
        
        let y = 105;
        doc.text('Salario Base', 20, y);
        doc.text(salarioBase, 150, y);
        
        y += 10;
        doc.text('Bonificaciones', 20, y);
        doc.text(bonificaciones, 150, y);
        
        y += 10;
        doc.text('Deducciones', 20, y);
        doc.text(deducciones, 150, y);
        
        doc.line(20, y + 5, 190, y + 5);
        
        y += 15;
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL A PAGAR', 20, y);
        doc.text(salarioNeto, 150, y);
        
        // Pie de página
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('Este documento es un comprobante de pago', 105, 280, { align: 'center' });
        
        // Guardar PDF
        const nombreArchivo = `Nomina_${empleado}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nombreArchivo);
        
    } catch (error) {
        console.error('Error generando PDF:', error);
        Utils.showMessage('Error al generar el PDF: ' + error.message);
    }
}

// Inicialización del módulo de nómina
function initNominaModule() {
    const formularioNomina = document.getElementById('formulario-nomina');
    if (!formularioNomina) return;

    // Evento submit del formulario
    formularioNomina.addEventListener('submit', calcularNomina);

    // Evento para limpiar formulario
    const botonLimpiar = document.getElementById('limpiar-formulario');
    if (botonLimpiar) {
        botonLimpiar.addEventListener('click', function() {
            formularioNomina.reset();
            const resumen = document.getElementById('nomina-resumen');
            if (resumen) resumen.classList.add('hidden');
            const nombreInput = document.getElementById('nomina-nombre');
            if (nombreInput) nombreInput.value = '';
            const salarioInput = document.getElementById('nomina-salario-base');
            if (salarioInput) salarioInput.value = '';
        });
    }

    // Evento para generar PDF
    const botonGenerarPDF = document.getElementById('generar-pdf');
    if (botonGenerarPDF) {
        botonGenerarPDF.addEventListener('click', generarPDFNomina);
    }

    // Evento para buscar empleado por documento
    const inputDocumento = document.getElementById('nomina-documento');
    if (inputDocumento) {
        inputDocumento.addEventListener('blur', async function() {
            const documento = this.value.trim();
            if (!documento) return;
            
            try {
                const response = await Utils.makeRequest(`${CONFIG.recursos_humanos.apiUrl}?documento=${documento}`);
                if (response && response.length > 0) {
                    const empleado = response[0];
                    const nombreInput = document.getElementById('nomina-nombre');
                    const salarioInput = document.getElementById('nomina-salario-base');
                    
                    if (nombreInput) nombreInput.value = empleado.nombre;
                    if (salarioInput) salarioInput.value = empleado.salario;
                    formularioNomina.dataset.empleadoId = empleado.id;
                } else {
                    Utils.showMessage('Empleado no encontrado');
                    const nombreInput = document.getElementById('nomina-nombre');
                    const salarioInput = document.getElementById('nomina-salario-base');
                    
                    if (nombreInput) nombreInput.value = '';
                    if (salarioInput) salarioInput.value = '';
                }
            } catch (error) {
                console.error('Error al buscar empleado:', error);
                Utils.showMessage(`Error al buscar empleado: ${error.message}`);
            }
        });
    }
}

// Inicialización general cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando aplicación...');
    
    try {
        // Inicializar módulos principales
        ['proveedores', 'clientes', 'recursos_humanos'].forEach(tipo => {
            if (document.getElementById(CONFIG[tipo].tableId)) {
                EntityManager.loadData(tipo);
                const form = document.getElementById(CONFIG[tipo].formId);
                if (form) {
                    form.addEventListener('submit', (e) => {
                        e.preventDefault();
                        EntityManager.saveEntity(tipo);
                    });
                }
            }
        });

        // Inicializar módulo de nómina
        initNominaModule();

        // Verificar autenticación
        AuthManager.verifyAuth();

        // Configurar botones de login/registro
        document.querySelectorAll('#login-btn, #register-btn').forEach(btn => {
            btn.addEventListener('click', () => 
                AuthManager.showModal(btn.id === 'login-btn' ? 'loginModal' : 'registerModal')
            );
        });

        console.log('Inicialización completada con éxito');
    } catch (error) {
        console.error('Error durante la inicialización:', error);
    }
});