class Inventario {
    static init() {
        // Inicializar elementos
        this.initElements();
        // Configurar eventos
        this.setupEventListeners();
        // Cargar datos iniciales
        this.loadInitialData();
    }

    static initElements() {
        // Elementos de productos
        this.productoModal = new bootstrap.Modal(document.getElementById('productoModal'));
        this.formProducto = document.getElementById('form-producto');
        this.btnAddProducto = document.getElementById('add-producto');
        this.tablaProductos = document.getElementById('tabla-productos');
        
        // Elementos de movimientos
        this.movimientoModal = new bootstrap.Modal(document.getElementById('movimientoModal'));
        this.formMovimiento = document.getElementById('form-movimiento');
        this.btnAddMovimiento = document.getElementById('add-movimiento');
        this.tablaMovimientos = document.getElementById('tabla-movimientos');
        
        // Elementos de reportes
        this.formReporte = document.getElementById('form-reporte');
    }

    static setupEventListeners() {
        // Eventos de productos
        if (this.btnAddProducto) {
            this.btnAddProducto.addEventListener('click', () => this.showProductoModal());
        }
        if (this.formProducto) {
            this.formProducto.addEventListener('submit', (e) => this.handleProductoSubmit(e));
        }
        
        // Eventos de movimientos
        if (this.btnAddMovimiento) {
            this.btnAddMovimiento.addEventListener('click', () => this.showMovimientoModal());
        }
        if (this.formMovimiento) {
            this.formMovimiento.addEventListener('submit', (e) => this.handleMovimientoSubmit(e));
        }
        
        // Eventos de reportes
        if (this.formReporte) {
            this.formReporte.addEventListener('submit', (e) => this.handleReporteSubmit(e));
        }
    }

    static async loadInitialData() {
        await Promise.all([
            this.loadProductos(),
            this.loadCategorias(),
            this.loadMovimientos(),
            this.loadEstadisticas()
        ]);
    }

    // Métodos para Productos
    static async loadProductos() {
        try {
            const response = await fetch('/api/inventario/productos/');
            if (!response.ok) throw new Error('Error al cargar productos');
            const productos = await response.json();
            this.renderProductosTable(productos);
        } catch (error) {
            console.error('Error:', error);
            this.showError('Error al cargar los productos');
        }
    }

    static renderProductosTable(productos) {
        if (!this.tablaProductos) return;
        
        const tbody = this.tablaProductos.querySelector('tbody');
        tbody.innerHTML = '';
        
        productos.forEach(producto => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${producto.codigo}</td>
                <td>${producto.nombre}</td>
                <td>${producto.categoria_nombre}</td>
                <td>${producto.stock_actual}</td>
                <td>${this.formatCurrency(producto.precio_compra)}</td>
                <td>${this.formatCurrency(producto.precio_venta)}</td>
                <td><span class="badge bg-${producto.estado === 'activo' ? 'success' : 'warning'}">${producto.estado}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="Inventario.editarProducto(${producto.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="Inventario.eliminarProducto(${producto.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Métodos para Movimientos
    static async loadMovimientos() {
        try {
            const response = await fetch('/api/inventario/movimientos/');
            if (!response.ok) throw new Error('Error al cargar movimientos');
            const movimientos = await response.json();
            this.renderMovimientosTable(movimientos);
        } catch (error) {
            console.error('Error:', error);
            this.showError('Error al cargar los movimientos');
        }
    }

    static renderMovimientosTable(movimientos) {
        if (!this.tablaMovimientos) return;
        
        const tbody = this.tablaMovimientos.querySelector('tbody');
        tbody.innerHTML = '';
        
        movimientos.forEach(movimiento => {
            const tr = document.createElement('tr');
            const total = movimiento.cantidad * movimiento.precio_unitario;
            tr.innerHTML = `
                <td>${this.formatDate(movimiento.fecha)}</td>
                <td><span class="badge bg-${this.getTipoBadgeClass(movimiento.tipo)}">${movimiento.tipo}</span></td>
                <td>${movimiento.producto_nombre}</td>
                <td>${movimiento.cantidad}</td>
                <td>${this.formatCurrency(movimiento.precio_unitario)}</td>
                <td>${this.formatCurrency(total)}</td>
                <td>${movimiento.documento_referencia || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="Inventario.verDetalleMovimiento(${movimiento.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Métodos para Estadísticas
    static async loadEstadisticas() {
        try {
            const [valorResponse, stockBajoResponse, totalResponse, movimientosResponse] = await Promise.all([
                fetch('/api/inventario/productos/valor_inventario/'),
                fetch('/api/inventario/productos/stock_bajo/'),
                fetch('/api/inventario/productos/'),
                fetch('/api/inventario/movimientos/')
            ]);

            const valorData = await valorResponse.json();
            const stockBajoData = await stockBajoResponse.json();
            const totalData = await totalResponse.json();
            const movimientosData = await movimientosResponse.json();

            // Actualizar widgets
            document.getElementById('valor-total-inventario').textContent = 
                this.formatCurrency(valorData.valor_total);
            document.getElementById('productos-stock-bajo').textContent = 
                stockBajoData.length;
            document.getElementById('total-productos').textContent = 
                totalData.length;
            document.getElementById('movimientos-mes').textContent = 
                this.contarMovimientosMes(movimientosData);

        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
            this.showError('Error al cargar las estadísticas');
        }
    }

    // Métodos Auxiliares
    static formatCurrency(value) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(value);
    }

    static formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static getTipoBadgeClass(tipo) {
        const classes = {
            'entrada': 'success',
            'salida': 'danger',
            'ajuste': 'warning'
        };
        return classes[tipo] || 'secondary';
    }

    static contarMovimientosMes(movimientos) {
        const hoy = new Date();
        const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        return movimientos.filter(m => new Date(m.fecha) >= primerDiaMes).length;
    }

    static showError(message) {
        // Implementar según el sistema de notificaciones que uses
        alert(message);
    }

    static showSuccess(message) {
        // Implementar según el sistema de notificaciones que uses
        alert(message);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    Inventario.init();
}); 