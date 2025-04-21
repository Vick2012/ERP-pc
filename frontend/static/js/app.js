// Mostrar u ocultar el formulario de proveedor
function mostrarFormularioProveedor() {
    const formulario = document.getElementById("formulario-proveedor");
    formulario.classList.toggle("hidden");
}

// Función para limpiar los campos del formulario de proveedor
function limpiarFormularioProveedor() {
    document.getElementById("nombre-proveedor").value = "";
    document.getElementById("contacto-proveedor").value = "";
    document.getElementById("direccion-proveedor").value = "";
    document.getElementById("telefono-proveedor").value = "";
    document.getElementById("email-proveedor").value = "";
    document.getElementById("tipo_proveedor").value = "";
}

// Mostrar u ocultar el formulario de cliente
function mostrarFormularioCliente() {
    const formulario = document.getElementById("formulario-cliente");
    formulario.classList.toggle("hidden");
}

// Función para limpiar los campos del formulario de cliente
function limpiarFormularioCliente() {
    document.getElementById("nombre-cliente").value = "";
    document.getElementById("contacto-cliente").value = "";
    document.getElementById("preferencias-cliente").value = "";
}

// Cargar proveedores y clientes al iniciar la página
document.addEventListener("DOMContentLoaded", function() {
    cargarProveedores();
    cargarClientes();
});

// Función para cargar los proveedores desde la API
function cargarProveedores() {
    fetch("/api/proveedores/", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then(response => response.json())
    .then(data => {
        const tabla = document.getElementById("tabla-proveedores").getElementsByTagName("tbody")[0];
        tabla.innerHTML = ""; // Limpiar la tabla
        data.forEach(proveedor => {
            const fila = `
                <tr>
                    <td>${proveedor.id}</td>
                    <td>${proveedor.nombre}</td>
                    <td>${proveedor.contacto}</td>
                    <td>${proveedor.direccion || 'Sin dirección'}</td>
                    <td>${proveedor.telefono}</td>
                    <td>${proveedor.email}</td>
                    <td>${proveedor.tipo_proveedor}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editarProveedor(${proveedor.id})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarProveedor(${proveedor.id})">Eliminar</button>
                    </td>
                </tr>
            `;
            tabla.innerHTML += fila;
        });
    })
    .catch(error => {
        console.error("Error al cargar proveedores:", error);
    });
}

// Función para guardar un proveedor (nuevo o editado)
function guardarProveedor() {
    const proveedorData = {
        nombre: document.getElementById("nombre-proveedor").value,
        contacto: document.getElementById("contacto-proveedor").value,
        direccion: document.getElementById("direccion-proveedor").value,
        telefono: document.getElementById("telefono-proveedor").value,
        email: document.getElementById("email-proveedor").value,
        tipo_proveedor: document.getElementById("tipo_proveedor").value,
    };

    // Depurar los datos enviados
    console.log("Datos enviados al backend (proveedor):", proveedorData);

    fetch("/api/proveedores/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value,
        },
        body: JSON.stringify(proveedorData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Error al guardar el proveedor: " + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log("Respuesta del backend (proveedor):", data);
        alert("Proveedor guardado exitosamente!");
        cargarProveedores(); // Recargar la tabla
        limpiarFormularioProveedor(); // Limpiar el formulario
        mostrarFormularioProveedor(); // Ocultar el formulario
    })
    .catch(error => {
        console.error("Error al guardar el proveedor:", error);
        alert("Error al guardar el proveedor. Revisa la consola para más detalles.");
    });
}

// Función para buscar proveedores (filtro)
function buscarProveedor() {
    const searchTerm = document.getElementById("search-proveedores").value.toLowerCase();
    fetch("/api/proveedores/")
    .then(response => response.json())
    .then(data => {
        const filteredData = data.filter(proveedor => 
            (proveedor.nombre && proveedor.nombre.toLowerCase().includes(searchTerm)) || 
            (proveedor.contacto && proveedor.contacto.toLowerCase().includes(searchTerm)) ||
            (proveedor.direccion && proveedor.direccion.toLowerCase().includes(searchTerm)) ||
            (proveedor.telefono && proveedor.telefono.toLowerCase().includes(searchTerm)) ||
            (proveedor.email && proveedor.email.toLowerCase().includes(searchTerm)) ||
            (proveedor.tipo_proveedor && proveedor.tipo_proveedor.toLowerCase().includes(searchTerm))
        );
        const tabla = document.getElementById("tabla-proveedores").getElementsByTagName("tbody")[0];
        tabla.innerHTML = "";
        filteredData.forEach(proveedor => {
            const fila = `
                <tr>
                    <td>${proveedor.id}</td>
                    <td>${proveedor.nombre}</td>
                    <td>${proveedor.contacto}</td>
                    <td>${proveedor.direccion || 'Sin dirección'}</td>
                    <td>${proveedor.telefono}</td>
                    <td>${proveedor.email}</td>
                    <td>${proveedor.tipo_proveedor}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editarProveedor(${proveedor.id})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarProveedor(${proveedor.id})">Eliminar</button>
                    </td>
                </tr>
            `;
            tabla.innerHTML += fila;
        });
    })
    .catch(error => {
        console.error("Error al buscar proveedores:", error);
    });
}

