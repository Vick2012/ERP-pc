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
};

// Utilidad para obtener el token CSRF
function getCsrfToken() {
    // Intentar obtener el token del elemento input
    let token = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
    if (token) {
        console.log("Token CSRF desde input:", token);
        return token;
    }

    // Si no se encuentra en el input, intentar obtenerlo de la cookie
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    console.log("Token CSRF desde cookie:", cookieValue);
    if (!cookieValue) {
        console.error("Token CSRF no encontrado.");
        throw new Error("Token CSRF no encontrado.");
    }
    return cookieValue;
}

// Utilidad para realizar solicitudes HTTP
async function makeRequest(url, method = 'GET', data = null) {
    console.log("Haciendo solicitud a:", url, "Método:", method, "Datos:", data);
    const headers = { 'Content-Type': 'application/json' };
    if (['POST', 'PUT', 'DELETE'].includes(method)) {
        headers['X-CSRFToken'] = getCsrfToken();
    }

    const options = { method, headers };
    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    console.log("Respuesta del servidor:", response.status, response.statusText);

    let result;
    try {
        result = await response.json();
        console.log("Resultado de la solicitud:", result);
    } catch (error) {
        console.error("Error al parsear la respuesta JSON:", error);
        throw new Error(`Error al parsear la respuesta: ${response.statusText}`);
    }

    if (!response.ok) {
        throw new Error(result.error || `Error en la solicitud: ${response.statusText}`);
    }

    return result;
}

// Utilidad para mostrar mensajes de error o éxito
function showMessage(message, type = 'error') {
    console.log("Mostrando mensaje:", message, "Tipo:", type);
    alert(message);
}

// Mostrar u ocultar el formulario
function mostrarFormulario(tipo) {
    const config = CONFIG[tipo];
    console.log("Mostrando formulario para:", tipo);
    document.getElementById(config.formId).classList.toggle("hidden");
}

// Limpiar los campos del formulario
function limpiarFormulario(tipo) {
    const config = CONFIG[tipo];
    console.log("Limpiando formulario para:", tipo);
    config.fields.forEach(field => {
        document.getElementById(field.id).value = "";
    });
    const idField = document.getElementById(`${tipo}-id`);
    if (idField) idField.value = "";
    mostrarFormulario(tipo);
}

// Renderizar tabla
function renderTable(tipo, data) {
    const config = CONFIG[tipo];
    const tabla = document.getElementById(config.tableId);
    tabla.innerHTML = "";

    // Crear encabezados
    const encabezado = document.createElement("tr");
    config.tableHeaders.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        encabezado.appendChild(th);
    });
    tabla.appendChild(encabezado);

    // Crear filas
    data.forEach(item => {
        const fila = document.createElement("tr");
        const rowData = config.getRowData(item);
        rowData.forEach(cellData => {
            const td = document.createElement("td");
            td.textContent = cellData;
            fila.appendChild(td);
        });
        const actionsTd = document.createElement("td");
        actionsTd.innerHTML = `
            <button class="btn btn-warning btn-sm" onclick="editarEntidad('${tipo}', ${item.id})">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="eliminarEntidad('${tipo}', ${item.id})">Eliminar</button>
        `;
        fila.appendChild(actionsTd);
        tabla.appendChild(fila);
    });
}

// Cargar datos desde la API
async function cargarDatos(tipo) {
    try {
        const config = CONFIG[tipo];
        const data = await makeRequest(config.apiUrl);
        renderTable(tipo, data);
    } catch (error) {
        console.error(`Error al cargar ${tipo}:`, error);
        showMessage(`Error al cargar ${tipo}.`);
    }
}

// Buscar datos (filtro)
function buscarDatos(tipo) {
    const config = CONFIG[tipo];
    const searchTerm = document.getElementById(`search-${tipo}`).value.toLowerCase();
    fetch(config.apiUrl)
        .then(response => response.json())
        .then(data => {
            const filteredData = data.filter(item =>
                config.searchFields.some(field =>
                    item[field] && item[field].toLowerCase().includes(searchTerm)
                )
            );
            renderTable(tipo, filteredData);
        })
        .catch(error => {
            console.error(`Error al buscar ${tipo}:`, error);
            showMessage(`Error al buscar ${tipo}.`);
        });
}

