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
    console.log("Página cargada, inicializando...");

    const form = document.getElementById("formulario-nomina");
    const resumen = document.getElementById("nomina-resumen");
    const generarPdfBtn = document.getElementById("generar-pdf");

    if (!form) {
        console.error("Formulario de nómina no encontrado.");
        return;
    }

    // Calcular Nómina
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = form.dataset.empleadoId;
        if (!id) {
            Utils.showMessage("⚠️ Ingresa un documento válido.");
            return;
        }

        try {
            const empleado = await Utils.makeRequest(`/api/rrhh/empleados/${id}/`);
            const salarioMensual = parseFloat(empleado.salario);
            const salarioQuincenal = salarioMensual / 2;
            const valorHora = salarioQuincenal / (15 * 8);

            const getVal = (id) => parseFloat(document.getElementById(id).value) || 0;
            const horasExtraD = getVal("nomina-horas-extra-diurnas");
            const horasExtraN = getVal("nomina-horas-extra-nocturnas");
            const recargosNoc = getVal("nomina-recargos-nocturnos");
            const horasFestD = getVal("nomina-horas-diurnas-festivas");
            const horasFestN = getVal("nomina-horas-nocturnas-festivas");
            const horasExtraFestD = getVal("nomina-horas-extras-diurnas-festivas");
            const horasExtraFestN = getVal("nomina-horas-extras-nocturnas-festivas");
            const horasAusente = getVal("nomina-horas-ausente");

            const bonificaciones =
                horasExtraD * valorHora * 1.25 +
                horasExtraN * valorHora * 1.75 +
                recargosNoc * valorHora * 1.35 +
                horasFestD * valorHora * 1.75 +
                horasFestN * valorHora * 2.0 +
                horasExtraFestD * valorHora * 2.0 +
                horasExtraFestN * valorHora * 2.5;

            const deducciones = salarioQuincenal * 0.08 + horasAusente * valorHora;
            const salarioNeto = salarioQuincenal + bonificaciones - deducciones;

            document.getElementById("nomina-empleado").textContent = empleado.nombre;
            document.getElementById("nomina-salario-base-resumen").textContent = `$${salarioQuincenal.toFixed(2)}`;
            document.getElementById("nomina-bonificaciones").textContent = `$${bonificaciones.toFixed(2)}`;
            document.getElementById("nomina-deducciones").textContent = `$${deducciones.toFixed(2)}`;
            document.getElementById("nomina-salario-neto").textContent = `$${salarioNeto.toFixed(2)}`;

            resumen.classList.remove("hidden");
            if (generarPdfBtn) generarPdfBtn.style.display = "inline-block";

            Object.assign(form.dataset, {
                horasExtraDiurnas: horasExtraD,
                horasExtraNocturnas: horasExtraN,
                recargosNocturnos: recargosNoc,
                horasDiurnasFestivas: horasFestD,
                horasNocturnasFestivas: horasFestN,
                horasExtrasDiurnasFestivas: horasExtraFestD,
                horasExtrasNocturnasFestivas: horasExtraFestN,
                horasAusente: horasAusente,
            });
        } catch (err) {
            Utils.showMessage(`❌ Error al calcular nómina: ${err.message}`);
        }
    });

    // Guardar Nómina
    document.getElementById("guardar-nomina").addEventListener("click", async () => {
        const id = form.dataset.empleadoId;
        const inicio = document.getElementById("nomina-periodo-inicio").value;
        const fin = document.getElementById("nomina-periodo-fin").value;

        if (!id || !inicio || !fin) {
            Utils.showMessage("⚠️ Completa todos los campos.");
            return;
        }

        try {
            const empleado = await Utils.makeRequest(`/api/rrhh/empleados/${id}/`);
            const salarioBase = parseFloat(empleado.salario) / 2;

            const payload = {
                empleado: parseInt(id),
                periodo_inicio: inicio,
                periodo_fin: fin,
                salario_base: salarioBase,
                deducciones: parseFloat(document.getElementById("nomina-deducciones").textContent.replace(/[$,]/g, "")),
                bonificaciones: parseFloat(document.getElementById("nomina-bonificaciones").textContent.replace(/[$,]/g, "")),
                salario_neto: parseFloat(document.getElementById("nomina-salario-neto").textContent.replace(/[$,]/g, "")),
                horas_extra_diurnas: parseFloat(form.dataset.horasExtraDiurnas) || 0,
                horas_extra_nocturnas: parseFloat(form.dataset.horasExtraNocturnas) || 0,
                recargos_nocturnos: parseFloat(form.dataset.recargosNocturnos) || 0,
                horas_diurnas_festivas: parseFloat(form.dataset.horasDiurnasFestivas) || 0,
                horas_nocturnas_festivas: parseFloat(form.dataset.horasNocturnasFestivas) || 0,
                horas_extras_diurnas_festivas: parseFloat(form.dataset.horasExtrasDiurnasFestivas) || 0,
                horas_extras_nocturnas_festivas: parseFloat(form.dataset.horasExtrasNocturnasFestivas) || 0,
                horas_ausente: parseFloat(form.dataset.horasAusente) || 0,
            };

            const responseData = await Utils.makeRequest("/api/rrhh/nominas/", "POST", payload);
            Utils.showMessage("✅ Nómina guardada exitosamente", "success");

            const pdfContainer = document.getElementById("boton-pdf-container");
            pdfContainer.innerHTML = "";
            const pdfButton = document.createElement("a");
            pdfButton.href = `/recursos_humanos/nomina/pdf/${responseData.id}/`;
            pdfButton.classList.add("btn", "btn-secondary", "mt-2");
            pdfButton.target = "_blank";
            pdfButton.textContent = "Descargar PDF";
            pdfContainer.appendChild(pdfButton);

            form.reset();
            resumen.classList.add("hidden");
            form.dataset = {};
        } catch (err) {
            Utils.showMessage(`❌ Error al guardar nómina: ${err.message}`);
        }
    });

    // Generar PDF del resumen de nómina
    if (generarPdfBtn) {
        generarPdfBtn.addEventListener("click", () => {
            const empleado = document.getElementById("nomina-empleado").textContent || "No empleado";
            const documento = document.getElementById("nomina-documento").value || "Sin documento";
            const salarioBase = document.getElementById("nomina-salario-base-resumen").textContent || "$0.00";
            const bonificaciones = document.getElementById("nomina-bonificaciones").textContent || "$0.00";
            const deducciones = document.getElementById("nomina-deducciones").textContent || "$0.00";
            const salarioNeto = document.getElementById("nomina-salario-neto").textContent || "$0.00";
            const periodoInicio = document.getElementById("nomina-periodo-inicio").value || "No especificado";
            const periodoFin = document.getElementById("nomina-periodo-fin").value || "No especificado";

            console.log("Datos a insertar:", { empleado, documento, salarioBase, bonificaciones, deducciones, salarioNeto, periodoInicio, periodoFin });

            if (!empleado || !salarioBase || !bonificaciones || !deducciones || !salarioNeto) {
                Utils.showMessage("⚠️ No hay datos suficientes para generar el PDF.");
                return;
            }

            // Use jsPDF directly with autotable
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "in",
                format: "letter"
            });

            let y = 0.5; // Starting y position (inches)
            doc.setFontSize(16);
            doc.text("Recibo de Nómina", 4.25, y += 0.5, { align: "center" });
            doc.setFontSize(12);
            doc.text(`Período: ${periodoInicio} al ${periodoFin}`, 4.25, y += 0.5, { align: "center" });

            doc.autoTable({
                startY: y + 0.5,
                head: [['Campo', 'Valor']],
                body: [
                    ['Empleado', empleado],
                    ['Documento', documento],
                    ['Salario Base', salarioBase],
                    ['Bonificaciones', bonificaciones],
                    ['Deducciones', deducciones],
                    ['Salario Neto', salarioNeto]
                ],
                theme: 'grid',
                styles: { halign: 'left', fontSize: 10 },
                headStyles: { fillColor: [200, 200, 200] }
            });

            console.log("PDF created, saving...");
            doc.save(`nomina_${documento}_${periodoInicio}_al_${periodoFin}.pdf`);
        });
    }
});
 
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

        // Actualizar todos los elementos que muestran el nombre del empleado
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

