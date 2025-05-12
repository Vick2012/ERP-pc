// Configuración de módulos para Proveedores, Clientes y Recursos Humanos
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
        apiUrl: "/api/clientes/",
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
        apiUrl: "/api/rrhh/empleados/",
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
        tableHeaders: ["ID", "Nombre", "Tipo de Documento", "Documento", "Fecha de Ingreso", "Cargo", "Salario", "Área", "Teléfono", "Correo", "Contrato", "Contacto", "Acciones"],
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
            item.contacto,
        ],
        searchFields: ["nombre", "tipo_documento", "documento", "fecha_ingreso", "cargo", "salario", "area", "telefono", "correo", "contrato", "contacto"],
    },
};

// Utilidades para manejar solicitudes HTTP, tokens CSRF y mensajes al usuario
const Utils = {
    getCsrfToken() {
        const token = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
        if (token) return token;
        const name = 'csrftoken';
        const cookie = document.cookie.split(';').find(c => c.trim().startsWith(name + '='));
        return cookie ? decodeURIComponent(cookie.split('=')[1]) : (() => { throw new Error("Token CSRF no encontrado."); })();
    },

    async makeRequest(url, method = 'GET', data = null) {
        const headers = { 'Content-Type': 'application/json' };
        if (['POST', 'PUT', 'DELETE'].includes(method)) headers['X-CSRFToken'] = this.getCsrfToken();
        const options = { method, headers };
        if (data) options.body = JSON.stringify(data);
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.detail || `Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            throw new Error(`Error en la solicitud a ${url}: ${error.message}`);
        }
    },

    showMessage(message, type = 'error') {
        console.log(`Mensaje: ${message}, Tipo: ${type}`);
        alert(message);
    },
};

// Gestión de entidades (empleados, proveedores, clientes, ausentismos, liquidaciones)
const EntityManager = {
    async loadData(tipo) {
        try {
            const data = await Utils.makeRequest(CONFIG[tipo].apiUrl);
            this.renderTable(tipo, data);
        } catch (error) {
            console.error(`Error al cargar ${tipo}:`, error);
            Utils.showMessage(`Error al cargar ${tipo}: ${error.message}`);
        }
    },

    renderTable(tipo, data) {
        const { tableId, getRowData } = CONFIG[tipo];
        const table = document.getElementById(tableId);
        const tbody = table.querySelector("tbody");
        tbody.innerHTML = "";
        data.forEach(item => {
            const row = document.createElement('tr');
            const cells = getRowData(item).map(cell => `<td>${cell}</td>`).join('');
            const actionCell = `
            <td class="text-nowrap">
                <button class="btn btn-warning btn-sm me-1"
                    onclick="EntityManager.editEntity('${tipo}', ${item.id})">Editar</button>
                <button class="btn btn-danger btn-sm"
                    onclick="EntityManager.deleteEntity('${tipo}', ${item.id})">Eliminar</button>
            </td>`;
            row.innerHTML = cells + actionCell;
            tbody.appendChild(row);
        });
    },

    searchData(tipo) {
        const { apiUrl, searchFields } = CONFIG[tipo];
        const searchTerm = document.getElementById(`search-${tipo}`).value.toLowerCase();
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const filtered = data.filter(item =>
                    searchFields.some(field => item[field]?.toLowerCase().includes(searchTerm))
                );
                this.renderTable(tipo, filtered);
            })
            .catch(error => {
                console.error(`Error al buscar ${tipo}:`, error);
                Utils.showMessage(`Error al buscar ${tipo}: ${error.message}`);
            });
    },

    async editEntity(tipo, id) {
        try {
            const { apiUrl, fields, formId } = CONFIG[tipo];
            const item = await Utils.makeRequest(`${apiUrl}${id}/`);
            fields.forEach(field => {
                const element = document.getElementById(field.id);
                if (element.tagName === 'SELECT') {
                    element.value = item[field.key] || '';
                } else {
                    element.value = item[field.key] || '';
                }
            });
            document.getElementById(`${tipo}-id`).value = id;
            if (document.getElementById(formId).classList.contains('hidden')) this.toggleForm(tipo);
        } catch (error) {
            console.error(`Error al editar ${tipo}:`, error);
            Utils.showMessage(`Error al cargar ${tipo} para editar: ${error.message}`);
        }
    },

    async deleteEntity(tipo, id) {
        if (!confirm(`¿Eliminar ${tipo.slice(0, -1)} con ID ${id}?`)) return;
        try {
            const { apiUrl } = CONFIG[tipo];
            await Utils.makeRequest(`${apiUrl}${id}/`, 'DELETE');
            Utils.showMessage(`${tipo.slice(0, -1)} eliminado`, 'success');
            this.loadData(tipo);
        } catch (error) {
            console.error(`Error al eliminar ${tipo}:`, error);
            Utils.showMessage(`Error al eliminar ${tipo}: ${error.message}`);
        }
    },

    async saveEntity(tipo) {
        try {
            const { apiUrl, fields } = CONFIG[tipo];
            const data = Object.fromEntries(fields.map(field => [field.key, document.getElementById(field.id).value || '']));
            const requiredFields = fields.filter(f => f.required);
            if (requiredFields.some(f => !data[f.key])) {
                Utils.showMessage('Completa todos los campos obligatorios.');
                return;
            }
            const id = document.getElementById(`${tipo}-id`)?.value;
            const method = id ? 'PUT' : 'POST';
            const url = id ? `${apiUrl}${id}/` : apiUrl;
            console.log(`Enviando solicitud ${method} a ${url} con datos:`, data);
            const response = await Utils.makeRequest(url, method, data);
            console.log('Respuesta de la API:', response);
            Utils.showMessage(`${tipo.slice(0, -1)} guardado`, 'success');
            this.loadData(tipo);
            this.clearForm(tipo);
        } catch (error) {
            console.error(`Error al guardar ${tipo}:`, error);
            Utils.showMessage(`Error al guardar ${tipo}: ${error.message}`);
        }
    },

    async loadLiquidacion() {
        try {
            const data = await Utils.makeRequest('/api/rrhh/liquidaciones/');
            const table = document.getElementById('tabla-liquidacion');
            const tbody = table.querySelector('tbody');
            tbody.innerHTML = '';
            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
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
                tbody.appendChild(row);
            });
        } catch (error) {
            Utils.showMessage(`Error al cargar liquidaciones: ${error.message}`);
        }
    },

    async loadAusentismos() {
        try {
            const data = await Utils.makeRequest('/api/rrhh/ausentismos/');
            const table = document.getElementById('tabla-ausentismos');
            const tbody = table.querySelector('tbody');
            tbody.innerHTML = '';
            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.empleado_nombre || item.empleado}</td>
                    <td>${item.tipo}</td>
                    <td>${item.fecha}</td>
                    <td>${item.duracion}</td>
                    <td>${item.motivo || 'N/A'}</td>
                `;
                tbody.appendChild(row);
            });
        } catch (error) {
            Utils.showMessage(`Error al cargar ausentismos: ${error.message}`);
        }
    },

    async saveAusentismo() {
        const empleadoId = document.getElementById('ausentismos-empleado').value;
        const fecha = document.getElementById('ausentismos-fecha').value;
        const tipo = document.getElementById('ausentismos-tipo').value;
        const duracion = parseFloat(document.getElementById('ausentismos-duracion').value);
        const motivo = document.getElementById('ausentismos-motivo').value || '';

        if (!empleadoId || !fecha || !tipo || !duracion) {
            Utils.showMessage('Completa todos los campos obligatorios.');
            return;
        }

        const payload = { empleado: empleadoId, fecha, tipo, duracion, motivo };
        try {
            const response = await Utils.makeRequest(tipo === 'ausentismo' ? '/api/rrhh/ausentismos/' : '/api/rrhh/horas_extras/', 'POST', payload);
            Utils.showMessage('Registro guardado', 'success');
            document.getElementById('ausentismos-empleado').value = '';
            document.getElementById('ausentismos-fecha').value = '';
            document.getElementById('ausentismos-tipo').value = '';
            document.getElementById('ausentismos-duracion').value = '';
            document.getElementById('ausentismos-motivo').value = '';
            this.loadAusentismos();
        } catch (error) {
            Utils.showMessage(`Error al registrar: ${error.message}`);
        }
    },

    toggleForm(tipo) {
        document.getElementById(CONFIG[tipo].formId).classList.toggle('hidden');
    },

    clearForm(tipo) {
        const { fields } = CONFIG[tipo];
        fields.forEach(field => document.getElementById(field.id).value = '');
        const idField = document.getElementById(`${tipo}-id`);
        if (idField) idField.value = '';
        this.toggleForm(tipo);
    },
};