// Editar una entidad
async function editarEntidad(tipo, id) {
    try {
        const config = CONFIG[tipo];
        const item = await makeRequest(`${config.apiUrl}${id}/`);
        config.fields.forEach(field => {
            document.getElementById(field.id).value = item[field.key] || "";
        });
        const idField = document.getElementById(`${tipo}-id`);
        if (idField) idField.value = id;
        if (document.getElementById(config.formId).classList.contains("hidden")) {
            mostrarFormulario(tipo);
        }
    } catch (error) {
        console.error(`Error al cargar ${tipo} para editar:`, error);
        showMessage(`Error al cargar ${tipo} para editar.`);
    }
}

// Eliminar una entidad
async function eliminarEntidad(tipo, id) {
    if (!confirm(`¿Estás seguro de que deseas eliminar este ${tipo.slice(0, -1)}?`)) return;
    try {
        const config = CONFIG[tipo];
        await makeRequest(`${config.apiUrl}${id}/`, "DELETE");
        showMessage(`${tipo.slice(0, -1)} eliminado exitosamente!`, 'success');
        cargarDatos(tipo);
    } catch (error) {
        console.error(`Error al eliminar ${tipo}:`, error);
        showMessage(`Error al eliminar ${tipo}.`);
    }
}

// Guardar una entidad (nuevo o editado)
async function guardarEntidad(tipo) {
    try {
        const config = CONFIG[tipo];
        const data = {};
        config.fields.forEach(field => {
            const value = document.getElementById(field.id).value;
            console.log(`Campo ${field.id}:`, value);
            data[field.key] = value || ""; // Enviar cadena vacía para campos opcionales
        });

        console.log("Datos recolectados para enviar:", data);

        const requiredFields = config.fields.filter(field => field.required);
        for (const field of requiredFields) {
            if (!data[field.key]) {
                showMessage(`El campo ${field.key} es obligatorio.`);
                return;
            }
        }

        const id = document.getElementById(`${tipo}-id`)?.value;
        console.log("ID de la entidad:", id);
        const method = id ? "PUT" : "POST";
        const url = id ? `${config.apiUrl}${id}/` : config.apiUrl;

        console.log(`Enviando solicitud: ${method} a ${url}`);
        const response = await makeRequest(url, method, data);
        console.log("Respuesta recibida:", response);

        showMessage(`${tipo.slice(0, -1)} guardado exitosamente!`, 'success');
        cargarDatos(tipo);
        limpiarFormulario(tipo);
    } catch (error) {
        console.error(`Error al guardar ${tipo}:`, error);
        showMessage(`Error al guardar ${tipo}: ${error.message}`);
    }
}

// Funciones específicas para proveedores y clientes (para compatibilidad con inicio.html)
function buscarProveedor() {
    buscarDatos("proveedores");
}

function buscarCliente() {
    buscarDatos("clientes");
}

// Verificar autenticación antes de redirigir a un módulo
function checkAuthBeforeRedirect(url) {
    fetch('/api/auth/status/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.authenticated) {
            window.location.href = url;
        } else {
            showMessage('Por favor, inicia sesión o regístrate para acceder a este módulo.');
            var loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Error al verificar autenticación');
    });
}

// Verificar el estado de autenticación al cargar la página
function verificarAutenticacion() {
    fetch("/api/auth/status/")
        .then(response => response.json())
        .then(data => {
            const buyBtn = document.getElementById("buy-erp-btn");
            const loginBtn = document.getElementById("login-btn");
            const registerBtn = document.getElementById("register-btn");
            const logoutBtn = document.getElementById("logout-btn");
            if (data.authenticated) {
                if (buyBtn) buyBtn.style.display = "inline-block";
                if (loginBtn) loginBtn.style.display = "none";
                if (registerBtn) registerBtn.style.display = "none";
                if (logoutBtn) logoutBtn.style.display = "inline-block";
            } else {
                if (buyBtn) buyBtn.style.display = "none";
                if (loginBtn) loginBtn.style.display = "inline-block";
                if (registerBtn) registerBtn.style.display = "inline-block";
                if (logoutBtn) logoutBtn.style.display = "none";
            }
        })
        .catch(error => console.error("Error al verificar autenticación:", error));
}

// Mostrar el modal de login
function showLoginModal() {
    const modal = new bootstrap.Modal(document.getElementById("loginModal"));
    modal.show();
}

// Mostrar el modal de registro
function showRegisterModal() {
    const modal = new bootstrap.Modal(document.getElementById("registerModal"));
    modal.show();
}