// Configuración por defecto de la empresa
const EMPRESA_CONFIG = {
    nombre: "EventSync ERP Logística S.A.S",
    nit: "900.123.456-7",
    direccion: "Calle 123 # 45-67",
    ciudad: "Bogotá D.C., Colombia",
    telefono: "601 4563214",
    email: "Erplogistica@gmail.com.co",
    sitioWeb: "www.eventsync.com.co",
    colorPrimario: [41, 128, 185], // Azul corporativo
    colorSecundario: [52, 152, 219], // Azul claro
    textoLegal: "Este documento es un certificado oficial de nómina generado por el sistema EventSync ERP. " +
                "Los valores aquí presentados corresponden al periodo indicado y están sujetos a las normativas laborales vigentes."
};

// Función mejorada para cargar scripts externos de manera más robusta
function loadScript(url, retries = 3) {
    return new Promise((resolve, reject) => {
        // Verificar si el script ya está cargado
        if (document.querySelector(`script[src="${url}"]`)) {
            console.log(`Script ${url} ya está cargado`);
            resolve();
            return;
        }

        let attempts = 0;
        const tryLoadScript = () => {
            attempts++;
            console.log(`Intento ${attempts} de cargar ${url}`);

            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;

            // Manejar errores de carga
            script.onerror = () => {
                script.remove(); // Eliminar el script fallido
                if (attempts < retries) {
                    console.log(`Reintentando cargar ${url}...`);
                    setTimeout(tryLoadScript, 1000 * attempts); // Espera exponencial
                } else {
                    console.error(`Error al cargar ${url} después de ${retries} intentos`);
                    reject(new Error(`No se pudo cargar ${url} después de ${retries} intentos`));
                }
            };

            // Manejar carga exitosa
            script.onload = () => {
                console.log(`Script ${url} cargado exitosamente`);
                resolve();
            };

            document.head.appendChild(script);
        };

        tryLoadScript();
    });
}

