// Módulo de Inventario
const Inventario = {
    // URLs de la API
    urls: {
        productos: '/api/inventario/productos/',
        categorias: '/api/inventario/categorias/',
        movimientos: '/api/inventario/movimientos/',
        unidades: '/api/inventario/unidades-medida/'
    },

    // Inicialización
    init: async function() {
        try {
            await this.loadProductos();
        } catch (e) { console.error("Error al cargar productos (init):", e); }
        try {
            await this.loadCategorias();
        } catch (e) { console.error("Error al cargar categorías (init):", e); }
        try {
            await this.loadUnidadesMedida();
        } catch (e) { console.error("Error al cargar unidades (init):", e); }
        this.setupEventListeners();
    },

    // Configuración de event listeners
    setupEventListeners: function() {
        // Botón agregar producto
        document.getElementById('add-producto')?.addEventListener('click', () => {
            this.showFormularioProducto();
        });

        // Formulario de producto
        document.getElementById('formulario-producto')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarProducto();
        });

        // Búsqueda de productos
        document.getElementById('search-productos')?.addEventListener('input', (e) => {
            this.buscarProductos(e.target.value);
        });

        // Nuevos event listeners para categorías
        document.getElementById('add-categoria')?.addEventListener('click', () => {
            this.showFormularioCategoria();
        });

        document.getElementById('formulario-categoria')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarCategoria();
        });

        document.getElementById('search-categorias')?.addEventListener('input', (e) => {
            this.buscarCategorias(e.target.value);
        });
    },

    // Cargar productos
    loadProductos: async function() {
        try {
            const response = await fetch(this.urls.productos, { headers: { 'Accept': 'application/json' } });
            const data = await response.json();
            this.renderProductos(data);
        } catch (error) {
            console.error('Error al cargar productos:', error);
            this.showAlert('Error al cargar productos', 'danger');
        }
    },

    // Cargar categorías
    loadCategorias: async function() {
        try {
            const response = await fetch(this.urls.categorias, { headers: { 'Accept': 'application/json' } });
            const data = await response.json();
            this.renderCategorias(data);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
        }
    },

    // Cargar unidades de medida
    loadUnidadesMedida: async function() {
        try {
            const response = await fetch(this.urls.unidades, { headers: { 'Accept': 'application/json' } });
            const data = await response.json();
            this.renderUnidadesSelect(data);
        } catch (error) {
            console.error('Error al cargar unidades de medida:', error);
        }
    },

    // Renderizar productos en la tabla
    renderProductos: function(productos) {
        const tbody = document.querySelector('#tabla-productos tbody');
        if (!tbody) return;

        tbody.innerHTML = productos.map(producto => `
            <tr>
                <td>${producto.codigo}</td>
                <td>${producto.nombre}</td>
                <td>${producto.categoria?.nombre || ''}</td>
                <td>${producto.unidad_medida?.abreviatura || ''}</td>
                <td>${producto.stock_actual}</td>
                <td>${producto.stock_minimo}</td>
                <td>${producto.precio_compra}</td>
                <td>${producto.precio_venta}</td>
                <td>
                    <span class="badge ${this.getEstadoBadgeClass(producto.estado)}">
                        ${producto.estado}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="Inventario.editarProducto(${producto.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="Inventario.eliminarProducto(${producto.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    // Renderizar categorías en la tabla
    renderCategorias: function(categorias) {
        const tbody = document.querySelector('#tabla-categorias tbody');
        if (!tbody) return;

        tbody.innerHTML = categorias.map(categoria => `
            <tr>
                <td>${categoria.nombre}</td>
                <td>${categoria.descripcion || ''}</td>
                <td>
                    <span class="badge ${this.getEstadoBadgeClass(categoria.estado)}">
                        ${categoria.estado}
                    </span>
                </td>
                <td>${categoria.total_productos || 0}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="Inventario.editarCategoria(${categoria.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="Inventario.eliminarCategoria(${categoria.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    // Renderizar unidades de medida en el select
    renderUnidadesSelect: function(unidades) {
        const select = document.getElementById('unidad-producto');
        if (!select) return;

        select.innerHTML = `
            <option value="">Seleccione una unidad</option>
            ${unidades.map(uni => `
                <option value="${uni.id}">${uni.nombre} (${uni.abreviatura})</option>
            `).join('')}
        `;
    },

    // Mostrar formulario de producto
    showFormularioProducto: function(producto = null) {
        const form = document.getElementById('formulario-producto');
        if (!form) return;

        form.classList.remove('hidden');
        if (producto) {
            // Modo edición
            document.getElementById('producto-id').value = producto.id;
            document.getElementById('codigo-producto').value = producto.codigo;
            document.getElementById('nombre-producto').value = producto.nombre;
            document.getElementById('categoria-producto').value = producto.categoria;
            document.getElementById('unidad-producto').value = producto.unidad_medida;
            document.getElementById('stock-minimo-producto').value = producto.stock_minimo;
            document.getElementById('stock-actual-producto').value = producto.stock_actual;
            document.getElementById('precio-compra-producto').value = producto.precio_compra;
            document.getElementById('precio-venta-producto').value = producto.precio_venta;
            document.getElementById('estado-producto').value = producto.estado;
            document.getElementById('descripcion-producto').value = producto.descripcion;
        } else {
            // Modo creación
            form.reset();
            document.getElementById('producto-id').value = '';
        }
    },

    // Mostrar formulario de categoría
    showFormularioCategoria: function(categoria = null) {
        const form = document.getElementById('formulario-categoria');
        if (!form) return;

        form.classList.remove('hidden');
        if (categoria) {
            // Modo edición
            document.getElementById('categoria-id').value = categoria.id;
            document.getElementById('nombre-categoria').value = categoria.nombre;
            document.getElementById('descripcion-categoria').value = categoria.descripcion || '';
            document.getElementById('estado-categoria').value = categoria.estado;
        } else {
            // Modo creación
            form.reset();
            document.getElementById('categoria-id').value = '';
        }
    },

    hideFormularioCategoria: function() {
        const form = document.getElementById('formulario-categoria');
        if (form) {
            form.classList.add('hidden');
            form.reset();
        }
    },

    // Guardar producto
    guardarProducto: async function() {
        const form = document.getElementById('formulario-producto');
        if (!form) return;

        const productoId = document.getElementById('producto-id').value;
        const data = {
            codigo: document.getElementById('codigo-producto').value,
            nombre: document.getElementById('nombre-producto').value,
            categoria: document.getElementById('categoria-producto').value,
            unidad_medida: document.getElementById('unidad-producto').value,
            stock_minimo: document.getElementById('stock-minimo-producto').value,
            stock_actual: document.getElementById('stock-actual-producto').value,
            precio_compra: document.getElementById('precio-compra-producto').value,
            precio_venta: document.getElementById('precio-venta-producto').value,
            estado: document.getElementById('estado-producto').value,
            descripcion: document.getElementById('descripcion-producto').value
        };

        try {
            const url = productoId ? `${this.urls.productos}${productoId}/` : this.urls.productos;
            const method = productoId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                this.showAlert('Producto guardado exitosamente', 'success');
                form.classList.add('hidden');
                this.loadProductos();
            } else {
                const error = await response.json();
                throw new Error(error.detail || 'Error al guardar el producto');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showAlert(error.message, 'danger');
        }
    },

    // Guardar categoría
    guardarCategoria: async function() {
        const form = document.getElementById('formulario-categoria');
        if (!form) return;

        const categoriaId = document.getElementById('categoria-id').value;
        const data = {
            nombre: document.getElementById('nombre-categoria').value,
            descripcion: document.getElementById('descripcion-categoria').value,
            estado: document.getElementById('estado-categoria').value
        };

        try {
            const url = categoriaId ? `${this.urls.categorias}${categoriaId}/` : this.urls.categorias;
            const method = categoriaId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                this.showAlert('Categoría guardada exitosamente', 'success');
                this.hideFormularioCategoria();
                this.loadCategorias();
            } else {
                const error = await response.json();
                throw new Error(error.detail || 'Error al guardar la categoría');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showAlert(error.message, 'danger');
        }
    },

    // Editar producto
    editarProducto: async function(id) {
        try {
            const response = await fetch(`${this.urls.productos}${id}/`, { headers: { 'Accept': 'application/json' } });
            const producto = await response.json();
            this.showFormularioProducto(producto);
        } catch (error) {
            console.error('Error al cargar producto:', error);
            this.showAlert('Error al cargar el producto', 'danger');
        }
    },

    // Editar categoría
    editarCategoria: async function(id) {
        try {
            const response = await fetch(`${this.urls.categorias}${id}/`, { headers: { 'Accept': 'application/json' } });
            const categoria = await response.json();
            this.showFormularioCategoria(categoria);
        } catch (error) {
            console.error('Error al cargar categoría:', error);
            this.showAlert('Error al cargar la categoría', 'danger');
        }
    },

    // Eliminar producto
    eliminarProducto: async function(id) {
        if (!confirm('¿Está seguro de eliminar este producto?')) return;

        try {
            const response = await fetch(`${this.urls.productos}${id}/`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                }
            });

            if (response.ok) {
                this.showAlert('Producto eliminado exitosamente', 'success');
                this.loadProductos();
            } else {
                throw new Error('Error al eliminar el producto');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showAlert(error.message, 'danger');
        }
    },

    // Eliminar categoría
    eliminarCategoria: async function(id) {
        if (!confirm('¿Está seguro de eliminar esta categoría? Esta acción no se puede deshacer.')) return;

        try {
            const response = await fetch(`${this.urls.categorias}${id}/`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                }
            });

            if (response.ok) {
                this.showAlert('Categoría eliminada exitosamente', 'success');
                this.loadCategorias();
            } else {
                const error = await response.json();
                throw new Error(error.detail || 'Error al eliminar la categoría');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showAlert(error.message, 'danger');
        }
    },

    // Buscar productos
    buscarProductos: async function(query = '') {
        try {
            const url = query ? 
                `${this.urls.productos}?search=${encodeURIComponent(query)}` : 
                this.urls.productos;
            
            const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
            const data = await response.json();
            this.renderProductos(data);
        } catch (error) {
            console.error('Error al buscar productos:', error);
        }
    },

    // Buscar categorías
    buscarCategorias: async function(query = '') {
        try {
            const url = query ? 
                `${this.urls.categorias}?search=${encodeURIComponent(query)}` : 
                this.urls.categorias;
            
            const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
            const data = await response.json();
            this.renderCategorias(data);
        } catch (error) {
            console.error('Error al buscar categorías:', error);
            this.showAlert('Error al buscar categorías', 'danger');
        }
    },

    // Utilidades
    getCsrfToken: function() {
        return document.querySelector('[name=csrfmiddlewaretoken]').value;
    },

    getEstadoBadgeClass: function(estado) {
        const classes = {
            'activo': 'bg-success',
            'inactivo': 'bg-warning',
            'descontinuado': 'bg-danger'
        };
        return classes[estado] || 'bg-secondary';
    },

    showAlert: function(message, type = 'info') {
        // Implementar según el sistema de alertas de tu aplicación
        alert(message);
    },

    // Funciones de reportes
    generateReport: async function(tipo) {
        try {
            let url;
            let params = {};

            switch(tipo) {
                case 'stock-bajo':
                    url = `${this.urls.productos}stock_bajo/`;
                    break;
                case 'valor-inventario':
                    url = `${this.urls.productos}valor_inventario/`;
                    break;
                case 'movimientos':
                    const fechaInicio = document.getElementById('fecha-inicio').value;
                    const fechaFin = document.getElementById('fecha-fin').value;
                    if (!fechaInicio || !fechaFin) {
                        throw new Error('Por favor seleccione las fechas de inicio y fin');
                    }
                    url = `${this.urls.movimientos}reporte_movimientos/`;
                    params = { fecha_inicio: fechaInicio, fecha_fin: fechaFin };
                    break;
                default:
                    throw new Error('Tipo de reporte no válido');
            }

            // Construir URL con parámetros
            if (Object.keys(params).length > 0) {
                const queryString = new URLSearchParams(params).toString();
                url = `${url}?${queryString}`;
            }

            const response = await fetch(url, { headers: { 'Accept': 'application/json', 'X-CSRFToken': this.getCsrfToken() }, method: 'GET' });
            if (!response.ok) {
                throw new Error('Error al generar el reporte');
            }

            const data = await response.json();
            this.mostrarReporte(tipo, data);
        } catch (error) {
            console.error('Error al generar reporte:', error);
            this.showAlert(error.message, 'danger');
        }
    },

    mostrarReporte: function(tipo, data) {
        let mensaje = '';
        let titulo = '';

        switch(tipo) {
            case 'stock-bajo':
                titulo = 'Productos con Stock Bajo';
                if (data.length === 0) {
                    mensaje = 'No hay productos con stock bajo.';
                } else {
                    mensaje = 'Los siguientes productos tienen stock bajo:\n\n';
                    data.forEach(producto => {
                        mensaje += `${producto.nombre}: ${producto.stock_actual} (Mínimo: ${producto.stock_minimo})\n`;
                    });
                }
                break;
            case 'valor-inventario':
                titulo = 'Valor del Inventario';
                mensaje = `El valor total del inventario es: $${data.valor_total.toFixed(2)}`;
                break;
            case 'movimientos':
                titulo = 'Reporte de Movimientos';
                if (data.length === 0) {
                    mensaje = 'No hay movimientos en el período seleccionado.';
                } else {
                    mensaje = 'Movimientos en el período:\n\n';
                    data.forEach(mov => {
                        mensaje += `${mov.fecha}: ${mov.tipo} - ${mov.producto.nombre} (${mov.cantidad})\n`;
                    });
                }
                break;
        }

        // Mostrar el reporte en un modal o alerta
        alert(`${titulo}\n\n${mensaje}`);
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    Inventario.init();
}); 