// Iniciar sesión
function iniciarSesion() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        showMessage('Por favor, completa todos los campos.');
        return;
    }

    fetch('/api/auth/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('login-btn').style.display = 'none';
            document.getElementById('register-btn').style.display = 'none';
            document.getElementById('logout-btn').style.display = 'inline-block';
            document.getElementById('buy-erp-btn').style.display = 'inline-block';
            var loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            loginModal.hide();
            verificarAutenticacion();
        } else {
            showMessage('Error al iniciar sesión: ' + (data.error || 'Credenciales inválidas'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Error al iniciar sesión');
    });
}

// Registrar un usuario
function registrarUsuario() {
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const errorDiv = document.getElementById('register-error');

    // Limpiar mensajes de error anteriores
    if (errorDiv) {
        errorDiv.classList.add('d-none');
        errorDiv.textContent = '';
    }

    // Validaciones
    if (!name || !email || !username || !password) {
        showMessage('Por favor, completa todos los campos.');
        if (errorDiv) {
            errorDiv.textContent = 'Por favor, completa todos los campos.';
            errorDiv.classList.remove('d-none');
        }
        return;
    }

    // Validar formato del correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Por favor, ingresa un correo electrónico válido.');
        if (errorDiv) {
            errorDiv.textContent = 'Por favor, ingresa un correo electrónico válido.';
            errorDiv.classList.remove('d-none');
        }
        return;
    }

    // Validar longitud mínima de la contraseña
    if (password.length < 8) {
        showMessage('La contraseña debe tener al menos 8 caracteres.');
        if (errorDiv) {
            errorDiv.textContent = 'La contraseña debe tener al menos 8 caracteres.';
            errorDiv.classList.remove('d-none');
        }
        return;
    }

    // Validar longitud mínima del nombre de usuario
    if (username.length < 3) {
        showMessage('El nombre de usuario debe tener al menos 3 caracteres.');
        if (errorDiv) {
            errorDiv.textContent = 'El nombre de usuario debe tener al menos 3 caracteres.';
            errorDiv.classList.remove('d-none');
        }
        return;
    }

    fetch('/api/auth/register/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({ name, email, username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage('¡Usuario registrado correctamente! Ahora puedes iniciar sesión.', 'success');
            if (errorDiv) {
                errorDiv.classList.remove('alert-danger');
                errorDiv.classList.add('alert-success');
                errorDiv.textContent = '¡Usuario registrado correctamente! Ahora puedes iniciar sesión.';
                errorDiv.classList.remove('d-none');
            }

            setTimeout(() => {
                var registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
                registerModal.hide();
                document.getElementById('register-form').reset();
                if (errorDiv) {
                    errorDiv.classList.add('d-none');
                    errorDiv.classList.remove('alert-success');
                    errorDiv.classList.add('alert-danger');
                }
            }, 2000);
        } else {
            showMessage('Error al registrar el usuario: ' + (data.error || 'Error desconocido'));
            if (errorDiv) {
                errorDiv.textContent = 'Error al registrar el usuario: ' + (data.error || 'Error desconocido');
                errorDiv.classList.remove('d-none');
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Error al registrar el usuario');
        if (errorDiv) {
            errorDiv.textContent = 'Error al registrar el usuario';
            errorDiv.classList.remove('d-none');
        }
    });
}

// Enviar formulario de contacto
function enviarContacto() {
    const name = document.getElementById("contact-name").value;
    const email = document.getElementById("contact-email").value;
    const message = document.getElementById("contact-message").value;

    if (!name || !email || !message) {
        showMessage("Por favor, completa todos los campos.");
        return;
    }

    fetch('/api/auth/save-contact/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({ name, email, message })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage('¡Gracias por contactarnos! Te responderemos pronto.', 'success');
            document.getElementById('contact-form').reset();
        } else {
            showMessage('Error al enviar el formulario: ' + (data.error || 'Error desconocido'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Error al enviar el formulario');
    });
}

// Configurar event listeners
document.addEventListener("DOMContentLoaded", () => {
    console.log("Página cargada, inicializando...");

    // Cargar datos de proveedores y clientes si estamos en la página correcta
    if (document.getElementById("proveedores-section") || document.getElementById("clientes-section")) {
        cargarDatos("proveedores");
        cargarDatos("clientes");
    }

    // Verificar autenticación
    verificarAutenticacion();

    // Configurar eventos para los botones de login y registro
    const loginBtn = document.getElementById("login-btn");
    const registerBtn = document.getElementById("register-btn");

    if (loginBtn) {
        loginBtn.addEventListener("click", showLoginModal);
    }

    if (registerBtn) {
        registerBtn.addEventListener("click", showRegisterModal);
    }
});