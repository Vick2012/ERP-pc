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
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const token = obtenerTokenCSRF();

    fetch("/api/auth/login/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error("Error al iniciar sesión: " + JSON.stringify(err));
            });
        }
        return response.json();
    })
    .then(data => {
        alert("Inicio de sesión exitoso!");
        const modal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
        modal.hide();
        verificarAutenticacion();
    })
    .catch(error => {
        console.error("Error al iniciar sesión:", error);
        alert("Error al iniciar sesión. Revisa la consola para más detalles.");
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