// Manejo de autenticación y eventos de login/registro/contacto
const AuthManager = {
    async checkAuth(url) {
        const response = await fetch('/api/auth/status/', { method: 'GET', headers: { 'Content-Type': 'application/json' } });
        const data = await response.json();
        if (data.authenticated) window.location.href = url;
        else {
            Utils.showMessage('Inicia sesión para acceder.');
            new bootstrap.Modal(document.getElementById('loginModal')).show();
        }
    },

    async verifyAuth() {
        const response = await fetch('/api/auth/status/').catch(console.error);
        if (response?.ok) {
            const data = await response.json();
            ['buy-erp-btn', 'login-btn', 'register-btn', 'logout-btn'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = data.authenticated ? (id === 'buy-erp-btn' || id === 'logout-btn' ? 'inline-block' : 'none') : (id === 'login-btn' || id === 'register-btn' ? 'inline-block' : 'none');
            });
        }
    },

    showModal(modalId) {
        new bootstrap.Modal(document.getElementById(modalId)).show();
    },

    async login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        if (!username || !password) return Utils.showMessage('Completa todos los campos.');
        const response = await fetch('/api/auth/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': Utils.getCsrfToken() },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (data.success) {
            ['login-btn', 'register-btn', 'logout-btn', 'buy-erp-btn'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = id === 'logout-btn' || id === 'buy-erp-btn' ? 'inline-block' : 'none';
            });
            bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
            this.verifyAuth();
        } else Utils.showMessage('Error al iniciar sesión: ' + (data.error || 'Credenciales inválidas'));
    },

    async register() {
        const [name, email, username, password] = ['register-name', 'register-email', 'register-username', 'register-password']
            .map(id => document.getElementById(id).value.trim());
        const errorDiv = document.getElementById('register-error');
        if (!name || !email || !username || !password) return Utils.showMessage('Completa todos los campos.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Utils.showMessage('Correo inválido.');
        if (password.length < 8) return Utils.showMessage('Contraseña debe tener 8+ caracteres.');
        if (username.length < 3) return Utils.showMessage('Usuario debe tener 3+ caracteres.');
        const response = await fetch('/api/auth/register/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': Utils.getCsrfToken() },
            body: JSON.stringify({ name, email, username, password })
        });
        const data = await response.json();
        if (data.success) {
            Utils.showMessage('Usuario registrado. Inicia sesión.', 'success');
            setTimeout(() => {
                bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
                document.getElementById('register-form').reset();
            }, 2000);
        } else Utils.showMessage('Error al registrar: ' + (data.error || 'Error desconocido'));
    },

    async sendContact() {
        const [name, email, message] = ['contact-name', 'contact-email', 'contact-message']
            .map(id => document.getElementById(id).value);
        if (!name || !email || !message) return Utils.showMessage('Completa todos los campos.');
        const response = await fetch('/api/auth/save-contact/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': Utils.getCsrfToken() },
            body: JSON.stringify({ name, email, message })
        });
        const data = await response.json();
        if (data.success) {
            Utils.showMessage('Mensaje enviado. Te contactaremos pronto.', 'success');
            document.getElementById('contact-form').reset();
        } else Utils.showMessage('Error al enviar: ' + (data.error || 'Error desconocido'));
    },
};