// Función para verificar si una librería está disponible
function checkLibraryAvailable(libraryName, maxAttempts = 10, interval = 500) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        
        const check = () => {
            attempts++;
            const isAvailable = window[libraryName] !== undefined;
            
            if (isAvailable) {
                console.log(`${libraryName} está disponible`);
                resolve(true);
            } else if (attempts >= maxAttempts) {
                console.error(`${libraryName} no está disponible después de ${maxAttempts} intentos`);
                reject(new Error(`${libraryName} no está disponible`));
            } else {
                setTimeout(check, interval);
            }
        };
        
        check();
    });
}

// Función para cargar todas las dependencias necesarias de manera más robusta
async function loadDependencies() {
    const dependencies = [
        {
            url: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
            name: 'jspdf'
        },
        {
            url: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js',
            check: () => typeof window.jspdf !== 'undefined' && typeof window.jspdf.jsPDF !== 'undefined'
        },
        {
            url: 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js',
            name: 'QRious'
        }
    ];

    try {
        for (const dep of dependencies) {
            console.log(`Iniciando carga de ${dep.url}`);
            await loadScript(dep.url);
            
            if (dep.name) {
                await checkLibraryAvailable(dep.name);
            } else if (dep.check) {
                await new Promise((resolve, reject) => {
                    let attempts = 0;
                    const checkDependency = () => {
                        if (dep.check()) {
                            resolve();
                        } else if (attempts++ < 10) {
                            setTimeout(checkDependency, 500);
                        } else {
                            reject(new Error(`Dependencia ${dep.url} no está funcionando correctamente`));
                        }
                    };
                    checkDependency();
                });
            }
        }

        console.log('Todas las dependencias cargadas y verificadas correctamente');
        return true;
    } catch (error) {
        console.error('Error al cargar dependencias:', error);
        Utils.showMessage(`Error al cargar las dependencias necesarias: ${error.message}`);
        return false;
    }
}