// Función para editar un proveedor
function editarProveedor(id) {
    fetch(`/api/proveedores/${id}/`)
    .then(response => response.json())
    .then(proveedor => {
        document.getElementById("nombre-proveedor").value = proveedor.nombre || '';
        document.getElementById("contacto-proveedor").value = proveedor.contacto || '';
        document.getElementById("direccion-proveedor").value = proveedor.direccion || '';
        document.getElementById("telefono-proveedor").value = proveedor.telefono || '';
        document.getElementById("email-proveedor").value = proveedor.email || '';
        document.getElementById("tipo_proveedor").value = proveedor.tipo_proveedor || '';

        const formulario = document.getElementById("formulario-proveedor");
        if (formulario.classList.contains("hidden")) {
            mostrarFormularioProveedor();
        }
    })
    .catch(error => {
        console.error("Error al cargar el proveedor para editar:", error);
    });
}

// Función para eliminar un proveedor
function eliminarProveedor(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este proveedor?")) {
        fetch(`/api/proveedores/${id}/`, {
            method: "DELETE",
            headers: {
                "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value,
            },
        })
        .then(response => {
            if (response.ok) {
                alert("Proveedor eliminado exitosamente!");
                cargarProveedores();
            } else {
                throw new Error("Error al eliminar el proveedor");
            }
        })
        .catch(error => {
            console.error("Error al eliminar el proveedor:", error);
            alert("Error al eliminar el proveedor.");
        });
    }
}

// Función para cargar los clientes desde la API
function cargarClientes() {
    fetch("/api/clientes/", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then(response => response.json())
    .then(data => {
        const tabla = document.getElementById("tabla-clientes").getElementsByTagName("tbody")[0];
        tabla.innerHTML = ""; // Limpiar la tabla
        data.forEach(cliente => {
            const fila = `
                <tr>
                    <td>${cliente.id}</td>
                    <td>${cliente.nombre}</td>
                    <td>${cliente.contacto}</td>
                    <td>${cliente.preferencias || 'Sin preferencias'}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editarCliente(${cliente.id})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarCliente(${cliente.id})">Eliminar</button>
                    </td>
                </tr>
            `;
            tabla.innerHTML += fila;
        });
    })
    .catch(error => {
        console.error("Error al cargar clientes:", error);
    });
}

// Función para guardar un cliente (nuevo o editado)
function guardarCliente() {
    const clienteData = {
        nombre: document.getElementById("nombre-cliente").value,
        contacto: document.getElementById("contacto-cliente").value,
        preferencias: document.getElementById("preferencias-cliente").value,
    };

    // Depurar los datos enviados
    console.log("Datos enviados al backend (cliente):", clienteData);

    fetch("/api/clientes/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value,
        },
        body: JSON.stringify(clienteData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Error al guardar el cliente: " + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log("Respuesta del backend (cliente):", data);
        alert("Cliente guardado exitosamente!");
        cargarClientes(); // Recargar la tabla
        limpiarFormularioCliente(); // Limpiar el formulario
        mostrarFormularioCliente(); // Ocultar el formulario
    })
    .catch(error => {
        console.error("Error al guardar el cliente:", error);
        alert("Error al guardar el cliente. Revisa la consola para más detalles.");
    });
}

// Función para buscar clientes (filtro)
function buscarCliente() {
    const searchTerm = document.getElementById("search-clientes").value.toLowerCase();
    fetch("/api/clientes/")
    .then(response => response.json())
    .then(data => {
        const filteredData = data.filter(cliente => 
            (cliente.nombre && cliente.nombre.toLowerCase().includes(searchTerm)) || 
            (cliente.contacto && cliente.contacto.toLowerCase().includes(searchTerm)) ||
            (cliente.preferencias && cliente.preferencias.toLowerCase().includes(searchTerm))
        );
        const tabla = document.getElementById("tabla-clientes").getElementsByTagName("tbody")[0];
        tabla.innerHTML = "";
        filteredData.forEach(cliente => {
            const fila = `
                <tr>
                    <td>${cliente.id}</td>
                    <td>${cliente.nombre}</td>
                    <td>${cliente.contacto}</td>
                    <td>${cliente.preferencias || 'Sin preferencias'}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editarCliente(${cliente.id})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarCliente(${cliente.id})">Eliminar</button>
                    </td>
                </tr>
            `;
            tabla.innerHTML += fila;
        });
    })
    .catch(error => {
        console.error("Error al buscar clientes:", error);
    });
}

// Función para editar un cliente
function editarCliente(id) {
    fetch(`/api/clientes/${id}/`)
    .then(response => response.json())
    .then(cliente => {
        document.getElementById("nombre-cliente").value = cliente.nombre || '';
        document.getElementById("contacto-cliente").value = cliente.contacto || '';
        document.getElementById("preferencias-cliente").value = cliente.preferencias || '';

        const formulario = document.getElementById("formulario-cliente");
        if (formulario.classList.contains("hidden")) {
            mostrarFormularioCliente();
        }
    })
    .catch(error => {
        console.error("Error al cargar el cliente para editar:", error);
    });
}

// Función para eliminar un cliente
function eliminarCliente(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
        fetch(`/api/clientes/${id}/`, {
            method: "DELETE",
            headers: {
                "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value,
            },
        })
        .then(response => {
            if (response.ok) {
                alert("Cliente eliminado exitosamente!");
                cargarClientes();
            } else {
                throw new Error("Error al eliminar el cliente");
            }
        })
        .catch(error => {
            console.error("Error al eliminar el cliente:", error);
            alert("Error al eliminar el cliente.");
        });
    }
}