// Inicialización de la página y eventos al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('Página cargada, inicializando...');
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

    AuthManager.verifyAuth();

    document.querySelectorAll('#login-btn, #register-btn').forEach(btn => {
        btn.addEventListener('click', () => AuthManager.showModal(btn.id === 'login-btn' ? 'loginModal' : 'registerModal'));
    });

    if (document.getElementById("tabla-nomina")) {
        cargarTablaNomina();
    }

    if (document.getElementById('tabla-liquidacion')) {
        EntityManager.loadLiquidacion();
    }

    if (document.getElementById('tabla-ausentismos')) {
        EntityManager.loadAusentismos();
        const ausentismoTipo = document.getElementById('ausentismos-tipo');
        ausentismoTipo.addEventListener('change', () => {
            const motivoContainer = document.getElementById('ausentismos-motivo-container');
            if (ausentismoTipo.value === 'ausentismo') {
                motivoContainer.classList.remove('hidden');
            } else {
                motivoContainer.classList.add('hidden');
            }
        });
        const empleadoSelect = document.getElementById('ausentismos-empleado');
        Utils.makeRequest('/api/rrhh/empleados/')
            .then(empleados => {
                empleados.forEach(emp => {
                    const option = document.createElement('option');
                    option.value = emp.id;
                    option.textContent = emp.nombre;
                    empleadoSelect.appendChild(option);
                });
            })
            .catch(err => Utils.showMessage(`Error al cargar empleados: ${err.message}`));
    }

    const addRecursosHumanosBtn = document.getElementById("add-recursos_humanos");
    if (addRecursosHumanosBtn) {
        addRecursosHumanosBtn.addEventListener("click", () => {
            const formulario = document.getElementById("formulario-recursos_humanos");
            const isHidden = formulario.classList.contains("hidden");
            if (isHidden) {
                formulario.classList.remove("hidden");
                formulario.reset();
                document.getElementById("recursos_humanos-id").value = "";
            } else {
                formulario.classList.add("hidden");
            }
        });
    }

    const cancelRecursosHumanosBtn = document.getElementById("cancel-recursos_humanos");
    if (cancelRecursosHumanosBtn) {
        cancelRecursosHumanosBtn.addEventListener("click", () => {
            EntityManager.clearForm("recursos_humanos");
        });
    }

    const inputDocumento = document.getElementById("documento-recursos_humanos");
    if (inputDocumento) {
        inputDocumento.addEventListener("blur", async function () {
            const documento = this.value.trim();
            if (documento) {
                try {
                    const empleados = await Utils.makeRequest('/api/rrhh/empleados/');
                    const empleado = empleados.find(e => e.documento === documento);
                    if (empleado) {
                        CONFIG.recursos_humanos.fields.forEach(field => {
                            const element = document.getElementById(field.id);
                            if (element) element.value = empleado[field.key] || '';
                        });
                        document.getElementById('recursos_humanos-id').value = empleado.id;
                    } else {
                        Utils.showMessage('Empleado no encontrado.');
                        CONFIG.recursos_humanos.fields.forEach(field => {
                            if (field.id !== 'documento-recursos_humanos') {
                                const element = document.getElementById(field.id);
                                if (element) element.value = '';
                            }
                        });
                        document.getElementById('recursos_humanos-id').value = '';
                    }
                } catch (error) {
                    Utils.showMessage(`Error al buscar empleado: ${error.message}`);
                }
            }
        });
    }

    const nominaDocumento = document.getElementById('nomina-documento');
    if (nominaDocumento) {
        nominaDocumento.addEventListener('blur', async function () {
            const documento = this.value.trim();
            if (documento) {
                try {
                    const empleados = await Utils.makeRequest('/api/rrhh/empleados/');
                    const empleado = empleados.find(e => e.documento === documento);
                    if (empleado) {
                        document.getElementById('nomina-nombre').value = empleado.nombre;
                        document.getElementById('nomina-salario-base').value = empleado.salario;
                        document.getElementById('formulario-nomina').dataset.empleadoId = empleado.id;
                    } else {
                        Utils.showMessage('Empleado no encontrado.');
                        document.getElementById('nomina-nombre').value = '';
                        document.getElementById('nomina-salario-base').value = '';
                        document.getElementById('formulario-nomina').dataset.empleadoId = '';
                    }
                } catch (error) {
                    Utils.showMessage(`Error al buscar empleado: ${error.message}`);
                }
            }
        });
    }

    const guardarAusentismoBtn = document.getElementById('guardar-ausentismo');
    if (guardarAusentismoBtn) {
        guardarAusentismoBtn.addEventListener('click', () => EntityManager.saveAusentismo());
    }
});

