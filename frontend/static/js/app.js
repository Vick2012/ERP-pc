// Funcionalidad para proveedores
function buscarProveedor() {
    const query = document.getElementById('search-proveedores').value;
    console.log(`Buscando proveedores con: ${query}`);
    // Aquí puedes hacer una llamada a la API
}

function mostrarFormularioProveedor() {
    document.getElementById('formulario-proveedor').classList.toggle('hidden');
}

function guardarProveedor() {
    const nombre = document.getElementById('nombre-proveedor').value;
    const contacto = document.getElementById('contacto-proveedor').value;
    console.log(`Guardando proveedor: ${nombre}, ${contacto}`);
    // Aquí puedes enviar los datos al backend
}

// Funcionalidad para clientes
function buscarCliente() {
    const query = document.getElementById('search-clientes').value;
    console.log(`Buscando clientes con: ${query}`);
    // Aquí puedes hacer una llamada a la API
}

function mostrarFormularioCliente() {
    document.getElementById('formulario-cliente').classList.toggle('hidden');
}

function guardarCliente() {
    const nombre = document.getElementById('nombre-cliente').value;
    const contacto = document.getElementById('contacto-cliente').value;
    console.log(`Guardando cliente: ${nombre}, ${contacto}`);
    // Aquí puedes enviar los datos al backend
}
let proveedores = [];
let clientes = [];

function buscarProveedor() {
    const searchTerm = document.getElementById('search-proveedores').value.toLowerCase();
    const filteredProveedores = proveedores.filter(proveedor => 
        proveedor.nombre.toLowerCase().includes(searchTerm) || 
        proveedor.contacto.toLowerCase().includes(searchTerm)
    );
    mostrarProveedores(filteredProveedores);
}

function mostrarFormularioProveedor() {
    const form = document.getElementById('formulario-proveedor');
    form.classList.toggle('hidden');
}

function guardarProveedor() {
    const nombre = document.getElementById('nombre-proveedor').value;
    const contacto = document.getElementById('contacto-proveedor').value;
    
    if (nombre && contacto) {
        const proveedor = {
            id: proveedores.length + 1,
            nombre: nombre,
            contacto: contacto
        };
        proveedores.push(proveedor);
        mostrarProveedores(proveedores);
        document.getElementById('formulario-proveedor').classList.add('hidden');
        document.getElementById('nombre-proveedor').value = '';
        document.getElementById('contacto-proveedor').value = '';
    } else {
        alert('Por favor, complete todos los campos.');
    }
}

function mostrarProveedores(data) {
    const tbody = document.getElementById('tabla-proveedores').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';
    data.forEach(proveedor => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = proveedor.id;
        row.insertCell(1).textContent = proveedor.nombre;
        row.insertCell(2).textContent = proveedor.contacto;
        const accionesCell = row.insertCell(3);
        accionesCell.innerHTML = `
            <button class="btn btn-sm btn-primary me-2" onclick="editarProveedor(${proveedor.id})">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="eliminarProveedor(${proveedor.id})">Eliminar</button>
        `;
    });
}

function editarProveedor(id) {
    const proveedor = proveedores.find(p => p.id === id);
    if (proveedor) {
        document.getElementById('nombre-proveedor').value = proveedor.nombre;
        document.getElementById('contacto-proveedor').value = proveedor.contacto;
        mostrarFormularioProveedor();
        // Lógica para guardar cambios
    }
}

function eliminarProveedor(id) {
    if (confirm('¿Estás seguro de eliminar este proveedor?')) {
        proveedores = proveedores.filter(p => p.id !== id);
        mostrarProveedores(proveedores);
    }
}

function buscarCliente() {
    const searchTerm = document.getElementById('search-clientes').value.toLowerCase();
    const filteredClientes = clientes.filter(cliente => 
        cliente.nombre.toLowerCase().includes(searchTerm) || 
        cliente.contacto.toLowerCase().includes(searchTerm)
    );
    mostrarClientes(filteredClientes);
}

function mostrarFormularioCliente() {
    const form = document.getElementById('formulario-cliente');
    form.classList.toggle('hidden');
}

function guardarCliente() {
    const nombre = document.getElementById('nombre-cliente').value;
    const contacto = document.getElementById('contacto-cliente').value;
    
    if (nombre && contacto) {
        const cliente = {
            id: clientes.length + 1,
            nombre: nombre,
            contacto: contacto
        };
        clientes.push(cliente);
        mostrarClientes(clientes);
        document.getElementById('formulario-cliente').classList.add('hidden');
        document.getElementById('nombre-cliente').value = '';
        document.getElementById('contacto-cliente').value = '';
    } else {
        alert('Por favor, complete todos los campos.');
    }
}

function mostrarClientes(data) {
    const tbody = document.getElementById('tabla-clientes').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';
    data.forEach(cliente => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = cliente.id;
        row.insertCell(1).textContent = cliente.nombre;
        row.insertCell(2).textContent = cliente.contacto;
        const accionesCell = row.insertCell(3);
        accionesCell.innerHTML = `
            <button class="btn btn-sm btn-primary me-2" onclick="editarCliente(${cliente.id})">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="eliminarCliente(${cliente.id})">Eliminar</button>
        `;
    });
}

function editarCliente(id) {
    const cliente = clientes.find(c => c.id === id);
    if (cliente) {
        document.getElementById('nombre-cliente').value = cliente.nombre;
        document.getElementById('contacto-cliente').value = cliente.contacto;
        mostrarFormularioCliente();
        // Lógica para guardar cambios
    }
}

function eliminarCliente(id) {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
        clientes = clientes.filter(c => c.id !== id);
        mostrarClientes(clientes);
    }
}

// Cargar datos iniciales (simulados)
document.addEventListener('DOMContentLoaded', () => {
    proveedores = [
        { id: 1, nombre: 'Proveedor 1', contacto: 'Contacto 1' },
        { id: 2, nombre: 'Proveedor 2', contacto: 'Contacto 2' }
    ];
    clientes = [
        { id: 1, nombre: 'Cliente 1', contacto: 'Contacto 1' },
        { id: 2, nombre: 'Cliente 2', contacto: 'Contacto 2' }
    ];
    mostrarProveedores(proveedores);
    mostrarClientes(clientes);
});