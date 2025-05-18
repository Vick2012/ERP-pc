// Funciones para el módulo de Recursos Humanos
const RecursosHumanos = {
    // Función para buscar empleado por documento
    buscarEmpleado: async function(documento) {
        try {
            const response = await fetch(`/api/recursos_humanos/empleados/`);
            const empleados = await response.json();
            const empleado = empleados.find(e => e.documento === documento);
            return empleado || null;
        } catch (error) {
            console.error('Error al buscar empleado:', error);
            return null;
        }
    },

    // Mostrar información del empleado
    mostrarInfoEmpleado: function(empleado) {
        const infoEmpleado = document.getElementById('info-empleado-ausentismo');
        const datosEmpleado = document.getElementById('datos-empleado-ausentismo');
        const empleadoIdInput = document.getElementById('ausentismos-empleado');

        if (empleado) {
            datosEmpleado.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Nombre:</strong> ${empleado.nombre}</p>
                        <p><strong>Documento:</strong> ${empleado.documento}</p>
                        <p><strong>Cargo:</strong> ${empleado.cargo}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Área:</strong> ${empleado.area}</p>
                        <p><strong>Teléfono:</strong> ${empleado.telefono || 'No especificado'}</p>
                        <p><strong>Correo:</strong> ${empleado.correo || 'No especificado'}</p>
                    </div>
                </div>
            `;
            infoEmpleado.classList.remove('d-none');
            empleadoIdInput.value = empleado.id;
            
            // Cargar registros del empleado
            if (typeof cargarRegistrosEmpleado === 'function') {
                cargarRegistrosEmpleado(empleado.documento);
            }
        } else {
            datosEmpleado.innerHTML = '<div class="alert alert-warning">No se encontró el empleado</div>';
            infoEmpleado.classList.remove('d-none');
            empleadoIdInput.value = '';
        }
    },

    // Calcular total de horas extras
    calcularTotalHorasExtras: function() {
        const diurnas = parseFloat(document.getElementById('horas-extra-diurnas').value) || 0;
        const nocturnas = parseFloat(document.getElementById('horas-extra-nocturnas').value) || 0;
        const recargos = parseFloat(document.getElementById('recargos-nocturnos').value) || 0;
        const dominicales = parseFloat(document.getElementById('horas-extra-dominicales').value) || 0;
        
        const total = diurnas + nocturnas + recargos + dominicales;
        document.getElementById('total-horas-extras').textContent = total.toFixed(1);
        
        // También actualizar el campo de duración total
        const duracionInput = document.getElementById('ausentismos-duracion');
        if (duracionInput) {
            duracionInput.value = total.toFixed(1);
        }
    },

    // Inicializar eventos
    init: function() {
        // Inicializar los tabs de Bootstrap
        const tabs = document.querySelectorAll('[data-bs-toggle="tab"]');
        tabs.forEach(tab => {
            const bsTab = new bootstrap.Tab(tab);
            
            // Agregar evento para manejar el cambio de pestaña
            tab.addEventListener('shown.bs.tab', function (event) {
                const targetId = event.target.getAttribute('data-bs-target');
                const targetPane = document.querySelector(targetId);
                if (targetPane) {
                    // Asegurar que el contenido sea visible
                    targetPane.classList.add('show', 'active');
                }
            });
        });

        // Activar la primera pestaña por defecto
        const firstTab = document.querySelector('#moduloTabs .nav-link');
        if (firstTab) {
            const bsTab = new bootstrap.Tab(firstTab);
            bsTab.show();
        }

        // Asegurar que el contenido inicial sea visible
        const activePane = document.querySelector('.tab-pane.active');
        if (activePane) {
            activePane.classList.add('show');
        }

        // Evento para buscar empleado
        const btnBuscarEmpleado = document.getElementById('buscar-empleado-ausentismo');
        const inputDocumento = document.getElementById('buscar-documento-ausentismo');

        if (btnBuscarEmpleado && inputDocumento) {
            btnBuscarEmpleado.addEventListener('click', async () => {
                const documento = inputDocumento.value.trim();
                if (documento) {
                    const empleado = await this.buscarEmpleado(documento);
                    this.mostrarInfoEmpleado(empleado);
                }
            });

            // Agregar evento para buscar con Enter
            inputDocumento.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter') {
                    const documento = inputDocumento.value.trim();
                    if (documento) {
                        const empleado = await this.buscarEmpleado(documento);
                        this.mostrarInfoEmpleado(empleado);
                    }
                }
            });
        }

        // Evento para cambio de tipo de registro
        const selectTipo = document.getElementById('ausentismos-tipo');
        if (selectTipo) {
            selectTipo.addEventListener('change', function() {
                const duracionDiv = document.getElementById('ausentismo-duracion');
                const horasExtrasDiv = document.getElementById('horas-extras-detalles');

                if (this.value === 'ausentismo') {
                    duracionDiv.classList.remove('d-none');
                    horasExtrasDiv.classList.add('d-none');
                } else if (this.value === 'horas_extras') {
                    duracionDiv.classList.add('d-none');
                    horasExtrasDiv.classList.remove('d-none');
                }
            });
        }

        // Eventos para calcular total de horas extras
        ['horas-extra-diurnas', 'horas-extra-nocturnas', 'recargos-nocturnos', 'horas-extra-dominicales'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => this.calcularTotalHorasExtras());
            }
        });

        // Configurar eventos de filtrado
        this.initFiltros();
    },

    // Inicializar eventos de filtrado
    initFiltros: function() {
        // Eventos para botones de tipo
        const botonesFilter = document.querySelectorAll('[data-filter]');
        botonesFilter.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remover active de todos los botones
                botonesFilter.forEach(b => b.classList.remove('active'));
                // Agregar active al botón clickeado
                btn.classList.add('active');
                this.aplicarFiltros();
            });
        });

        // Eventos para filtros de fecha
        const filtroFechaDesde = document.getElementById('filtro-fecha-desde');
        const filtroFechaHasta = document.getElementById('filtro-fecha-hasta');
        
        if (filtroFechaDesde) {
            filtroFechaDesde.addEventListener('change', () => this.aplicarFiltros());
        }
        if (filtroFechaHasta) {
            filtroFechaHasta.addEventListener('change', () => this.aplicarFiltros());
        }

        // Botones de aplicar y limpiar filtros
        const btnAplicar = document.getElementById('aplicar-filtros');
        const btnLimpiar = document.getElementById('limpiar-filtros');

        if (btnAplicar) {
            btnAplicar.addEventListener('click', () => this.aplicarFiltros());
        }
        if (btnLimpiar) {
            btnLimpiar.addEventListener('click', () => this.limpiarFiltros());
        }
    },

    // Aplicar filtros
    aplicarFiltros: function() {
        const tabla = document.getElementById('tabla-ausentismos');
        if (!tabla) return;

        const filas = tabla.querySelectorAll('tbody tr');
        const fechaDesde = document.getElementById('filtro-fecha-desde').value;
        const fechaHasta = document.getElementById('filtro-fecha-hasta').value;
        
        // Obtener el tipo actualmente seleccionado
        const botonActivo = document.querySelector('.btn-group .btn.active');
        const tipoSeleccionado = botonActivo ? botonActivo.getAttribute('data-filter') : 'todos';
        
        console.log('Iniciando filtrado con parámetros:', {
            fechaDesde,
            fechaHasta,
            tipoSeleccionado
        });
        
        let registrosFiltrados = 0;
        const totalRegistros = filas.length;
        
        filas.forEach((fila, index) => {
            let mostrar = true;
            
            // Filtrar por tipo
            if (tipoSeleccionado !== 'todos') {
                const tipoCell = fila.querySelector('td:nth-child(2) span').textContent.trim();
                const tipoRegistro = tipoCell === 'Horas Extras' ? 'horas_extras' : 'ausentismo';
                if (tipoRegistro !== tipoSeleccionado) {
                    mostrar = false;
                }
            }
            
            // Filtrar por fechas
            if (mostrar && (fechaDesde || fechaHasta)) {
                const fechaRegistro = fila.cells[2].textContent.trim();
                
                console.log(`Fila ${index + 1} - Comparando fechas:`, {
                    fechaRegistro,
                    fechaDesde,
                    fechaHasta
                });

                // Comparar fechas (las fechas ya están en formato YYYY-MM-DD)
                if (fechaDesde && fechaRegistro < fechaDesde) {
                    console.log(`Fila ${index + 1} - Registro anterior a fecha desde`);
                    mostrar = false;
                }
                if (fechaHasta && fechaRegistro > fechaHasta) {
                    console.log(`Fila ${index + 1} - Registro posterior a fecha hasta`);
                    mostrar = false;
                }
            }
            
            // Aplicar visibilidad
            fila.style.display = mostrar ? '' : 'none';
            if (mostrar) {
                registrosFiltrados++;
                console.log(`Fila ${index + 1} - Registro mostrado`);
            } else {
                console.log(`Fila ${index + 1} - Registro oculto`);
            }
        });
        
        console.log('Resultado del filtrado:', {
            totalRegistros,
            registrosFiltrados
        });

        // Mostrar resumen de filtrado
        const resumenFiltros = document.createElement('div');
        resumenFiltros.className = 'alert alert-info mt-3';
        resumenFiltros.innerHTML = `
            <i class="fas fa-info-circle me-2"></i>
            Mostrando ${registrosFiltrados} de ${totalRegistros} registros
            ${tipoSeleccionado !== 'todos' ? `<br>Tipo: ${tipoSeleccionado === 'horas_extras' ? 'Horas Extras' : 'Ausentismo'}` : ''}
            ${fechaDesde ? `<br>Desde: ${this.formatearFecha(fechaDesde)}` : ''}
            ${fechaHasta ? `<br>Hasta: ${this.formatearFecha(fechaHasta)}` : ''}
        `;
        
        // Actualizar o agregar el resumen al DOM
        const resumenExistente = tabla.parentElement.querySelector('.alert');
        if (resumenExistente) {
            resumenExistente.replaceWith(resumenFiltros);
        } else {
            tabla.parentElement.insertBefore(resumenFiltros, tabla);
        }
    },

    // Formatear fecha para mostrar en el resumen
    formatearFecha: function(fechaStr) {
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // Limpiar filtros
    limpiarFiltros: function() {
        // Limpiar campos de fecha
        document.getElementById('filtro-fecha-desde').value = '';
        document.getElementById('filtro-fecha-hasta').value = '';
        
        // Restablecer botón de tipo a "Todos"
        const botones = document.querySelectorAll('.btn-group .btn');
        botones.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-filter') === 'todos') {
                btn.classList.add('active');
            }
        });
        
        // Mostrar todas las filas
        const tabla = document.getElementById('tabla-ausentismos');
        if (tabla) {
            tabla.querySelectorAll('tbody tr').forEach(fila => {
                fila.style.display = '';
            });
            
            // Eliminar el resumen de filtros si existe
            const resumen = tabla.parentElement.querySelector('.alert');
            if (resumen) {
                resumen.remove();
            }
        }

        // Aplicar filtros para actualizar el resumen
        this.aplicarFiltros();
    }
};

// Función para formatear fecha en formato legible
function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    RecursosHumanos.init();
}); 