// Cálculo de nómina según las leyes colombianas (corregido para quincena)
async function calcularNomina(id) {
    try {
        // Obtener datos del empleado desde la API
        const empleado = await Utils.makeRequest(`/api/rrhh/empleados/${id}/`);
        const salarioBaseMensual = parseFloat(empleado.salario); // Salario base mensual
        const salarioBaseQuincenal = salarioBaseMensual / 2; // Salario base para quincena
        const salarioDiario = salarioBaseQuincenal / 15; // Salario diario (15 días por quincena)
        const valorHora = salarioDiario / 8; // Valor de una hora normal (8 horas diarias)

        // Obtener valores de los campos del formulario
        const horasExtraDiurnas = parseFloat(document.getElementById("nomina-horas-extra-diurnas").value) || 0;
        const horasExtraNocturnas = parseFloat(document.getElementById("nomina-horas-extra-nocturnas").value) || 0;
        const recargosNocturnos = parseFloat(document.getElementById("nomina-recargos-nocturnos").value) || 0;
        const horasDiurnasFestivas = parseFloat(document.getElementById("nomina-horas-diurnas-festivas").value) || 0;
        const horasNocturnasFestivas = parseFloat(document.getElementById("nomina-horas-nocturnas-festivas").value) || 0;
        const horasExtrasDiurnasFestivas = parseFloat(document.getElementById("nomina-horas-extras-diurnas-festivas").value) || 0;
        const horasExtrasNocturnasFestivas = parseFloat(document.getElementById("nomina-horas-extras-nocturnas-festivas").value) || 0;
        const horasAusente = parseFloat(document.getElementById("nomina-horas-ausente").value) || 0;

        // Calcular bonificaciones según las leyes colombianas
        const bonificacionExtraDiurna = horasExtraDiurnas * valorHora * 1.25; // 1.25x por horas extras diurnas
        const bonificacionExtraNocturna = horasExtraNocturnas * valorHora * 1.75; // 1.75x por horas extras nocturnas
        const bonificacionRecargoNocturno = recargosNocturnos * valorHora * 1.35; // 1.35x por recargos nocturnos
        const bonificacionDiurnaFestiva = horasDiurnasFestivas * valorHora * 1.75; // 1.75x por horas diurnas festivas
        const bonificacionNocturnaFestiva = horasNocturnasFestivas * valorHora * 2.0; // 2.0x por horas nocturnas festivas
        const bonificacionExtraDiurnaFestiva = horasExtrasDiurnasFestivas * valorHora * 2.0; // 2.0x por horas extras diurnas festivas
        const bonificacionExtraNocturnaFestiva = horasExtrasNocturnasFestivas * valorHora * 2.5; // 2.5x por horas extras nocturnas festivas
        const descuentosAusencias = horasAusente * valorHora; // Descuento por ausencias (sin recargo)
        const deduccionesLegales = salarioBaseQuincenal * 0.08; // 8% de deducciones legales sobre la quincena

        // Calcular totales
        const bonificacionesTotales = bonificacionExtraDiurna + bonificacionExtraNocturna + bonificacionRecargoNocturno +
            bonificacionDiurnaFestiva + bonificacionNocturnaFestiva + bonificacionExtraDiurnaFestiva +
            bonificacionExtraNocturnaFestiva;
        const deduccionesTotales = descuentosAusencias + deduccionesLegales;
        const salarioNeto = salarioBaseQuincenal + bonificacionesTotales - deduccionesTotales;

        // Actualizar el resumen en la interfaz
        document.getElementById("nomina-empleado").innerText = empleado.nombre;
        document.getElementById("nomina-salario-base-resumen").innerText = `$${salarioBaseQuincenal.toFixed(2)}`;
        document.getElementById("nomina-bonificaciones").innerText = `$${bonificacionesTotales.toFixed(2)}`;
        document.getElementById("nomina-deducciones").innerText = `$${deduccionesTotales.toFixed(2)}`;
        document.getElementById("nomina-salario-neto").innerText = `$${salarioNeto.toFixed(2)}`;
        document.getElementById("nomina-resumen").classList.remove("hidden");

        // Guardar los valores calculados en el formulario para usarlos al guardar
        document.getElementById("formulario-nomina").dataset.horasExtraDiurnas = horasExtraDiurnas;
        document.getElementById("formulario-nomina").dataset.horasExtraNocturnas = horasExtraNocturnas;
        document.getElementById("formulario-nomina").dataset.recargosNocturnos = recargosNocturnos;
        document.getElementById("formulario-nomina").dataset.horasDiurnasFestivas = horasDiurnasFestivas;
        document.getElementById("formulario-nomina").dataset.horasNocturnasFestivas = horasNocturnasFestivas;
        document.getElementById("formulario-nomina").dataset.horasExtrasDiurnasFestivas = horasExtrasDiurnasFestivas;
        document.getElementById("formulario-nomina").dataset.horasExtrasNocturnasFestivas = horasExtrasNocturnasFestivas;
        document.getElementById("formulario-nomina").dataset.horasAusente = horasAusente;
    } catch (error) {
        Utils.showMessage("Error al calcular nómina: " + error.message);
    }
}

