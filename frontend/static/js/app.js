// Configuración centralizada para proveedores y clientes
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

// Mostrar u ocultar el formulario
function mostrarFormulario(tipo) {
    const config = CONFIG[tipo];
    const formulario = document.getElementById(config.formId);
    formulario.classList.toggle("hidden");
}

// Limpiar los campos del formulario
function limpiarFormulario(tipo) {
    const config = CONFIG[tipo];
    config.fields.forEach(field => {
        document.getElementById(field.id).value = "";
    });
    // Limpiar el campo oculto del ID, si existe
    const idField = document.getElementById(`${tipo}-id`);
    if (idField) idField.value = "";
    mostrarFormulario(tipo); // Ocultar el formulario
}

// Obtener el token CSRF
function obtenerTokenCSRF() {
    const token = document.querySelector('[name=csrfmiddlewaretoken]');
    if (!token) {
        console.error("Token CSRF no encontrado.");
        alert("Error: Token CSRF no encontrado.");
        throw new Error("Token CSRF no encontrado.");
    }
    return token.value;
}

// Cargar datos desde la API
function cargarDatos(tipo) {
    const config = CONFIG[tipo];
    fetch(config.apiUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
    .then(response => response.json())
    .then(data => {
        const tabla = document.getElementById(config.tableId);
        tabla.innerHTML = ""; // Limpiar la tabla

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
    })
    .catch(error => {
        console.error(`Error al cargar ${tipo}:`, error);
        alert(`Error al cargar ${tipo}. Revisa la consola para más detalles.`);
    });
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
        const tabla = document.getElementById(config.tableId);
        tabla.innerHTML = "";
        const encabezado = document.createElement("tr");
        config.tableHeaders.forEach(header => {
            const th = document.createElement("th");
            th.textContent = header;
            encabezado.appendChild(th);
        });
        tabla.appendChild(encabezado);
        filteredData.forEach(item => {
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
    })
    .catch(error => {
        console.error(`Error al buscar ${tipo}:`, error);
        alert(`Error al buscar ${tipo}. Revisa la consola para más detalles.`);
    });
}

// Editar una entidad
function editarEntidad(tipo, id) {
    const config = CONFIG[tipo];
    fetch(`${config.apiUrl}${id}/`)
    .then(response => response.json())
    .then(item => {
        config.fields.forEach(field => {
            document.getElementById(field.id).value = item[field.key] || "";
        });
        // Guardar el ID en un campo oculto
        const idField = document.getElementById(`${tipo}-id`);
        if (idField) idField.value = id;
        if (document.getElementById(config.formId).classList.contains("hidden")) {
            mostrarFormulario(tipo);
        }
    })
    .catch(error => {
        console.error(`Error al cargar ${tipo} para editar:`, error);
        alert(`Error al cargar ${tipo} para editar.`);
    });
}

// Eliminar una entidad
function eliminarEntidad(tipo, id) {
    if (!confirm(`¿Estás seguro de que deseas eliminar este ${tipo.slice(0, -1)}?`)) return;

    const config = CONFIG[tipo];
    fetch(`${config.apiUrl}${id}/`, {
        method: "DELETE",
        headers: { "X-CSRFToken": obtenerTokenCSRF() },
    })
    .then(response => {
        if (!response.ok) throw new Error(`Error al eliminar ${tipo}`);
        alert(`${tipo.slice(0, -1)} eliminado exitosamente!`);
        cargarDatos(tipo);
    })
    .catch(error => {
        console.error(`Error al eliminar ${tipo}:`, error);
        alert(`Error al eliminar ${tipo}.`);
    });
}

// Guardar una entidad (nuevo o editado)
function guardarEntidad(tipo) {
    const config = CONFIG[tipo];
    const data = {};
    config.fields.forEach(field => {
        const value = document.getElementById(field.id).value;
        data[field.key] = value || undefined;
    });

    // Validaciones básicas
    const requiredFields = config.fields.filter(field => field.required);
    for (const field of requiredFields) {
        if (!data[field.key]) {
            alert(`Los campos ${field.key} son obligatorios.`);
            return;
        }
    }

    console.log(`Datos enviados al backend (${tipo}):`, data);
    const id = document.getElementById(`${tipo}-id`)?.value;
    const method = id ? "PUT" : "POST";
    const url = id ? `${config.apiUrl}${id}/` : config.apiUrl;

    fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": obtenerTokenCSRF(),
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        console.log(`Estado de la respuesta (${method} ${tipo}):`, response.status);
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(`Error al guardar ${tipo}: ${response.status} - ${JSON.stringify(err)}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log(`Respuesta del backend (${tipo}):`, data);
        alert(`${tipo.slice(0, -1)} guardado exitosamente!`);
        cargarDatos(tipo);
        limpiarFormulario(tipo);
    })
    .catch(error => {
        console.error(`Error al guardar ${tipo}:`, error);
        alert(`Error al guardar ${tipo}. Revisa la consola para más detalles.`);
    });
}

// Cargar datos al iniciar la página
document.addEventListener("DOMContentLoaded", function() {
    cargarDatos("proveedores");
    cargarDatos("clientes");
});
// Verificar el estado de autenticación al cargar la página
document.addEventListener("DOMContentLoaded", function() {
    // Solo cargar datos si estamos en la página de módulos
    if (document.getElementById("proveedores-section") || document.getElementById("clientes-section")) {
        cargarDatos("proveedores");
        cargarDatos("clientes");
    }
    verificarAutenticacion();
});

// Verificar si el usuario está autenticado
function verificarAutenticacion() {
    fetch("/api/auth/status/")
        .then(response => response.json())
        .then(data => {
            const buyBtn = document.getElementById("buy-erp-btn");
            const loginBtn = document.getElementById("login-btn");
            const logoutBtn = document.getElementById("logout-btn");
            if (data.authenticated) {
                buyBtn.style.display = "inline-block";
                loginBtn.style.display = "none";
                logoutBtn.style.display = "inline-block";
            } else {
                buyBtn.style.display = "none";
                loginBtn.style.display = "inline-block";
                logoutBtn.style.display = "none";
            }
        })
        .catch(error => console.error("Error al verificar autenticación:", error));
}

// Mostrar el modal de login
document.getElementById("login-btn").addEventListener("click", function() {
    const modal = new bootstrap.Modal(document.getElementById("loginModal"));
    modal.show();
});

// Iniciar sesión
function iniciarSesion() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/api/auth/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('login-btn').style.display = 'none';
            document.getElementById('logout-btn').style.display = 'inline-block';
            document.getElementById('buy-erp-btn').style.display = 'inline-block';
            var loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            loginModal.hide();
        } else {
            alert('Error al iniciar sesión: ' + (data.error || 'Credenciales inválidas'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al iniciar sesión');
    });
}

// Enviar formulario de contacto
function enviarContacto() {
    const name = document.getElementById("contact-name").value;
    const email = document.getElementById("contact-email").value;
    const message = document.getElementById("contact-message").value;
    const token = obtenerTokenCSRF();

    if (!name || !email || !message) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    // Esto es un ejemplo; necesitarías un endpoint real para manejar el formulario
    console.log("Formulario de contacto enviado:", { name, email, message });
    alert("Mensaje enviado exitosamente! Nos pondremos en contacto pronto.");
    document.getElementById("contact-form").reset();
}
// Mostrar el modal de login al hacer clic en "Iniciar Sesión"
document.getElementById('login-btn').addEventListener('click', function() {
    var loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
});

// Función para iniciar sesión
function iniciarSesion() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/api/auth/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('login-btn').style.display = 'none';
            document.getElementById('logout-btn').style.display = 'inline-block';
            document.getElementById('buy-erp-btn').style.display = 'inline-block';
            var loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            loginModal.hide();
        } else {
            alert('Error al iniciar sesión: ' + (data.error || 'Credenciales inválidas'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al iniciar sesión');
    });
}

// Función para obtener el token CSRF
function getCsrfToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value;
}

// Función para enviar el formulario de contacto
function enviarContacto() {
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const message = document.getElementById('contact-message').value;

    if (!name || !email || !message) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    fetch('/api/auth/save-contact/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({ name: name, email: email, message: message })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('¡Gracias por contactarnos! Te responderemos pronto.');
            document.getElementById('contact-form').reset();
        } else {
            alert('Error al enviar el formulario: ' + (data.error || 'Error desconocido'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al enviar el formulario');
    });
}

// Funciones para Proveedores y Clientes (inicio.html)
function buscarProveedor() {
    const searchTerm = document.getElementById('search-proveedores').value;
    console.log('Buscando proveedor:', searchTerm);
    // Aquí implementarías la lógica para buscar proveedores
}

function mostrarFormularioProveedor() {
    const form = document.getElementById('formulario-proveedor');
    form.classList.toggle('hidden');
}

function guardarProveedor() {
    const nombre = document.getElementById('nombre-proveedor').value;
    const contacto = document.getElementById('contacto-proveedor').value;
    const direccion = document.getElementById('direccion-proveedor').value;
    const telefono = document.getElementById('telefono-proveedor').value;
    const email = document.getElementById('email-proveedor').value;
    const tipo = document.getElementById('tipo_proveedor').value;

    console.log('Guardando proveedor:', { nombre, contacto, direccion, telefono, email, tipo });
    // Aquí implementarías la lógica para guardar el proveedor
}

function buscarCliente() {
    const searchTerm = document.getElementById('search-clientes').value;
    console.log('Buscando cliente:', searchTerm);
    // Aquí implementarías la lógica para buscar clientes
}

function mostrarFormularioCliente() {
    const form = document.getElementById('formulario-cliente');
    form.classList.toggle('hidden');
}

function guardarCliente() {
    const nombre = document.getElementById('nombre-cliente').value;
    const contacto = document.getElementById('contacto-cliente').value;
    const preferencias = document.getElementById('preferencias-cliente').value;

    console.log('Guardando cliente:', { nombre, contacto, preferencias });
    // Aquí implementarías la lógica para guardar el cliente
}
function iniciarSesion() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/api/auth/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('login-btn').style.display = 'none';
            document.getElementById('logout-btn').style.display = 'inline-block';
            document.getElementById('buy-erp-btn').style.display = 'inline-block';
            var loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            loginModal.hide();
        } else {
            alert('Error al iniciar sesión: ' + (data.error || 'Credenciales inválidas'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al iniciar sesión');
    });
}
// Mostrar el modal de registro al hacer clic en "Registrarse"
document.getElementById('register-btn').addEventListener('click', function() {
    var registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
    registerModal.show();
});

// Mostrar el modal de registro al hacer clic en "Registrarse"
document.getElementById('register-btn').addEventListener('click', function() {
    var registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
    registerModal.show();
});

// Función para registrar un usuario
function registrarUsuario() {
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;

    // Validaciones
    if (!name || !email || !username || !password) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    // Validar formato del correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Por favor, ingresa un correo electrónico válido.');
        return;
    }

    // Validar longitud mínima de la contraseña
    if (password.length < 8) {
        alert('La contraseña debe tener al menos 8 caracteres.');
        return;
    }

    // Validar longitud mínima del nombre de usuario
    if (username.length < 3) {
        alert('El nombre de usuario debe tener al menos 3 caracteres.');
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
            alert('¡Usuario registrado correctamente! Ahora puedes iniciar sesión.');
            var registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
            registerModal.hide();
            document.getElementById('register-form').reset();
        } else {
            alert('Error al registrar el usuario: ' + (data.error || 'Error desconocido'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al registrar el usuario');
    });
}
// Función para obtener el token CSRF
function getCsrfToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value;
}

// Función para iniciar sesión
function iniciarSesion() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/api/auth/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({ username: username, password: password })
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
        } else {
            alert('Error al iniciar sesión: ' + (data.error || 'Credenciales inválidas'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al iniciar sesión');
    });
}

// Función para obtener el token CSRF
function getCsrfToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value;
}

// Función para enviar el formulario de contacto
function enviarContacto() {
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const message = document.getElementById('contact-message').value;

    if (!name || !email || !message) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    fetch('/api/auth/save-contact/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({ name: name, email: email, message: message })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('¡Gracias por contactarnos! Te responderemos pronto.');
            document.getElementById('contact-form').reset();
        } else {
            alert('Error al enviar el formulario: ' + (data.error || 'Error desconocido'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al enviar el formulario');
    });
}

// Funciones para Proveedores y Clientes (inicio.html)
function buscarProveedor() {
    const searchTerm = document.getElementById('search-proveedores').value;
    console.log('Buscando proveedor:', searchTerm);
    // Aquí implementarías la lógica para buscar proveedores
}

function mostrarFormularioProveedor() {
    const form = document.getElementById('formulario-proveedor');
    form.classList.toggle('hidden');
}

function guardarProveedor() {
    const nombre = document.getElementById('nombre-proveedor').value;
    const contacto = document.getElementById('contacto-proveedor').value;
    const direccion = document.getElementById('direccion-proveedor').value;
    const telefono = document.getElementById('telefono-proveedor').value;
    const email = document.getElementById('email-proveedor').value;
    const tipo = document.getElementById('tipo_proveedor').value;

    console.log('Guardando proveedor:', { nombre, contacto, direccion, telefono, email, tipo });
    // Aquí implementarías la lógica para guardar el proveedor
}

function buscarCliente() {
    const searchTerm = document.getElementById('search-clientes').value;
    console.log('Buscando cliente:', searchTerm);
    // Aquí implementarías la lógica para buscar clientes
}

function mostrarFormularioCliente() {
    const form = document.getElementById('formulario-cliente');
    form.classList.toggle('hidden');
}

function guardarCliente() {
    const nombre = document.getElementById('nombre-cliente').value;
    const contacto = document.getElementById('contacto-cliente').value;
    const preferencias = document.getElementById('preferencias-cliente').value;

    console.log('Guardando cliente:', { nombre, contacto, preferencias });
    // Aquí implementarías la lógica para guardar el cliente
}
// Mostrar el modal de registro al hacer clic en "Registrarse"
document.getElementById('register-btn').addEventListener('click', function() {
    var registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
    registerModal.show();
});

// Mostrar el modal de login al hacer clic en "Iniciar Sesión"
document.getElementById('login-btn').addEventListener('click', function() {
    var loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
});

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
            window.location.href = url; // Redirigir si está autenticado
        } else {
            alert('Por favor, inicia sesión o regístrate para acceder a este módulo.');
            var loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al verificar autenticación');
    });
}

function registrarUsuario() {
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const errorDiv = document.getElementById('register-error');

    // Limpiar mensajes de error anteriores
    errorDiv.classList.add('d-none');
    errorDiv.textContent = '';

    // Validaciones
    if (!name || !email || !username || !password) {
        errorDiv.textContent = 'Por favor, completa todos los campos.';
        errorDiv.classList.remove('d-none');
        return;
    }

    // Validar formato del correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorDiv.textContent = 'Por favor, ingresa un correo electrónico válido.';
        errorDiv.classList.remove('d-none');
        return;
    }

    // Validar longitud mínima de la contraseña
    if (password.length < 8) {
        errorDiv.textContent = 'La contraseña debe tener al menos 8 caracteres.';
        errorDiv.classList.remove('d-none');
        return;
    }

    // Validar longitud mínima del nombre de usuario
    if (username.length < 3) {
        errorDiv.textContent = 'El nombre de usuario debe tener al menos 3 caracteres.';
        errorDiv.classList.remove('d-none');
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
            // Mostrar mensaje de éxito
            errorDiv.classList.remove('alert-danger');
            errorDiv.classList.add('alert-success');
            errorDiv.textContent = '¡Usuario registrado correctamente! Ahora puedes iniciar sesión.';
            errorDiv.classList.remove('d-none');

            // Cerrar el modal después de 2 segundos
            setTimeout(() => {
                var registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
                registerModal.hide();
                document.getElementById('register-form').reset();
                errorDiv.classList.add('d-none');
                errorDiv.classList.remove('alert-success');
                errorDiv.classList.add('alert-danger');
            }, 2000);
        } else {
            errorDiv.textContent = 'Error al registrar el usuario: ' + (data.error || 'Error desconocido');
            errorDiv.classList.remove('d-none');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        errorDiv.textContent = 'Error al registrar el usuario';
        errorDiv.classList.remove('d-none');
    });
}

// Función para iniciar sesión
function iniciarSesion() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/api/auth/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({ username: username, password: password })
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
        } else {
            alert('Error al iniciar sesión: ' + (data.error || 'Credenciales inválidas'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al iniciar sesión');
    });
}

// Función para obtener el token CSRF
function getCsrfToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value;
}

// Función para enviar el formulario de contacto
function enviarContacto() {
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const message = document.getElementById('contact-message').value;

    if (!name || !email || !message) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    fetch('/api/auth/save-contact/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({ name: name, email: email, message: message })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('¡Gracias por contactarnos! Te responderemos pronto.');
            document.getElementById('contact-form').reset();
        } else {
            alert('Error al enviar el formulario: ' + (data.error || 'Error desconocido'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al enviar el formulario');
    });
}

// Funciones para Proveedores y Clientes (inicio.html)
function buscarProveedor() {
    const searchTerm = document.getElementById('search-proveedores').value;
    console.log('Buscando proveedor:', searchTerm);
    // Aquí implementarías la lógica para buscar proveedores
}

function mostrarFormularioProveedor() {
    const form = document.getElementById('formulario-proveedor');
    form.classList.toggle('hidden');
}

function guardarProveedor() {
    const nombre = document.getElementById('nombre-proveedor').value;
    const contacto = document.getElementById('contacto-proveedor').value;
    const direccion = document.getElementById('direccion-proveedor').value;
    const telefono = document.getElementById('telefono-proveedor').value;
    const email = document.getElementById('email-proveedor').value;
    const tipo = document.getElementById('tipo_proveedor').value;

    console.log('Guardando proveedor:', { nombre, contacto, direccion, telefono, email, tipo });
    // Aquí implementarías la lógica para guardar el proveedor
}

function buscarCliente() {
    const searchTerm = document.getElementById('search-clientes').value;
    console.log('Buscando cliente:', searchTerm);
    // Aquí implementarías la lógica para buscar clientes
}

function mostrarFormularioCliente() {
    const form = document.getElementById('formulario-cliente');
    form.classList.toggle('hidden');
}

function guardarCliente() {
    const nombre = document.getElementById('nombre-cliente').value;
    const contacto = document.getElementById('contacto-cliente').value;
    const preferencias = document.getElementById('preferencias-cliente').value;

    console.log('Guardando cliente:', { nombre, contacto, preferencias });
    // Aquí implementarías la lógica para guardar el cliente
}
// Mostrar el modal de registro al hacer clic en "Registrarse"
document.getElementById('register-btn').addEventListener('click', function() {
    var registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
    registerModal.show();
});

// Mostrar el modal de login al hacer clic en "Iniciar Sesión"
document.getElementById('login-btn').addEventListener('click', function() {
    var loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
});

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
            window.location.href = url; // Redirigir si está autenticado
        } else {
            alert('Por favor, inicia sesión o regístrate para acceder a este módulo.');
            var loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al verificar autenticación');
    });
}

// Función para registrar un usuario
async function registrarUsuario() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const data = {
        name: name,
        email: email,
        username: username,
        password: password
    };

    console.log('Enviando datos:', data);  // Depuración

    try {
        const response = await fetch('/api/auth/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log('Respuesta del servidor:', result);  // Depuración

        if (response.ok) {
            alert('Contacto registrado exitosamente.');
            // Limpiar el formulario
            document.getElementById('name').value = '';
            document.getElementById('email').value = '';
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Error al registrar:', error);
        alert('Error al registrar el contacto.');
    }
}

function getCookie(name) {
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
    return cookieValue;
}

// Función para iniciar sesión
function iniciarSesion() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Por favor, completa todos los campos.');
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
        } else {
            alert('Error al iniciar sesión: ' + (data.error || 'Credenciales inválidas'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al iniciar sesión');
    });
}

// Función para obtener el token CSRF
function getCsrfToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value;
}

// Función para enviar el formulario de contacto
function enviarContacto() {
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const message = document.getElementById('contact-message').value;

    if (!name || !email || !message) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    fetch('/api/auth/save-contact/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({ name: name, email: email, message: message })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('¡Gracias por contactarnos! Te responderemos pronto.');
            document.getElementById('contact-form').reset();
        } else {
            alert('Error al enviar el formulario: ' + (data.error || 'Error desconocido'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al enviar el formulario');
    });
}

// Funciones para Proveedores y Clientes (inicio.html)
function buscarProveedor() {
    const searchTerm = document.getElementById('search-proveedores').value;
    console.log('Buscando proveedor:', searchTerm);
    // Aquí implementarías la lógica para buscar proveedores
}

function mostrarFormularioProveedor() {
    const form = document.getElementById('formulario-proveedor');
    form.classList.toggle('hidden');
}

function guardarProveedor() {
    const nombre = document.getElementById('nombre-proveedor').value;
    const contacto = document.getElementById('contacto-proveedor').value;
    const direccion = document.getElementById('direccion-proveedor').value;
    const telefono = document.getElementById('telefono-proveedor').value;
    const email = document.getElementById('email-proveedor').value;
    const tipo = document.getElementById('tipo_proveedor').value;

    console.log('Guardando proveedor:', { nombre, contacto, direccion, telefono, email, tipo });
    // Aquí implementarías la lógica para guardar el proveedor
}

function buscarCliente() {
    const searchTerm = document.getElementById('search-clientes').value;
    console.log('Buscando cliente:', searchTerm);
    // Aquí implementarías la lógica para buscar clientes
}

function mostrarFormularioCliente() {
    const form = document.getElementById('formulario-cliente');
    form.classList.toggle('hidden');
}

function guardarCliente() {
    const nombre = document.getElementById('nombre-cliente').value;
    const contacto = document.getElementById('contacto-cliente').value;
    const preferencias = document.getElementById('preferencias-cliente').value;

    console.log('Guardando cliente:', { nombre, contacto, preferencias });
    // Aquí implementarías la lógica para guardar el cliente
}