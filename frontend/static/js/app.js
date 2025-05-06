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
        apiUrl: "/api/recursos_humanos/",
        tableId: "tabla-recursos_humanos",
        formId: "formulario-recursos_humanos",
        fields: [
            { id: "nombre-recursos_humanos", key: "nombre", required: true },
            { id: "cargo-recursos_humanos", key: "cargo", required: true },
            { id: "salario-recursos_humanos", key: "salario", required: true },
            { id: "area-recursos_humanos", key: "area", required: true },
            { id: "telefono-recursos_humanos", key: "telefono", required: false },
            { id: "correo-recursos_humanos", key: "correo", required: true },
            { id: "contrato-recursos_humanos", key: "contrato", required: true },
        ],
        tableHeaders: ["", "ID", "Nombre", "Cargo", "Salario", "Área", "Teléfono", "Correo", "Contrato", "Acciones"],
        getRowData: (item) => [
            "",
            item.id,
            item.nombre,
            item.cargo || "Sin cargo",
            item.salario || "Sin salario",
            item.area || "Sin área",
            item.telefono || "Sin teléfono",
            item.correo || "Sin correo",
            item.contrato || "Sin contrato",
        ],
        searchFields: ["nombre", "cargo", "salario", "area", "telefono", "correo", "contrato"],
    },
};

// Utilidades
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

        const response = await fetch(url, options);
        const result = await response.json().catch(() => { throw new Error(`Error al parsear: ${response.statusText}`); });

        if (!response.ok) throw new Error(result.error || `Error: ${response.statusText}`);
        return result;
    },

    showMessage(message, type = 'error') {
        console.log(`Mensaje: ${message}, Tipo: ${type}`);
        alert(message);
    },
};

// Gestión de Entidades
const EntityManager = {
    async loadData(tipo) {
        try {
            const data = await Utils.makeRequest(CONFIG[tipo].apiUrl);
            this.renderTable(tipo, data);
        } catch (error) {
            console.error(`Error al cargar ${tipo}:`, error);
            Utils.showMessage(`Error al cargar ${tipo}.`);
        }
    },

    renderTable(tipo, data) {
        const { tableId, tableHeaders, getRowData } = CONFIG[tipo];
        const table = document.getElementById(tableId);
        table.innerHTML = `<tr>${tableHeaders.map(header => `<th>${header}</th>`).join('')}</tr>`;

        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = getRowData(item).map(cell => `<td>${cell}</td>`).join('') +
                `<td><button class="btn btn-warning btn-sm" onclick="EntityManager.editEntity('${tipo}', ${item.id})">Editar</button>` +
                `<button class="btn btn-danger btn-sm" onclick="EntityManager.deleteEntity('${tipo}', ${item.id})">Eliminar</button></td>`;
            table.appendChild(row);
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
                Utils.showMessage(`Error al buscar ${tipo}.`);
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
            Utils.showMessage(`Error al cargar ${tipo} para editar.`);
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
            Utils.showMessage(`Error al eliminar ${tipo}.`);
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

// Autenticación y Eventos
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

// Inicialización
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
});