// Carga de tabla de nómina con datos de empleados
function cargarTablaNomina() {
    Utils.makeRequest("/api/rrhh/empleados/")
        .then(empleados => {
            const tbody = document.querySelector("#tabla-nomina tbody");
            if (!tbody) return; // Evitar error si la tabla no existe
            tbody.innerHTML = "";
            empleados.forEach(emp => {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${emp.id}</td>
                    <td>${emp.nombre}</td>
                    <td>$${parseFloat(emp.salario).toFixed(2)}</td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="calcularNomina(${emp.id})">Calcular</button>
                    </td>
                `;
                tbody.appendChild(fila);
            });
        })
        .catch(err => Utils.showMessage("Error al cargar empleados: " + err.message));
}

// CALCULAR Y GUARDAR NÓMINA 

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formulario-nomina");
    const resumen = document.getElementById("nomina-resumen");

    if (!form) return;

    // CALCULAR NÓMINA 
    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        const id = this.dataset.empleadoId;
        if (!id) return Utils.showMessage("⚠️ Primero ingresa un documento válido.");

        try {
            const empleado = await Utils.makeRequest(`/api/rrhh/empleados/${id}/`);
            const salarioMensual = parseFloat(empleado.salario);
            const salarioQuincenal = salarioMensual / 2;
            const valorHora = salarioQuincenal / 15 / 8;

            const getVal = id => parseFloat(document.getElementById(id).value) || 0;
            const horasExtraD = getVal("nomina-horas-extra-diurnas");
            const horasExtraN = getVal("nomina-horas-extra-nocturnas");
            const recargosNoc = getVal("nomina-recargos-nocturnos");
            const horasFestD = getVal("nomina-horas-diurnas-festivas");
            const horasFestN = getVal("nomina-horas-nocturnas-festivas");
            const horasExtraFestD = getVal("nomina-horas-extras-diurnas-festivas");
            const horasExtraFestN = getVal("nomina-horas-extras-nocturnas-festivas");
            const horasAusente = getVal("nomina-horas-ausente");

            const bonif =
                horasExtraD * valorHora * 1.25 +
                horasExtraN * valorHora * 1.75 +
                recargosNoc * valorHora * 1.35 +
                horasFestD * valorHora * 1.75 +
                horasFestN * valorHora * 2.0 +
                horasExtraFestD * valorHora * 2.0 +
                horasExtraFestN * valorHora * 2.5;
            const deducciones = salarioQuincenal * 0.08 + horasAusente * valorHora;
            const salarioNeto = salarioQuincenal + bonif - deducciones;

            document.getElementById("nomina-empleado").innerText = empleado.nombre;
            document.getElementById("nomina-salario-base-resumen").innerText = `$${salarioQuincenal.toFixed(2)}`;
            document.getElementById("nomina-bonificaciones").innerText = `$${bonif.toFixed(2)}`;
            document.getElementById("nomina-deducciones").innerText = `$${deducciones.toFixed(2)}`;
            document.getElementById("nomina-salario-neto").innerText = `$${salarioNeto.toFixed(2)}`;
            resumen.classList.remove("hidden");

            Object.assign(form.dataset, {
                horasExtraDiurnas: horasExtraD,
                horasExtraNocturnas: horasExtraN,
                recargosNocturnos: recargosNoc,
                horasDiurnasFestivas: horasFestD,
                horasNocturnasFestivas: horasFestN,
                horasExtrasDiurnasFestivas: horasExtraFestD,
                horasExtrasNocturnasFestivas: horasExtraFestN,
                horasAusente: horasAusente
            });

        } catch (err) {
            Utils.showMessage("❌ Error al calcular nómina: " + err.message);
        }
    });
});

// GUARDAR NÓMINA  
document.addEventListener("DOMContentLoaded", () => {
    console.log("Página cargada, inicializando...");

    const form = document.getElementById("formulario-nomina");
    const resumen = document.getElementById("nomina-resumen");
    const generarPdfBtn = document.getElementById("generar-pdf");

    if (!form) return;

    // Calcular Nómina
    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        const id = this.dataset.empleadoId;
        if (!id) return Utils.showMessage("⚠️ Primero ingresa un documento válido.");

        try {
            const empleado = await Utils.makeRequest(`/api/rrhh/empleados/${id}/`);
            const salarioMensual = parseFloat(empleado.salario);
            const salarioQuincenal = salarioMensual / 2;
            const valorHora = salarioQuincenal / 15 / 8;

            const getVal = id => parseFloat(document.getElementById(id).value) || 0;
            const horasExtraD = getVal("nomina-horas-extra-diurnas");
            const horasExtraN = getVal("nomina-horas-extra-nocturnas");
            const recargosNoc = getVal("nomina-recargos-nocturnos");
            const horasFestD = getVal("nomina-horas-diurnas-festivas");
            const horasFestN = getVal("nomina-horas-nocturnas-festivas");
            const horasExtraFestD = getVal("nomina-horas-extras-diurnas-festivas");
            const horasExtraFestN = getVal("nomina-horas-extras-nocturnas-festivas");
            const horasAusente = getVal("nomina-horas-ausente");

            const bonif =
                horasExtraD * valorHora * 1.25 +
                horasExtraN * valorHora * 1.75 +
                recargosNoc * valorHora * 1.35 +
                horasFestD * valorHora * 1.75 +
                horasFestN * valorHora * 2.0 +
                horasExtraFestD * valorHora * 2.0 +
                horasExtraFestN * valorHora * 2.5;

            const deducciones = salarioQuincenal * 0.08 + horasAusente * valorHora;
            const salarioNeto = salarioQuincenal + bonif - deducciones;

            document.getElementById("nomina-empleado").innerText = empleado.nombre;
            document.getElementById("nomina-salario-base-resumen").innerText = `$${salarioQuincenal.toFixed(2)}`;
            document.getElementById("nomina-bonificaciones").innerText = `$${bonif.toFixed(2)}`;
            document.getElementById("nomina-deducciones").innerText = `$${deducciones.toFixed(2)}`;
            document.getElementById("nomina-salario-neto").innerText = `$${salarioNeto.toFixed(2)}`;

            resumen.classList.remove("hidden");
            if (generarPdfBtn) generarPdfBtn.style.display = "inline-block"; // Only set if not null
            Object.assign(form.dataset, {
                horasExtraDiurnas: horasExtraD,
                horasExtraNocturnas: horasExtraN,
                recargosNocturnos: recargosNoc,
                horasDiurnasFestivas: horasFestD,
                horasNocturnasFestivas: horasFestN,
                horasExtrasDiurnasFestivas: horasExtraFestD,
                horasExtrasNocturnasFestivas: horasExtraFestN,
                horasAusente: horasAusente
            });
        } catch (err) {
            Utils.showMessage("❌ Error al calcular nómina: " + err.message);
        }
    });

    // Guardar Nómina
    document.getElementById("guardar-nomina").addEventListener("click", async function () {
        const id = form.dataset.empleadoId;
        const inicio = document.getElementById("nomina-periodo-inicio").value;
        const fin = document.getElementById("nomina-periodo-fin").value;

        if (!id || !inicio || !fin) return Utils.showMessage("⚠️ Campos incompletos.");

        try {
            const empleado = await Utils.makeRequest(`/api/rrhh/empleados/${id}/`);
            const salarioBase = parseFloat(empleado.salario) / 2;

            const payload = {
                empleado: parseInt(id),
                periodo_inicio: inicio,
                periodo_fin: fin,
                salario_base: salarioBase,
                deducciones: parseFloat(document.getElementById("nomina-deducciones").innerText.replace(/[$,]/g, "")),
                bonificaciones: parseFloat(document.getElementById("nomina-bonificaciones").innerText.replace(/[$,]/g, "")),
                salario_neto: parseFloat(document.getElementById("nomina-salario-neto").innerText.replace(/[$,]/g, "")),
                horas_extra_diurnas: parseFloat(form.dataset.horasExtraDiurnas) || 0,
                horas_extra_nocturnas: parseFloat(form.dataset.horasExtraNocturnas) || 0,
                recargos_nocturnos: parseFloat(form.dataset.recargosNocturnos) || 0,
                horas_diurnas_festivas: parseFloat(form.dataset.horasDiurnasFestivas) || 0,
                horas_nocturnas_festivas: parseFloat(form.dataset.horasNocturnasFestivas) || 0,
                horas_extras_diurnas_festivas: parseFloat(form.dataset.horasExtrasDiurnasFestivas) || 0,
                horas_extras_nocturnas_festivas: parseFloat(form.dataset.horasExtrasNocturnasFestivas) || 0,
                horas_ausente: parseFloat(form.dataset.horasAusente) || 0
            };

            const res = await fetch("/api/rrhh/nominas/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": Utils.getCsrfToken()
                },
                body: JSON.stringify(payload)
            });

            const responseData = await res.json();
            if (!res.ok) throw new Error(responseData.detail || "Error al guardar nómina.");

            const nominaId = responseData.id;
            Utils.showMessage("✅ Nómina guardada exitosamente", "success");

            const pdfContainer = document.getElementById("boton-pdf-container");
            pdfContainer.innerHTML = '';
            const pdfButton = document.createElement('a');
            pdfButton.href = `/recursos_humanos/nomina/pdf/${nominaId}/`;
            pdfButton.classList.add('btn', 'btn-secondary', 'mt-2');
            pdfButton.target = '_blank';
            pdfButton.textContent = 'Descargar PDF';
            pdfContainer.appendChild(pdfButton);

            form.reset();
            resumen.classList.add("hidden");
            form.dataset = {};
            // Removed: generarPdfBtn.style.display = "none"; to keep it available
        } catch (err) {
            Utils.showMessage("❌ Error al guardar nómina: " + err.message);
        }
    });

    // Generar PDF del resumen de nómina
    if (generarPdfBtn) {
        generarPdfBtn.addEventListener('click', () => {
            const empleado = document.getElementById('nomina-empleado').innerText;
            const salarioBase = document.getElementById('nomina-salario-base-resumen').innerText;
            const bonificaciones = document.getElementById('nomina-bonificaciones').innerText;
            const deducciones = document.getElementById('nomina-deducciones').innerText;
            const salarioNeto = document.getElementById('nomina-salario-neto').innerText;
            const periodoInicio = document.getElementById('nomina-periodo-inicio').value || 'No especificado';
            const periodoFin = document.getElementById('nomina-periodo-fin').value || 'No especificado';

            if (!empleado || !salarioBase || !bonificaciones || !deducciones || !salarioNeto) {
                return Utils.showMessage("⚠️ No hay datos suficientes para generar el PDF.");
            }

            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                doc.setFontSize(18);
                doc.text('Resumen de Nómina', 10, 10);
                doc.setFontSize(12);
                doc.text(`Empleado: ${empleado}`, 10, 30);
                doc.text(`Período: ${periodoInicio} al ${periodoFin}`, 10, 40);
                doc.text(`Salario Base (Quincenal): ${salarioBase}`, 10, 50);
                doc.text(`Bonificaciones: ${bonificaciones}`, 10, 60);
                doc.text(`Deducciones: ${deducciones}`, 10, 70);
                doc.text(`Salario Neto: ${salarioNeto}`, 10, 80);
                doc.save(`nomina_${empleado}_${periodoInicio}_al_${periodoFin}.pdf`);
            } catch (err) {
                Utils.showMessage("❌ Error al generar el PDF: " + err.message);
            }
        });
    }
});