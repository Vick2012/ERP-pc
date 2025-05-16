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
        const headers = { 
            "Content-Type": "application/json",
            // Agregar headers para prevenir caché
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        };
        
        if (["POST", "PUT", "DELETE"].includes(method)) {
            headers["X-CSRFToken"] = this.getCsrfToken();
        }
        
        // Agregar timestamp para evitar caché
        const urlWithTimestamp = url + (url.includes('?') ? '&' : '?') + '_=' + new Date().getTime();
        
        const options = { 
            method, 
            headers,
            // Asegurarse de que no se use caché
            cache: 'no-store'
        };
        
        if (data) options.body = JSON.stringify(data);
        
        try {
            const response = await fetch(urlWithTimestamp, options);
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
            const data = await Utils.makeRequest('/api/rrhh/ausentismos/');
            const table = document.getElementById('tabla-ausentismos');
            const tbody = table.querySelector('tbody');
            tbody.innerHTML = '';
            data.forEach(item => {
                const row = document.createElement('tr');
                row.dataset.tipo = item.tipo;
                row.innerHTML = `
                    <td>${item.empleado_documento || item.documento}</td>
                    <td><span class="badge ${getBadgeClass(item.tipo)}">${getTipoTexto(item.tipo)}</span></td>
                    <td>${new Date(item.fecha).toLocaleDateString()}</td>
                    <td>${item.duracion_horas || item.duracion} horas</td>
                    <td>${item.motivo || 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm btn-danger eliminar-registro" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        } catch (error) {
            Utils.showMessage(`Error al cargar ausentismos: ${error.message}`);
        }
    },

    // Guarda un nuevo registro de ausentismo o horas extras
    async saveAusentismo(event) {
        event.preventDefault();
        const form = document.getElementById('form-ausentismos');
        
        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        const empleadoSelect = document.getElementById('ausentismos-empleado');
        const empleadoOption = empleadoSelect.options[empleadoSelect.selectedIndex];
        const documento = empleadoOption.getAttribute('data-documento');
        const fecha = document.getElementById('ausentismos-fecha').value;
        const tipo = document.getElementById('ausentismos-tipo').value;
        const motivo = document.getElementById('ausentismos-motivo').value || '';

        if (!documento || !fecha || !tipo) {
            Utils.showMessage('Complete todos los campos obligatorios.');
            return;
        }

        try {
            let duracion;
            if (tipo === 'ausentismo') {
                duracion = parseFloat(document.getElementById('ausentismos-duracion').value);
                if (isNaN(duracion) || duracion <= 0 || duracion > 24) {
                    Utils.showMessage('La duración debe estar entre 0 y 24 horas.');
                    return;
                }
            } else if (tipo === 'horas_extras') {
                // Para horas extras, sumar todas las horas ingresadas
                const horasDiurnas = parseFloat(document.getElementById('horas-extra-diurnas').value) || 0;
                const horasNocturnas = parseFloat(document.getElementById('horas-extra-nocturnas').value) || 0;
                const recargosNocturnos = parseFloat(document.getElementById('recargos-nocturnos').value) || 0;
                const horasDominicales = parseFloat(document.getElementById('horas-extra-dominicales').value) || 0;
                
                duracion = horasDiurnas + horasNocturnas + recargosNocturnos + horasDominicales;
                
                if (duracion <= 0 || duracion > 24) {
                    Utils.showMessage('El total de horas extras debe estar entre 0 y 24 horas.');
                    return;
                }
            }

            let payload;
            let endpoint;

            if (tipo === 'horas_extras') {
                payload = {
                    documento: documento,
                    fecha,
                    tipo: 'horas_extras',
                    duracion_horas: duracion,
                    motivo,
                    horas_extra_diurnas: parseFloat(document.getElementById('horas-extra-diurnas').value) || 0,
                    horas_extra_nocturnas: parseFloat(document.getElementById('horas-extra-nocturnas').value) || 0,
                    recargos_nocturnos: parseFloat(document.getElementById('recargos-nocturnos').value) || 0,
                    horas_extra_dominicales: parseFloat(document.getElementById('horas-extra-dominicales').value) || 0
                };
                endpoint = '/api/rrhh/horas_extras/';
            } else {
                payload = {
                    documento: documento,
                    fecha,
                    tipo: 'ausentismo',
                    duracion_horas: duracion,
                    motivo
                };
                endpoint = '/api/rrhh/ausentismos/';
            }

            console.log('Enviando datos:', payload, 'a endpoint:', endpoint);
            await Utils.makeRequest(endpoint, 'POST', payload);
            Utils.showMessage('Registro guardado exitosamente', 'success');
            form.reset();
            form.classList.remove('was-validated');
            this.loadAusentismos();
        } catch (error) {
            console.error('Error detallado:', error);
            Utils.showMessage(`Error al guardar: ${error.message}`);
        }
    },

    // Inicializar eventos para el formulario de ausentismos y horas extras
    initAusentismosForm() {
        const tipoSelect = document.getElementById('ausentismos-tipo');
        const horasExtrasDetalles = document.getElementById('horas-extras-detalles');
        const ausentismoDuracion = document.getElementById('ausentismo-duracion');
        
        // Función para calcular el total de horas extras
        const calcularTotalHorasExtras = () => {
            const horasDiurnas = parseFloat(document.getElementById('horas-extra-diurnas').value) || 0;
            const horasNocturnas = parseFloat(document.getElementById('horas-extra-nocturnas').value) || 0;
            const recargosNocturnos = parseFloat(document.getElementById('recargos-nocturnos').value) || 0;
            const horasDominicales = parseFloat(document.getElementById('horas-extra-dominicales').value) || 0;
            
            const total = horasDiurnas + horasNocturnas + recargosNocturnos + horasDominicales;
            document.getElementById('total-horas-extras').textContent = total.toFixed(1);
        };

        // Manejar cambios en el tipo de registro
        if (tipoSelect) {
            tipoSelect.addEventListener('change', () => {
                const tipo = tipoSelect.value;
                
                if (tipo === 'horas_extras') {
                    horasExtrasDetalles.classList.remove('d-none');
                    ausentismoDuracion.classList.add('d-none');
                } else if (tipo === 'ausentismo') {
                    horasExtrasDetalles.classList.add('d-none');
                    ausentismoDuracion.classList.remove('d-none');
                } else {
                    horasExtrasDetalles.classList.add('d-none');
                    ausentismoDuracion.classList.add('d-none');
                }
            });
        }

        // Agregar listeners para calcular total de horas extras
        ['horas-extra-diurnas', 'horas-extra-nocturnas', 'recargos-nocturnos', 'horas-extra-dominicales'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', calcularTotalHorasExtras);
            }
        });
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

// Cargar todas las dependencias necesarias
async function loadDependencies() {
    try {
        console.log('Iniciando carga de dependencias...');
        
        // Cargar jsPDF si no está disponible
        if (typeof window.jspdf === 'undefined') {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                script.onload = resolve;
                script.onerror = () => reject(new Error('Error al cargar jsPDF'));
                document.head.appendChild(script);
            });
            console.log('jsPDF cargado');
        }

        // Cargar autoTable si no está disponible
        if (typeof window.jspdf.autoTable === 'undefined') {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js';
                script.onload = resolve;
                script.onerror = () => reject(new Error('Error al cargar autoTable'));
                document.head.appendChild(script);
            });
            console.log('autoTable cargado');
        }

        // Cargar QRious para códigos QR si no está disponible
        if (typeof window.QRious === 'undefined') {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
                script.onload = resolve;
                script.onerror = () => reject(new Error('Error al cargar QRious'));
                document.head.appendChild(script);
            });
            console.log('QRious cargado');
        }

        return true;
    } catch (error) {
        console.error('Error al cargar dependencias:', error);
        throw error;
    }
}

// Función para cargar el logo de la empresa
async function cargarLogo() {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('No se pudo cargar el logo'));
        img.src = '/static/img/logo.png';
    });
}

// Función para calcular la nómina
async function calcularNomina(empleadoId) {
    try {
        // Verificar que tengamos todos los datos necesarios
        const formularioNomina = document.getElementById('formulario-nomina');
        const periodoTipo = document.getElementById("nomina-periodo-tipo").value;
        const periodoInicio = document.getElementById("nomina-periodo-inicio").value;
        const periodoFin = document.getElementById("nomina-periodo-fin").value;

        if (!empleadoId || !periodoTipo || !periodoInicio || !periodoFin) {
            throw new Error('Faltan datos necesarios para el cálculo. Por favor complete todos los campos.');
        }

        // Obtener datos del empleado desde la API
        const empleado = await Utils.makeRequest(`/api/rrhh/empleados-list/${empleadoId}/`);
        if (!empleado) {
            throw new Error('No se encontró el empleado');
        }

        const salarioBaseMensual = parseFloat(empleado.salario);
        
        // Ajustar el salario base según el periodo
        const salarioBase = periodoTipo === "Quincenal" ? salarioBaseMensual / 2 : salarioBaseMensual;
        const horasTotales = periodoTipo === "Quincenal" ? NOMINA_CONFIG.HORAS_QUINCENA : NOMINA_CONFIG.HORAS_MES;
        const valorHora = salarioBase / horasTotales;

        // Obtener valores de los campos del formulario
        const getVal = (id) => parseFloat(document.getElementById(id).value) || 0;
        const horasExtraD = getVal("nomina-horas-extra-diurnas");
        const horasExtraN = getVal("nomina-horas-extra-nocturnas");
        const recargosNoc = getVal("nomina-recargos-nocturnos");
        const horasFestD = getVal("nomina-horas-diurnas-festivas");
        const horasFestN = getVal("nomina-horas-nocturnas-festivas");
        const horasExtraFestD = getVal("nomina-horas-extras-diurnas-festivas");
        const horasExtraFestN = getVal("nomina-horas-extras-nocturnas-festivas");
        const horasAusente = getVal("nomina-horas-ausente");

        // Calcular bonificaciones
        const bonificaciones = {
            extraDiurna: horasExtraD * valorHora * NOMINA_CONFIG.FACTORES.EXTRA_DIURNA,
            extraNocturna: horasExtraN * valorHora * NOMINA_CONFIG.FACTORES.EXTRA_NOCTURNA,
            recargoNocturno: recargosNoc * valorHora * NOMINA_CONFIG.FACTORES.RECARGO_NOCTURNO,
            festivaDiurna: horasFestD * valorHora * NOMINA_CONFIG.FACTORES.FESTIVO_DIURNO,
            festivaNocturna: horasFestN * valorHora * NOMINA_CONFIG.FACTORES.FESTIVO_NOCTURNO,
            extraFestivaDiurna: horasExtraFestD * valorHora * NOMINA_CONFIG.FACTORES.EXTRA_FESTIVO_DIURNO,
            extraFestivaNocturna: horasExtraFestN * valorHora * NOMINA_CONFIG.FACTORES.EXTRA_FESTIVO_NOCTURNO
        };

        const totalBonificaciones = Object.values(bonificaciones).reduce((a, b) => a + b, 0);
        const deducciones = {
            ausencias: horasAusente * valorHora,
            salud: salarioBase * NOMINA_CONFIG.DEDUCCIONES.SALUD,
            pension: salarioBase * NOMINA_CONFIG.DEDUCCIONES.PENSION
        };
        const totalDeducciones = Object.values(deducciones).reduce((a, b) => a + b, 0);
        const salarioNeto = salarioBase + totalBonificaciones - totalDeducciones;

        // Actualizar el resumen en la interfaz
        document.getElementById("nomina-empleado").textContent = empleado.nombre;
        document.getElementById("nomina-periodo-tipo-resumen").textContent = periodoTipo;
        document.getElementById("nomina-salario-base-resumen").textContent = formatCurrency(salarioBase);
        document.getElementById("nomina-bonificaciones").textContent = formatCurrency(totalBonificaciones);
        document.getElementById("nomina-deducciones").textContent = formatCurrency(totalDeducciones);
        document.getElementById("nomina-salario-neto").textContent = formatCurrency(salarioNeto);

        // Mostrar el resumen
        const resumen = document.getElementById("nomina-resumen");
        resumen.classList.remove("hidden");

        return {
            empleado,
            salarioBase,
            totalBonificaciones,
            totalDeducciones,
            salarioNeto
        };
    } catch (error) {
        console.error('Error en cálculo de nómina:', error);
        Utils.showMessage("Error al calcular nómina: " + error.message);
        throw error;
    }
}

// Función para crear el desprendible de nómina en PDF
async function generarDesprendibleNominaPDF(datosNomina) {
    console.log('Iniciando generación del desprendible de nómina en PDF:', datosNomina);
    
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        console.error('jsPDF no está disponible');
        throw new Error('jsPDF no está disponible');
    }
    
    // Crear documento en formato A4 horizontal
    const desprendible = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
    });

    console.log('Desprendible PDF creado con dimensiones:', {
        width: desprendible.internal.pageSize.width,
        height: desprendible.internal.pageSize.height
    });

    const pageWidth = desprendible.internal.pageSize.width;
    const pageHeight = desprendible.internal.pageSize.height;
    const margin = 20;
    let y = margin;

    // Configuración de estilos del desprendible
    const estilosDesprendible = {
        titulo: { size: 16, style: 'bold', color: [13, 110, 253] },
        subtitulo: { size: 12, style: 'normal', color: [33, 37, 41] },
        texto: { size: 10, style: 'normal', color: [33, 37, 41] },
        textoSmall: { size: 8, style: 'normal', color: [108, 117, 125] }
    };

    // Función helper para aplicar estilos del desprendible
    const aplicarEstiloDesprendible = (tipo) => {
        desprendible.setFontSize(estilosDesprendible[tipo].size);
        desprendible.setFont('helvetica', estilosDesprendible[tipo].style);
        desprendible.setTextColor(...estilosDesprendible[tipo].color);
    };

    // Agregar logo
    try {
        const logo = await cargarLogo();
        desprendible.addImage(logo, 'PNG', margin, y, 25, 25);
        console.log('Logo agregado al desprendible');
    } catch (error) {
        console.warn('No se pudo cargar el logo:', error);
    }

    // Encabezado con datos de la empresa
    aplicarEstiloDesprendible('titulo');
    desprendible.text("Desprendible de Nómina", pageWidth / 2, y + 10, { align: "center" });
    
    y += 20;
    aplicarEstiloDesprendible('subtitulo');
    desprendible.text(EMPRESA_CONFIG.nombre, pageWidth / 2, y, { align: "center" });
    
    y += 6;
    aplicarEstiloDesprendible('texto');
    desprendible.text(`NIT: ${EMPRESA_CONFIG.nit}`, pageWidth / 2, y, { align: "center" });
    y += 5;
    desprendible.text(EMPRESA_CONFIG.direccion, pageWidth / 2, y, { align: "center" });
    y += 5;
    desprendible.text(`${EMPRESA_CONFIG.ciudad} | Tel: ${EMPRESA_CONFIG.telefono}`, pageWidth / 2, y, { align: "center" });

    // Agregar línea separadora
    y += 8;
    desprendible.setDrawColor(222, 226, 230);
    desprendible.setLineWidth(0.5);
    desprendible.line(margin, y, pageWidth - margin - 60, y);

    // Calcular ancho disponible para las tablas (dejando espacio para el QR)
    const anchoTablas = pageWidth - (margin * 2) - 60;

    // Información del empleado
    y += 10;
    aplicarEstiloDesprendible('subtitulo');
    desprendible.text("Información del Empleado", margin, y);
    
    y += 5;
    desprendible.autoTable({
        startY: y,
        head: [['Campo', 'Valor']],
        body: [
            ['Empleado', datosNomina.datos.empleado],
            ['Documento', datosNomina.datos.documento || 'No especificado'],
            ['Periodo', `${datosNomina.datos.periodoTipo} (${formatDate(datosNomina.datos.periodoInicio)} - ${formatDate(datosNomina.datos.periodoFin)})`],
            ['Salario Base', datosNomina.datos.salarioBase]
        ],
        theme: 'grid',
        styles: { 
            fontSize: 10,
            cellPadding: 3,
            lineColor: [222, 226, 230],
            lineWidth: 0.1
        },
        headStyles: {
            fillColor: [13, 110, 253],
            textColor: 255,
            fontStyle: 'bold'
        },
        margin: { left: margin, right: margin },
        tableWidth: anchoTablas
    });

    // Detalles de la nómina
    y = desprendible.lastAutoTable.finalY + 10;
    aplicarEstiloDesprendible('subtitulo');
    desprendible.text("Detalles de Nómina", margin, y);
    
    y += 5;
    desprendible.autoTable({
        startY: y,
        head: [['Concepto', 'Valor']],
        body: [
            ['Bonificaciones', datosNomina.datos.bonificaciones],
            ['Deducciones', datosNomina.datos.deducciones],
            ['Salario Neto', datosNomina.datos.salarioNeto]
        ],
        theme: 'grid',
        styles: { 
            fontSize: 10,
            cellPadding: 3,
            lineColor: [222, 226, 230],
            lineWidth: 0.1
        },
        headStyles: {
            fillColor: [13, 110, 253],
            textColor: 255,
            fontStyle: 'bold'
        },
        margin: { left: margin, right: margin },
        tableWidth: anchoTablas
    });

    // Generar y agregar código QR
    try {
        console.log('Generando código QR para el desprendible');
        // Crear texto legible para el QR
        const textoQR = [
            'DESPRENDIBLE DE NÓMINA',
            '---------------------',
            `Empresa: ${EMPRESA_CONFIG.nombre}`,
            `NIT: ${EMPRESA_CONFIG.nit}`,
            `Empleado: ${datosNomina.datos.empleado}`,
            `Documento: ${datosNomina.datos.documento}`,
            `Periodo: ${datosNomina.datos.periodoTipo}`,
            `Fecha: ${formatDate(datosNomina.datos.periodoInicio)} - ${formatDate(datosNomina.datos.periodoFin)}`,
            `Salario Neto: ${datosNomina.datos.salarioNeto}`,
            '---------------------',
            `Generado: ${new Date().toLocaleDateString()}`
        ].join('\n');
        
        const qr = new QRious({
            value: textoQR,
            size: 1000,
            level: 'H'
        });
        
        // Posicionar QR en la parte derecha
        const tamanoQR = 50;
        const posXQR = pageWidth - margin - tamanoQR;
        const posYQR = margin;
        desprendible.addImage(qr.toDataURL(), 'PNG', posXQR, posYQR, tamanoQR, tamanoQR);
        
        // Agregar leyenda debajo del QR
        aplicarEstiloDesprendible('textoSmall');
        desprendible.text('Escanee el código QR\npara verificar', posXQR + (tamanoQR/2), posYQR + tamanoQR + 5, {
            align: 'center'
        });
        
        console.log('Código QR agregado al desprendible');
    } catch (error) {
        console.warn('No se pudo generar el código QR:', error);
    }

    // Pie de página
    aplicarEstiloDesprendible('textoSmall');
    const textoLegal = desprendible.splitTextToSize(EMPRESA_CONFIG.textoLegal, anchoTablas);
    desprendible.text(textoLegal, pageWidth / 2 - 30, pageHeight - margin - 15, { 
        align: "center"
    });
    
    desprendible.text(`Generado el ${new Date().toLocaleDateString()} | ${EMPRESA_CONFIG.sitioWeb}`, pageWidth / 2 - 30, pageHeight - margin - 8, {
        align: "center"
    });

    console.log('Desprendible de nómina generado completamente');
    return desprendible;
}

// En la función generarPdfNomina, actualizar la llamada
async function generarPdfNomina() {
    try {
        console.log('Iniciando generación de desprendible de nómina...');

        // Cargar dependencias de manera segura
        const dependenciesLoaded = await loadDependencies().catch(error => {
            console.error('Error al cargar dependencias:', error);
            throw new Error(`No se pudieron cargar las dependencias necesarias: ${error.message}`);
        });

        if (!dependenciesLoaded) {
            throw new Error('No se pudieron cargar las dependencias necesarias');
        }

        // Verificar que jsPDF esté disponible
        if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
            throw new Error('jsPDF no está disponible correctamente');
        }

        // Obtener y validar datos
        const datosNomina = obtenerDatosNomina();
        if (!datosNomina.valido) {
            throw new Error(datosNomina.mensaje);
        }

        // Crear desprendible PDF
        const desprendible = await generarDesprendibleNominaPDF(datosNomina);
        
        // Generar nombre de archivo
        const nombreArchivo = generarNombreArchivo(datosNomina.datos);

        // Guardar PDF
        console.log('Guardando desprendible como:', nombreArchivo);
        desprendible.save(nombreArchivo);
        
        console.log('Desprendible generado exitosamente');
        Utils.showMessage('Desprendible de nómina generado exitosamente', 'success');
    } catch (error) {
        console.error('Error al generar desprendible:', error);
        Utils.showMessage(`Error al generar el desprendible de nómina: ${error.message}`);
    }
}

// Función para obtener y validar datos de nómina
function obtenerDatosNomina() {
    const formularioNomina = document.getElementById('formulario-nomina');
    const datos = {
        empleado: formularioNomina.dataset.nombreEmpleado || document.getElementById("nomina-empleado")?.textContent,
        documento: document.getElementById("nomina-documento")?.value,
        periodoInicio: document.getElementById("nomina-periodo-inicio")?.value,
        periodoFin: document.getElementById("nomina-periodo-fin")?.value,
        periodoTipo: document.getElementById("nomina-periodo-tipo")?.value,
        salarioBase: document.getElementById("nomina-salario-base-resumen")?.textContent,
        bonificaciones: document.getElementById("nomina-bonificaciones")?.textContent,
        deducciones: document.getElementById("nomina-deducciones")?.textContent,
        salarioNeto: document.getElementById("nomina-salario-neto")?.textContent
    };

    if (!datos.empleado || !datos.periodoInicio || !datos.periodoFin || !datos.periodoTipo) {
        return {
            valido: false,
            mensaje: 'Faltan datos necesarios para generar el PDF'
        };
    }

    return {
        valido: true,
        datos
    };
}

// Función para generar el nombre del archivo
function generarNombreArchivo(datos) {
    const fechaArchivo = formatDate(datos.periodoFin).replace(/\//g, "-");
    return `nomina_${datos.empleado.replace(/\s+/g, "_")}_${datos.periodoTipo}_${fechaArchivo}.pdf`;
}

async function buscarEmpleado(documento) {
    try {
        console.log('Buscando empleado con documento:', documento);
        
        // Limpiar el formulario antes de buscar
        limpiarFormularioNomina();
        
        // Validar que el documento no esté vacío
        if (!documento || documento.trim() === '') {
            throw new Error('Por favor ingrese un número de documento válido');
        }

        // Construir URL con el documento como parámetro de búsqueda exacta
        const url = `/api/rrhh/empleados-list/?documento=${documento.trim()}`;
        console.log('URL de búsqueda:', url);

        const response = await Utils.makeRequest(url);
        console.log('Respuesta completa de la API:', response);

        if (!response || !Array.isArray(response) || response.length === 0) {
            throw new Error('No se encontró ningún empleado con ese documento');
        }

        const empleado = response[0];
        console.log('Datos del empleado encontrado:', empleado);

        // Verificar que los datos del empleado sean válidos
        if (!empleado.nombre || !empleado.documento || !empleado.salario) {
            console.error('Datos del empleado incompletos:', empleado);
            throw new Error('Los datos del empleado están incompletos');
        }

        // Actualizar TODOS los campos que muestran el nombre del empleado
        const elementosNombre = [
            { id: 'nomina-nombre', type: 'input' },
            { id: 'nomina-empleado', type: 'text' },
            { id: 'nombre-empleado', type: 'text' }
        ];

        elementosNombre.forEach(elemento => {
            const el = document.getElementById(elemento.id);
            if (el) {
                if (elemento.type === 'input') {
                    el.value = empleado.nombre;
                } else {
                    el.textContent = empleado.nombre;
                }
                console.log(`Nombre actualizado en ${elemento.id}:`, empleado.nombre);
            }
        });

        // Actualizar elementos que muestran el salario
        const salarioFormateado = formatCurrency(empleado.salario);
        const elementosSalario = [
            { id: 'nomina-salario-base', type: 'input' },
            { id: 'salario-base', type: 'text' },
            { id: 'nomina-salario-base-resumen', type: 'text' }
        ];

        elementosSalario.forEach(elemento => {
            const el = document.getElementById(elemento.id);
            if (el) {
                if (elemento.type === 'input') {
                    el.value = salarioFormateado;
                } else {
                    el.textContent = salarioFormateado;
                }
                console.log(`Salario actualizado en ${elemento.id}:`, salarioFormateado);
            }
        });

        // Actualizar documento en todos los elementos relevantes
        const elementosDocumento = [
            { id: 'nomina-documento', type: 'input' },
            { id: 'documento-empleado', type: 'text' }
        ];

        elementosDocumento.forEach(elemento => {
            const el = document.getElementById(elemento.id);
            if (el) {
                if (elemento.type === 'input') {
                    el.value = empleado.documento;
                } else {
                    el.textContent = empleado.documento;
                }
                console.log(`Documento actualizado en ${elemento.id}:`, empleado.documento);
            }
        });

        // Guardar datos en el formulario
        const formularioNomina = document.getElementById('formulario-nomina');
        if (formularioNomina) {
            formularioNomina.dataset.empleadoId = empleado.id;
            formularioNomina.dataset.salarioBase = empleado.salario;
            formularioNomina.dataset.nombreEmpleado = empleado.nombre;
            console.log('Datos guardados en el formulario:', {
                id: empleado.id,
                salario: empleado.salario,
                nombre: empleado.nombre
            });
        }

        // Pre-cargar el periodo actual
        const hoy = new Date();
        const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        
        const periodoInicioElement = document.getElementById('nomina-periodo-inicio');
        const periodoFinElement = document.getElementById('nomina-periodo-fin');
        
        if (periodoInicioElement) periodoInicioElement.value = primerDiaMes.toISOString().split('T')[0];
        if (periodoFinElement) periodoFinElement.value = ultimoDiaMes.toISOString().split('T')[0];

        // Habilitar campos de horas
        const camposHoras = [
            'nomina-horas-extra-diurnas',
            'nomina-horas-extra-nocturnas',
            'nomina-recargos-nocturnos',
            'nomina-horas-diurnas-festivas',
            'nomina-horas-nocturnas-festivas',
            'nomina-horas-extras-diurnas-festivas',
            'nomina-horas-extras-nocturnas-festivas',
            'nomina-horas-ausente'
        ];

        camposHoras.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.disabled = false;
                console.log(`Campo ${id} habilitado`);
            }
        });

    } catch (error) {
        console.error('Error al buscar empleado:', error);
        Utils.showMessage(error.message);
        limpiarFormularioNomina();
    }
}

// Función para limpiar el formulario de nómina
function limpiarFormularioNomina() {
    console.log('Iniciando limpieza del formulario de nómina...');
    const formularioNomina = document.getElementById('formulario-nomina');
    if (!formularioNomina) {
        console.log('No se encontró el formulario de nómina');
        return;
    }

    // Resetear el formulario
    formularioNomina.reset();

    // Limpiar el resumen
    const resumen = document.getElementById('nomina-resumen');
    if (resumen) {
        resumen.classList.add('hidden');
    }

    // Limpiar campos específicos y asegurarse de que estén vacíos
    const camposTexto = {
        'nomina-empleado': '',
        'nomina-documento': '',
        'nomina-salario-base': '',
        'nomina-bonificaciones': '',
        'nomina-deducciones': '',
        'nomina-salario-neto': '',
        'nomina-periodo-inicio': '',
        'nomina-periodo-fin': ''
    };

    for (const [id, valor] of Object.entries(camposTexto)) {
        const elemento = document.getElementById(id);
        if (elemento) {
            if (elemento.tagName === 'INPUT') {
                elemento.value = valor;
            } else {
                elemento.textContent = valor;
            }
            console.log(`Campo ${id} limpiado`);
        } else {
            console.log(`No se encontró el elemento ${id}`);
        }
    }

    // Limpiar y deshabilitar campos de horas
    const camposHoras = [
        'nomina-horas-extra-diurnas',
        'nomina-horas-extra-nocturnas',
        'nomina-recargos-nocturnos',
        'nomina-horas-diurnas-festivas',
        'nomina-horas-nocturnas-festivas',
        'nomina-horas-extras-diurnas-festivas',
        'nomina-horas-extras-nocturnas-festivas',
        'nomina-horas-ausente'
    ];

    camposHoras.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.value = '0';
            elemento.disabled = true;
            console.log(`Campo ${id} reseteado y deshabilitado`);
        } else {
            console.log(`No se encontró el elemento ${id}`);
        }
    });

    // Limpiar datos almacenados en el dataset
    formularioNomina.dataset.empleadoId = '';
    formularioNomina.dataset.salarioBase = '';
    formularioNomina.dataset.nombreEmpleado = '';
    
    console.log('Formulario limpiado completamente');
}

// Inicialización del módulo de nómina
function initNominaModule() {
    const formularioNomina = document.getElementById('formulario-nomina');
    if (!formularioNomina) return;

    // Evento para buscar empleado cuando se ingresa el documento
    const inputDocumento = document.getElementById('nomina-documento');
    if (inputDocumento) {
        // Remover eventos previos si existen
        const oldBlurHandler = inputDocumento.onblur;
        const oldInputHandler = inputDocumento.oninput;
        if (oldBlurHandler) inputDocumento.removeEventListener('blur', oldBlurHandler);
        if (oldInputHandler) inputDocumento.removeEventListener('input', oldInputHandler);
        
        inputDocumento.addEventListener('blur', async function() {
            const documento = this.value.trim();
            if (!documento) {
                limpiarFormularioNomina();
                Utils.showMessage('Por favor ingrese un número de documento');
                return;
            }

            try {
                await buscarEmpleado(documento);
            } catch (error) {
                Utils.showMessage(error.message);
            }
        });

        // Agregar evento para limpiar cuando el campo está vacío
        inputDocumento.addEventListener('input', function() {
            if (!this.value.trim()) {
                limpiarFormularioNomina();
            }
        });
    }

    // Evento submit del formulario
    formularioNomina.addEventListener('submit', async (e) => {
        e.preventDefault();
        const empleadoId = formularioNomina.dataset.empleadoId;
        if (!empleadoId) {
            Utils.showMessage('Por favor, primero busque un empleado válido');
            return;
        }
        try {
            await calcularNomina(empleadoId);
        } catch (error) {
            Utils.showMessage(error.message);
        }
    });

    // Evento para limpiar formulario
    const botonLimpiar = document.getElementById('limpiar-formulario');
    if (botonLimpiar) {
        botonLimpiar.addEventListener('click', limpiarFormularioNomina);
    }

    // Evento para generar PDF
    const botonGenerarPDF = document.getElementById('generar-pdf');
    if (botonGenerarPDF) {
        botonGenerarPDF.addEventListener('click', () => {
            const resumen = document.getElementById('nomina-resumen');
            if (resumen.classList.contains('hidden')) {
                Utils.showMessage('Por favor, primero calcule la nómina');
                return;
            }
            generarPdfNomina();
        });
    }

    // Evento para recalcular cuando cambia el tipo de periodo
    const selectPeriodo = document.getElementById('nomina-periodo-tipo');
    if (selectPeriodo) {
        selectPeriodo.addEventListener('change', function() {
            // No calcular automáticamente, solo actualizar el período si es necesario
            const resumen = document.getElementById('nomina-resumen');
            if (resumen) {
                resumen.classList.add('hidden');
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

        // Inicialización de la sección de ausentismos
        if (document.getElementById('ausentismos-panel')) {
            // Cargar datos iniciales
            EntityManager.loadAusentismos();

            // Inicializar el formulario y sus eventos
            EntityManager.initAusentismosForm();

            // Manejar el formulario de ausentismos
            const formAusentismos = document.getElementById('form-ausentismos');
            if (formAusentismos) {
                formAusentismos.addEventListener('submit', (e) => EntityManager.saveAusentismo(e));
            }

            // Manejar el botón de limpiar
            const btnLimpiar = document.getElementById('limpiar-ausentismos');
            if (btnLimpiar) {
                btnLimpiar.addEventListener('click', () => {
                    const form = document.getElementById('form-ausentismos');
                    form.reset();
                    form.classList.remove('was-validated');
                    // Ocultar ambos contenedores de detalles
                    document.getElementById('horas-extras-detalles').classList.add('d-none');
                    document.getElementById('ausentismo-duracion').classList.add('d-none');
                });
            }

            // Cargar lista de empleados
            const empleadoSelect = document.getElementById('ausentismos-empleado');
            if (empleadoSelect) {
                Utils.makeRequest('/api/rrhh/empleados/')
                    .then(empleados => {
                        empleadoSelect.innerHTML = '<option value="">Seleccione un empleado</option>';
                        empleados.forEach(emp => {
                            const option = document.createElement('option');
                            option.value = emp.id;
                            option.textContent = emp.nombre;
                            option.setAttribute('data-documento', emp.documento);
                            empleadoSelect.appendChild(option);
                        });
                    })
                    .catch(error => Utils.showMessage(`Error al cargar empleados: ${error.message}`));
            }

            // Manejar filtros de la tabla
            const filtros = {
                todos: document.getElementById('filtro-todos'),
                ausentismos: document.getElementById('filtro-ausentismos'),
                horasExtras: document.getElementById('filtro-horas-extras')
            };

            function aplicarFiltro(tipo = null) {
                const rows = document.querySelectorAll('#tabla-ausentismos tbody tr');
                rows.forEach(row => {
                    if (!tipo) {
                        row.style.display = '';
                    } else if (tipo === 'ausentismo') {
                        row.style.display = row.dataset.tipo === 'ausentismo' ? '' : 'none';
                    } else if (tipo === 'horas_extras') {
                        row.style.display = row.dataset.tipo.startsWith('hora_extra') ? '' : 'none';
                    }
                });
            }

            Object.entries(filtros).forEach(([key, btn]) => {
                if (btn) {
                    btn.addEventListener('click', () => {
                        Object.values(filtros).forEach(b => b?.classList.remove('active'));
                        btn.classList.add('active');
                        aplicarFiltro(key === 'todos' ? null : key === 'ausentismos' ? 'ausentismo' : 'horas_extras');
                    });
                }
            });
        }

        console.log('Inicialización completada con éxito');
    } catch (error) {
        console.error('Error durante la inicialización:', error);
    }
});

// Funciones auxiliares para el formato de la tabla
function getBadgeClass(tipo) {
    switch(tipo) {
        case 'ausentismo': return 'bg-danger';
        case 'hora_extra_diurna': return 'bg-success';
        case 'hora_extra_nocturna': return 'bg-primary';
        case 'hora_extra_dominical': return 'bg-warning';
        default: return 'bg-secondary';
    }
}

function getTipoTexto(tipo) {
    switch(tipo) {
        case 'ausentismo': return 'Ausentismo';
        case 'hora_extra_diurna': return 'H.E. Diurna';
        case 'hora_extra_nocturna': return 'H.E. Nocturna';
        case 'hora_extra_dominical': return 'H.E. Dominical';
        default: return tipo;
    }
}

