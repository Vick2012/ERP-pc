// Funciones para el módulo de Recursos Humanos
const RecursosHumanos = {
    // Función para buscar empleado por documento
    buscarEmpleado: async function(documento) {
        try {
            const response = await fetch(`/api/recursos_humanos/empleados/?documento=${documento}`);
            const data = await response.json();
            return data.length > 0 ? data[0] : null;
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
                <p><strong>Nombre:</strong> ${empleado.nombre}</p>
                <p><strong>Documento:</strong> ${empleado.documento}</p>
                <p><strong>Cargo:</strong> ${empleado.cargo}</p>
                <p><strong>Área:</strong> ${empleado.area}</p>
            `;
            infoEmpleado.classList.remove('d-none');
            empleadoIdInput.value = empleado.id;
            
            // Cargar registros del empleado
            this.cargarRegistros(empleado.documento);
        } else {
            datosEmpleado.innerHTML = '<p class="text-danger">No se encontró el empleado</p>';
            infoEmpleado.classList.remove('d-none');
            empleadoIdInput.value = '';
        }
    },

    // Cargar registros de ausentismos y horas extras
    cargarRegistros: async function(documento) {
        try {
            const response = await fetch(`/api/recursos_humanos/ausentismos/?documento=${documento}`);
            const data = await response.json();
            this.mostrarRegistros(data);
        } catch (error) {
            console.error('Error al cargar registros:', error);
        }
    },

    // Mostrar registros en la tabla
    mostrarRegistros: function(registros) {
        const tbody = document.querySelector('#tabla-ausentismos tbody');
        tbody.innerHTML = '';

        registros.forEach(registro => {
            const row = document.createElement('tr');
            row.dataset.tipo = registro.tipo;
            row.innerHTML = `
                <td>${registro.documento}</td>
                <td>${registro.empleado_nombre}</td>
                <td>${registro.tipo === 'ausentismo' ? 'Ausentismo' : 'Horas Extras'}</td>
                <td>${registro.fecha}</td>
                <td>${this.formatearDuracion(registro)}</td>
                <td>${registro.motivo}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="RecursosHumanos.editarRegistro(${registro.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="RecursosHumanos.eliminarRegistro(${registro.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    },

    // Formatear duración según el tipo de registro
    formatearDuracion: function(registro) {
        if (registro.tipo === 'ausentismo') {
            return `${registro.duracion_horas} horas`;
        } else {
            return `D: ${registro.horas_extra_diurnas}, N: ${registro.horas_extra_nocturnas}, 
                    RN: ${registro.recargos_nocturnos}, F: ${registro.horas_extra_dominicales}`;
        }
    },

    // Filtrar registros
    filtrarRegistros: function(tipo) {
        const rows = document.querySelectorAll('#tabla-ausentismos tbody tr');
        rows.forEach(row => {
            if (tipo === 'todos' || row.dataset.tipo === tipo) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });

        // Actualizar estado de los botones
        document.querySelectorAll('.btn-group .btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase().includes(tipo)) {
                btn.classList.add('active');
            }
        });
    },

    // Calcular total de horas extras
    calcularTotalHorasExtras: function() {
        const diurnas = parseFloat(document.getElementById('horas-extra-diurnas').value) || 0;
        const nocturnas = parseFloat(document.getElementById('horas-extra-nocturnas').value) || 0;
        const recargos = parseFloat(document.getElementById('recargos-nocturnos').value) || 0;
        const dominicales = parseFloat(document.getElementById('horas-extra-dominicales').value) || 0;
        
        const total = diurnas + nocturnas + recargos + dominicales;
        document.getElementById('total-horas-extras').textContent = total.toFixed(1);
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

        // Formulario de registro
        const formAusentismos = document.getElementById('form-ausentismos');
        if (formAusentismos) {
            formAusentismos.addEventListener('submit', async (e) => {
                e.preventDefault();
                const documento = document.getElementById('buscar-documento-ausentismo').value.trim();
                const tipo = document.getElementById('ausentismos-tipo').value;
                
                if (!documento) {
                    alert('Por favor, busque un empleado primero');
                    return;
                }

                const formData = {
                    documento: documento,
                    tipo: tipo,
                    fecha: document.getElementById('ausentismos-fecha').value,
                    motivo: document.getElementById('ausentismos-motivo').value,
                    duracion_horas: 0,
                    horas_extra_diurnas: 0,
                    horas_extra_nocturnas: 0,
                    recargos_nocturnos: 0,
                    horas_extra_dominicales: 0
                };

                if (tipo === 'ausentismo') {
                    formData.duracion_horas = parseFloat(document.getElementById('ausentismos-duracion').value) || 0;
                } else if (tipo === 'horas_extras') {
                    formData.horas_extra_diurnas = parseFloat(document.getElementById('horas-extra-diurnas').value) || 0;
                    formData.horas_extra_nocturnas = parseFloat(document.getElementById('horas-extra-nocturnas').value) || 0;
                    formData.recargos_nocturnos = parseFloat(document.getElementById('recargos-nocturnos').value) || 0;
                    formData.horas_extra_dominicales = parseFloat(document.getElementById('horas-extra-dominicales').value) || 0;
                }

                try {
                    const response = await fetch('/api/recursos_humanos/ausentismos/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                        },
                        body: JSON.stringify(formData)
                    });

                    const responseData = await response.json();

                    if (response.ok) {
                        alert('Registro guardado exitosamente');
                        formAusentismos.reset();
                        document.getElementById('info-empleado-ausentismo').classList.add('d-none');
                        // Recargar registros
                        if (documento) {
                            this.cargarRegistros(documento);
                        }
                    } else {
                        console.error('Error del servidor:', responseData);
                        const errorMessages = [];
                        for (const [field, errors] of Object.entries(responseData)) {
                            errorMessages.push(`${field}: ${errors.join(', ')}`);
                        }
                        alert('Error al guardar el registro:\n' + errorMessages.join('\n'));
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error al guardar el registro');
                }
            });
        }

        // Botón para limpiar formulario
        const btnLimpiar = document.getElementById('limpiar-ausentismos');
        if (btnLimpiar) {
            btnLimpiar.addEventListener('click', () => {
                formAusentismos.reset();
                document.getElementById('info-empleado-ausentismo').classList.add('d-none');
                document.getElementById('total-horas-extras').textContent = '0';
            });
        }
    }
};

// Hacer accesibles las funciones de filtrado globalmente
window.filtrarRegistros = function(tipo) {
    RecursosHumanos.filtrarRegistros(tipo);
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    RecursosHumanos.init();
}); 