// Función para cargar la imagen del logo
function cargarLogo() {
    return new Promise((resolve, reject) => {
        const logo = new Image();
        logo.crossOrigin = "Anonymous";  // Permitir carga de imágenes cross-origin
        logo.onload = () => {
            console.log('Logo cargado exitosamente');
            resolve(logo);
        };
        logo.onerror = (error) => {
            console.error('Error al cargar el logo:', error);
            reject(error);
        };
        logo.src = '/static/img/logo.png';
    });
}

// Función para crear el documento PDF con el nuevo diseño
async function crearDocumentoPDF(datosNomina) {
    console.log('Iniciando creación del PDF con datos:', datosNomina);
    
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        console.error('jsPDF no está disponible');
        throw new Error('jsPDF no está disponible');
    }
    
    // Crear documento con el tamaño especificado (210mm x 140mm)
    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [140, 210]
    });

    console.log('Documento PDF creado con dimensiones:', {
        width: doc.internal.pageSize.width,
        height: doc.internal.pageSize.height
    });

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let y = 15; // Posición inicial Y

    // Configuración de estilos
    const estilos = {
        titulo: { size: 16, style: 'bold', color: [13, 110, 253] }, // Color azul de Bootstrap
        subtitulo: { size: 12, style: 'normal', color: [33, 37, 41] },
        texto: { size: 10, style: 'normal', color: [33, 37, 41] },
        textoSmall: { size: 8, style: 'normal', color: [108, 117, 125] }
    };

    // Función helper para aplicar estilos
    const aplicarEstilo = (tipo) => {
        doc.setFontSize(estilos[tipo].size);
        doc.setFont('helvetica', estilos[tipo].style);
        doc.setTextColor(...estilos[tipo].color);
    };

    // Agregar fondo claro
    doc.setFillColor(248, 249, 250); // Color de fondo Bootstrap light
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Agregar logo
    try {
        const logo = await cargarLogo();
        doc.addImage(logo, 'PNG', 10, y - 10, 30, 30);
        console.log('Logo agregado al PDF');
    } catch (error) {
        console.warn('No se pudo cargar el logo:', error);
    }

    // Encabezado con datos de la empresa
    aplicarEstilo('titulo');
    doc.text("Recibo de Nómina", pageWidth / 2, y, { align: "center" });
    console.log('Título agregado');
    
    y += 8;
    aplicarEstilo('subtitulo');
    doc.text(EMPRESA_CONFIG.nombre, pageWidth / 2, y, { align: "center" });
    
    y += 6;
    aplicarEstilo('texto');
    doc.text(`NIT: ${EMPRESA_CONFIG.nit}`, pageWidth / 2, y, { align: "center" });
    y += 5;
    doc.text(EMPRESA_CONFIG.direccion, pageWidth / 2, y, { align: "center" });
    y += 5;
    doc.text(`${EMPRESA_CONFIG.ciudad} | Tel: ${EMPRESA_CONFIG.telefono}`, pageWidth / 2, y, { align: "center" });

    // Agregar línea separadora
    y += 8;
    doc.setDrawColor(222, 226, 230); // Color Bootstrap border
    doc.setLineWidth(0.5);
    doc.line(10, y, pageWidth - 10, y);

    // Información del empleado
    y += 10;
    aplicarEstilo('subtitulo');
    doc.text("Información del Empleado", 10, y);
    console.log('Agregando información del empleado');
    
    y += 5;
    doc.autoTable({
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
            fontSize: 9,
            cellPadding: 2,
            lineColor: [222, 226, 230],
            lineWidth: 0.1
        },
        headStyles: {
            fillColor: [13, 110, 253],
            textColor: 255,
            fontStyle: 'bold'
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 40 },
            1: { cellWidth: 'auto' }
        },
        margin: { left: 10, right: 10 }
    });

    // Detalles de la nómina
    y = doc.lastAutoTable.finalY + 10;
    aplicarEstilo('subtitulo');
    doc.text("Detalles de Nómina", 10, y);
    console.log('Agregando detalles de nómina');
    
    y += 5;
    doc.autoTable({
        startY: y,
        head: [['Concepto', 'Valor']],
        body: [
            ['Bonificaciones', datosNomina.datos.bonificaciones],
            ['Deducciones', datosNomina.datos.deducciones],
            ['Salario Neto', datosNomina.datos.salarioNeto]
        ],
        theme: 'grid',
        styles: { 
            fontSize: 9,
            cellPadding: 2,
            lineColor: [222, 226, 230],
            lineWidth: 0.1
        },
        headStyles: {
            fillColor: [13, 110, 253],
            textColor: 255,
            fontStyle: 'bold'
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 40 },
            1: { cellWidth: 'auto' }
        },
        margin: { left: 10, right: 10 }
    });

    // Generar y agregar código QR
    try {
        console.log('Generando código QR');
        const qrData = JSON.stringify({
            empresa: EMPRESA_CONFIG.nombre,
            empleado: datosNomina.datos.empleado,
            documento: datosNomina.datos.documento,
            periodo: `${datosNomina.datos.periodoTipo} ${formatDate(datosNomina.datos.periodoInicio)} - ${formatDate(datosNomina.datos.periodoFin)}`,
            salarioNeto: datosNomina.datos.salarioNeto
        });
        
        const qr = new QRious({
            value: qrData,
            size: 1000,
            level: 'H'
        });
        
        // Posicionar QR en la esquina inferior derecha
        doc.addImage(qr.toDataURL(), 'PNG', pageWidth - 35, pageHeight - 35, 25, 25);
        console.log('Código QR agregado');
    } catch (error) {
        console.warn('No se pudo generar el código QR:', error);
    }

    // Pie de página
    aplicarEstilo('textoSmall');
    const textoLegal = doc.splitTextToSize(EMPRESA_CONFIG.textoLegal, pageWidth - 20);
    doc.text(textoLegal, pageWidth / 2, pageHeight - 15, { 
        align: "center"
    });
    
    doc.text(`Generado el ${new Date().toLocaleDateString()} | ${EMPRESA_CONFIG.sitioWeb}`, pageWidth / 2, pageHeight - 8, {
        align: "center"
    });

    console.log('PDF generado completamente');
    return doc;
}

// Función mejorada para generar el PDF de nómina
async function generarPdfNomina() {
    try {
        console.log('Iniciando generación de PDF...');

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

        // Crear documento PDF
        const doc = await crearDocumentoPDF(datosNomina);
        
        // Generar nombre de archivo
        const nombreArchivo = generarNombreArchivo(datosNomina.datos);

        // Guardar PDF
        console.log('Guardando PDF como:', nombreArchivo);
        doc.save(nombreArchivo);
        
        console.log('PDF generado exitosamente');
        Utils.showMessage('PDF generado exitosamente', 'success');
    } catch (error) {
        console.error('Error al generar PDF:', error);
        Utils.showMessage(`Error al generar el PDF: ${error.message}`);
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

function generarNombreArchivo(datos) {
    const fechaArchivo = formatDate(datos.periodoFin).replace(/\//g, "-");
    return `nomina_${datos.empleado.replace(/\s+/g, "_")}_${datos.periodoTipo}_${fechaArchivo}.pdf`;
}
 



