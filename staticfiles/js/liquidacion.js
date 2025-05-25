// Constantes para cálculos de liquidación según el CST colombiano
const FACTORES_LIQUIDACION = {
    // Seguridad Social
    SALUD_EMPLEADOR: 0.085,          // 8.5% aporte empleador
    SALUD_EMPLEADO: 0.04,            // 4% aporte empleado
    PENSION_EMPLEADOR: 0.12,         // 12% aporte empleador
    PENSION_EMPLEADO: 0.04,          // 4% aporte empleado
    ARL_RIESGO_1: 0.00522,          // Riesgo I (0.522%)
    ARL_RIESGO_2: 0.01044,          // Riesgo II (1.044%)
    ARL_RIESGO_3: 0.02436,          // Riesgo III (2.436%)
    ARL_RIESGO_4: 0.0435,           // Riesgo IV (4.35%)
    ARL_RIESGO_5: 0.0696,           // Riesgo V (6.96%)
    
    // Parafiscales
    SENA: 0.02,                      // 2% SENA
    ICBF: 0.03,                      // 3% ICBF
    CAJA_COMPENSACION: 0.04,         // 4% Caja de Compensación
    
    // Prestaciones Sociales (factores anuales)
    PRIMA_SERVICIOS: 1,              // Un mes de salario por año (30 días)
    CESANTIAS: 1,                    // Un mes de salario por año (30 días)
    INTERESES_CESANTIAS: 0.12,       // 12% anual sobre cesantías
    VACACIONES: {
        DIAS_POR_ANO: 15,            // 15 días hábiles de vacaciones por año (Art. 186 CST)
        FACTOR_DIARIO: 15/360,       // Factor para cálculo proporcional
        BASE_CALCULO: 'SALARIO_BASE' // Solo salario base, no incluye auxilio de transporte
    },
    
    // Indemnizaciones por despido sin justa causa (en días de salario)
    INDEMNIZACION_FIJO: {
        TIEMPO_RESTANTE: 1           // Salarios que faltan hasta terminar el contrato
    },
    INDEMNIZACION_INDEFINIDO: {
        MENOS_1_ANO: 30,             // 30 días si es menos de 1 año
        ENTRE_1_5_ANOS: {
            PRIMER_ANO: 30,          // 30 días por el primer año
            ANOS_SIGUIENTES: 20      // 20 días por cada año adicional hasta el quinto
        },
        ENTRE_5_10_ANOS: 15,         // 15 días adicionales por cada año después del quinto hasta el décimo
        MAS_10_ANOS: 20              // 20 días adicionales por cada año después del décimo
    },
    
    // Valores 2024
    AUXILIO_TRANSPORTE: 140606,      // Auxilio de transporte 2024
    SALARIO_MINIMO: 1300000          // Salario mínimo 2024
};

// Tipos de terminación de contrato
const TIPOS_TERMINACION = {
    TERMINACION_CONTRATO: 'terminacion_contrato',
    SIN_JUSTA_CAUSA: 'sin_justa_causa',
    CON_JUSTA_CAUSA: 'con_justa_causa',
    RENUNCIA: 'renuncia'
};

// Clase principal para manejar liquidaciones y costos laborales
class LiquidacionLaboral {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.activeTab = 'costos';
        this.lastScrollPosition = 0;
        this.FACTORES_MOTIVO = {
            'terminacion_contrato_vencimiento': { indemnizacion: false },
            'terminacion_contrato_mutuo': { indemnizacion: false },
            'terminacion_contrato_obra': { indemnizacion: false },
            'renuncia_voluntaria': { indemnizacion: false },
            'renuncia_justificada': { indemnizacion: false },
            'despido_sin_justa_causa': { indemnizacion: true },
            'despido_con_justa_causa': { indemnizacion: false },
            'muerte_trabajador': { indemnizacion: false },
            'pension_vejez': { indemnizacion: false },
            'pension_invalidez': { indemnizacion: false }
        };
        
        // Initialize Bootstrap tabs
        const tabElements = document.querySelectorAll('[data-bs-toggle="tab"]');
        tabElements.forEach(tab => {
            new bootstrap.Tab(tab);
        });
    }

    initializeElements() {
        // Elementos del formulario de búsqueda
        this.documentoInput = document.getElementById('liquidacion-documento');
        this.buscarBtn = document.getElementById('buscar-liquidacion');
        this.infoEmpleado = document.getElementById('info-empleado-liquidacion');
        this.formContainer = document.getElementById('liquidacion-form-container');
        
        // Elementos del formulario de liquidación
        this.estadoSwitch = document.getElementById('estado-empleado-switch');
        this.badgeActivo = document.getElementById('estado-badge-activo');
        this.badgeRetirado = document.getElementById('estado-badge-retirado');
        this.liquidacionForm = document.getElementById('form-liquidacion');
        this.motivoRetiro = document.getElementById('motivo-retiro');
        this.fechaInicio = document.getElementById('fecha-inicio');
        this.fechaFin = document.getElementById('fecha-fin');
        this.cancelarBtn = document.getElementById('cancelar-liquidacion');
        this.resultadosContainer = document.getElementById('resultados-liquidacion');
        
        // Elementos de costos al empleador
        this.nivelRiesgoArl = document.getElementById('nivel-riesgo-arl');
        this.costosEmpleador = document.getElementById('costos-empleador');
    }

    setupEventListeners() {
        // Evento de búsqueda de empleado
        this.buscarBtn.addEventListener('click', () => this.buscarEmpleado());
        this.documentoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.buscarEmpleado();
            }
        });

        // Eventos del formulario de liquidación
        this.estadoSwitch.addEventListener('change', () => this.toggleEstadoEmpleado());
        this.liquidacionForm.addEventListener('submit', (e) => this.calcularLiquidacion(e));
        this.cancelarBtn.addEventListener('click', () => this.cancelarLiquidacion());

        // Eventos de fechas
        this.fechaInicio.addEventListener('change', () => this.validarFechas());
        this.fechaFin.addEventListener('change', () => this.validarFechas());

        // Evento para cambio de nivel de riesgo ARL
        if (this.nivelRiesgoArl) {
            this.nivelRiesgoArl.addEventListener('change', () => this.calcularCostosMensuales());
        }
    }

    async buscarEmpleado() {
        const documento = this.documentoInput.value.trim();
        if (!documento) {
            this.mostrarError('Por favor ingrese un número de documento');
            return;
        }

        try {
            const response = await fetch(`/api/recursos_humanos/empleados/?documento=${documento}`);
            const data = await response.json();
            
            if (data && data.length > 0) {
                const empleado = data[0];
                
                // Verificar que todos los elementos necesarios existen
                const empleadoDataInput = document.getElementById('empleado-liquidacion-data');
                if (!empleadoDataInput) {
                    console.error('No se encontró el elemento empleado-liquidacion-data');
                    this.mostrarError('Error en la configuración del formulario');
                    return;
                }

                // Guardar datos del empleado para cálculos
                empleadoDataInput.value = JSON.stringify(empleado);

                // Mostrar información del empleado
                this.mostrarInfoEmpleado(empleado);

                // Configurar estado y visibilidad
                if (this.formContainer) {
                    this.formContainer.style.display = 'block';
                }
                if (this.estadoSwitch) {
                    this.estadoSwitch.checked = empleado.estado === 'retirado';
                    this.toggleEstadoEmpleado();
                }
                
                // Calcular costos al empleador
                this.calcularCostosMensuales();
                
                // Mostrar sección de costos
                if (this.costosEmpleador) {
                    this.costosEmpleador.style.display = 'block';
                }
            } else {
                this.mostrarError('No se encontró ningún empleado con ese documento');
                this.limpiarFormulario();
            }
        } catch (error) {
            console.error('Error al buscar empleado:', error);
            this.mostrarError('Error al buscar empleado');
            this.limpiarFormulario();
        }
    }

    limpiarFormulario() {
        // Ocultar contenedores
        if (this.formContainer) {
            this.formContainer.style.display = 'none';
        }
        if (this.costosEmpleador) {
            this.costosEmpleador.style.display = 'none';
        }
        if (this.infoEmpleado) {
            this.infoEmpleado.innerHTML = '';
        }

        // Limpiar datos del empleado
        const empleadoDataInput = document.getElementById('empleado-liquidacion-data');
        if (empleadoDataInput) {
            empleadoDataInput.value = '';
        }

        // Resetear switch de estado si existe
        if (this.estadoSwitch) {
            this.estadoSwitch.checked = false;
            this.toggleEstadoEmpleado();
        }

        // Limpiar costos
        const elementos = [
            'salud', 'pension', 'arl', 'sena', 'icbf', 'caja',
            'prima', 'cesantias', 'intereses', 'vacaciones', 'total-costos'
        ];
        
        elementos.forEach(id => {
            const elemento = document.getElementById(`costo-${id}`);
            if (elemento) {
                elemento.textContent = '$0';
            }
        });
    }

    mostrarInfoEmpleado(empleado) {
        if (!this.infoEmpleado) return;

        // Crear contenedor de información del empleado
        this.infoEmpleado.innerHTML = `
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title mb-4">Información del Empleado</h5>
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Nombre:</strong> ${empleado.nombre}</p>
                            <p><strong>Documento:</strong> ${empleado.documento}</p>
                            <p><strong>Cargo:</strong> ${empleado.cargo}</p>
                            <p><strong>Área:</strong> ${empleado.area}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Fecha de Ingreso:</strong> ${empleado.fecha_ingreso || 'No especificada'}</p>
                            <p><strong>Tipo de Contrato:</strong> ${empleado.contrato || 'No especificado'}</p>
                            <p><strong>Salario Base:</strong> ${this.formatearMoneda(empleado.salario)}</p>
                            <p><strong>Estado:</strong> ${empleado.estado || 'Activo'}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Crear o actualizar contenedor de costos al empleador
        let costosContainer = document.getElementById('costos-empleador');
        if (!costosContainer) {
            costosContainer = document.createElement('div');
            costosContainer.id = 'costos-empleador';
            costosContainer.className = 'card mb-4';
            this.infoEmpleado.appendChild(costosContainer);
        }

        costosContainer.innerHTML = `
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0"><i class="fas fa-calculator me-2"></i>Costos Mensuales al Empleador</h5>
            </div>
            <div class="card-body">
                <div class="row mb-3">
                    <div class="col-md-4">
                        <label for="nivel-riesgo-arl" class="form-label">Nivel de Riesgo ARL:</label>
                        <select class="form-select" id="nivel-riesgo-arl">
                            <option value="1">Nivel I - Riesgo Mínimo (0.522%)</option>
                            <option value="2">Nivel II - Riesgo Bajo (1.044%)</option>
                            <option value="3">Nivel III - Riesgo Medio (2.436%)</option>
                            <option value="4">Nivel IV - Riesgo Alto (4.350%)</option>
                            <option value="5">Nivel V - Riesgo Máximo (6.960%)</option>
                        </select>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-4">
                        <h6 class="border-bottom pb-2">Seguridad Social</h6>
                        <div class="mb-2">
                            <span>Salud (8.5%):</span>
                            <span id="salud" class="float-end"></span>
                        </div>
                        <div class="mb-2">
                            <span>Pensión (12%):</span>
                            <span id="pension" class="float-end"></span>
                        </div>
                        <div class="mb-2">
                            <span>ARL:</span>
                            <span id="arl" class="float-end"></span>
                        </div>
                    </div>
                    
                    <div class="col-md-4">
                        <h6 class="border-bottom pb-2">Parafiscales</h6>
                        <div class="mb-2">
                            <span>SENA (2%):</span>
                            <span id="sena" class="float-end"></span>
                        </div>
                        <div class="mb-2">
                            <span>ICBF (3%):</span>
                            <span id="icbf" class="float-end"></span>
                        </div>
                        <div class="mb-2">
                            <span>Caja (4%):</span>
                            <span id="caja" class="float-end"></span>
                        </div>
                    </div>
                    
                    <div class="col-md-4">
                        <h6 class="border-bottom pb-2">Prestaciones Sociales</h6>
                        <div class="mb-2">
                            <span>Prima (8.33%):</span>
                            <span id="prima" class="float-end"></span>
                        </div>
                        <div class="mb-2">
                            <span>Cesantías (8.33%):</span>
                            <span id="cesantias" class="float-end"></span>
                        </div>
                        <div class="mb-2">
                            <span>Int. Cesantías (1%):</span>
                            <span id="int-cesantias" class="float-end"></span>
                        </div>
                        <div class="mb-2">
                            <span>Vacaciones (4.17%):</span>
                            <span id="vacaciones" class="float-end"></span>
                        </div>
                    </div>
                </div>

                <div class="row mt-4">
                    <div class="col-12">
                        <div class="alert alert-info">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>Total Costos al Empleador:</strong>
                                    <span id="total-costos" class="ms-2"></span>
                                </div>
                                <div>
                                    <strong>Porcentaje sobre salario:</strong>
                                    <span id="porcentaje-total" class="ms-2"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Calcular costos iniciales
        this.calcularCostosMensuales();
    }

    toggleEstadoEmpleado() {
        const isRetirado = this.estadoSwitch.checked;
        this.badgeActivo.style.display = isRetirado ? 'none' : 'inline';
        this.badgeRetirado.style.display = isRetirado ? 'inline' : 'none';
        
        // Habilitar/deshabilitar campos según el estado
        this.motivoRetiro.disabled = !isRetirado;
        this.fechaInicio.disabled = !isRetirado;
        this.fechaFin.disabled = !isRetirado;
    }

    validarFechas() {
        const fechaInicio = new Date(this.fechaInicio.value);
        const fechaFin = new Date(this.fechaFin.value);

        if (fechaFin < fechaInicio) {
            this.fechaFin.value = this.fechaInicio.value;
            alert('La fecha de finalización no puede ser anterior a la fecha de inicio');
        }
    }

    async calcularLiquidacion(e) {
        if (e) e.preventDefault();
        
        if (!this.validarFormulario()) {
            return;
        }

        // Obtener datos del empleado
        const empleadoData = document.getElementById('empleado-liquidacion-data')?.value;
        if (!empleadoData) {
            this.mostrarError('No hay datos del empleado. Por favor busque un empleado primero.');
            return;
        }

        const empleado = JSON.parse(empleadoData);
        
        const formData = {
            documento: empleado.documento,
            fecha_inicio: this.fechaInicio.value,
            fecha_fin: this.fechaFin.value,
            motivo_retiro: this.motivoRetiro.value,
            tipo_contrato: empleado.contrato || 'indefinido',
            salario_base: empleado.salario
        };

        try {
            const response = await fetch('/api/recursos_humanos/calcular_liquidacion/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al calcular la liquidación');
            }

            const data = await response.json();
            this.mostrarResultados(data);
            
            // Hacer scroll a los resultados
            this.resultadosContainer.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error:', error);
            this.mostrarError(error.message || 'Error al procesar la solicitud');
        }
    }

    validarFormulario() {
        if (!this.estadoSwitch.checked) {
            alert('Debe cambiar el estado del empleado a retirado para calcular la liquidación');
            return false;
        }

        if (!this.motivoRetiro.value) {
            alert('Debe seleccionar un motivo de retiro');
            return false;
        }

        if (!this.fechaInicio.value || !this.fechaFin.value) {
            alert('Debe seleccionar las fechas de inicio y fin');
            return false;
        }

        return true;
    }

    mostrarResultados(data) {
        this.resultadosContainer.style.display = 'block';
        this.resultadosContainer.innerHTML = `
            <div class="card shadow-sm">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0"><i class="fas fa-calculator me-2"></i>Resultados de la Liquidación</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <!-- Cesantías -->
                            <div class="result-group mb-4">
                                <h6 class="text-primary"><i class="fas fa-piggy-bank me-2"></i>Cesantías</h6>
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Cesantías:</span>
                                    <span class="fw-bold">${this.formatearMoneda(data.cesantias)}</span>
                                </div>
                                <div class="d-flex justify-content-between">
                                    <span>Intereses sobre Cesantías:</span>
                                    <span class="fw-bold">${this.formatearMoneda(data.intereses_cesantias)}</span>
                                </div>
                            </div>

                            <!-- Prima de Servicios -->
                            <div class="result-group mb-4">
                                <h6 class="text-primary"><i class="fas fa-gift me-2"></i>Prima de Servicios</h6>
                                <div class="d-flex justify-content-between">
                                    <span>Prima Proporcional:</span>
                                    <span class="fw-bold">${this.formatearMoneda(data.prima)}</span>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <!-- Vacaciones -->
                            <div class="result-group mb-4">
                                <h6 class="text-primary"><i class="fas fa-umbrella-beach me-2"></i>Vacaciones</h6>
                                <div class="d-flex justify-content-between">
                                    <span>Vacaciones Pendientes:</span>
                                    <span class="fw-bold">${this.formatearMoneda(data.vacaciones)}</span>
                                </div>
                            </div>

                            <!-- Indemnización -->
                            <div class="result-group mb-4">
                                <h6 class="text-primary"><i class="fas fa-gavel me-2"></i>Indemnización</h6>
                                <div class="d-flex justify-content-between">
                                    <span>Valor Indemnización:</span>
                                    <span class="fw-bold">${this.formatearMoneda(data.indemnizacion)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Total -->
                    <div class="border-top pt-3 mt-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="text-primary mb-0"><i class="fas fa-coins me-2"></i>Total Liquidación:</h5>
                            <h4 class="text-success mb-0">${this.formatearMoneda(
                                data.cesantias + 
                                data.intereses_cesantias + 
                                data.prima + 
                                data.vacaciones + 
                                data.indemnizacion
                            )}</h4>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    cancelarLiquidacion() {
        this.liquidacionForm.reset();
        this.estadoSwitch.checked = false;
        this.toggleEstadoEmpleado();
        this.resultadosContainer.style.display = 'none';
    }

    mostrarError(mensaje) {
        alert(mensaje);
    }

    initEventListeners() {
        // Escuchar cambios en el documento del empleado
        const documentoInput = document.getElementById('liquidacion-documento');
        const buscarBtn = document.getElementById('buscar-liquidacion');
        const estadoEmpleadoSwitch = document.getElementById('estado-empleado-switch');
        
        if (documentoInput && buscarBtn) {
            // Buscar al hacer clic en el botón
            buscarBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const documento = documentoInput.value.trim();
                if (documento) {
                    this.buscarEmpleado(documento);
                } else {
                    this.mostrarError('Por favor ingrese un número de documento');
                }
            });

            // Buscar al presionar Enter en el input
            documentoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const documento = documentoInput.value.trim();
                    if (documento) {
                        this.buscarEmpleado(documento);
                    } else {
                        this.mostrarError('Por favor ingrese un número de documento');
                    }
                }
            });
        }

        // Escuchar cambios en el nivel de riesgo ARL
        const nivelRiesgoArl = document.getElementById('nivel-riesgo-arl');
        if (nivelRiesgoArl) {
            nivelRiesgoArl.addEventListener('change', () => {
                const empleadoData = document.getElementById('empleado-liquidacion-data').value;
                if (empleadoData) {
                    this.calcularCostosMensuales();
                }
            });
        }

        // Escuchar cambios en el motivo de retiro
        const motivoRetiro = document.getElementById('motivo-retiro');
        if (motivoRetiro) {
            motivoRetiro.addEventListener('change', () => {
                if (this.validarCampos()) {
                    this.calcularLiquidacion();
                }
            });
        }

        // Escuchar cambios en las fechas
        const fechaInicio = document.getElementById('fecha-inicio');
        const fechaFin = document.getElementById('fecha-fin');
        
        if (fechaInicio) {
            fechaInicio.addEventListener('change', () => {
                if (this.validarCampos()) {
                    this.calcularLiquidacion();
                }
            });
        }
        
        if (fechaFin) {
            fechaFin.addEventListener('change', () => {
                if (this.validarCampos()) {
                    this.calcularLiquidacion();
                }
            });
        }

        // Escuchar click en los botones de calcular
        const btnCalcularCostos = document.getElementById('calcular-costos');
        if (btnCalcularCostos) {
            btnCalcularCostos.addEventListener('click', () => {
                const empleadoData = document.getElementById('empleado-liquidacion-data').value;
                if (empleadoData) {
                    this.calcularCostosMensuales();
                } else {
                    this.mostrarError('Por favor busque primero un empleado usando el número de documento');
                }
            });
        }

        const btnCalcularLiquidacion = document.getElementById('calcular-liquidacion');
        if (btnCalcularLiquidacion) {
            btnCalcularLiquidacion.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.validarCampos()) {
                    this.calcularLiquidacion();
                }
            });
        }

        // Escuchar cambios en el estado del empleado
        if (estadoEmpleadoSwitch) {
            estadoEmpleadoSwitch.addEventListener('change', async (e) => {
                const empleadoData = document.getElementById('empleado-liquidacion-data').value;
                if (!empleadoData) {
                    this.mostrarError('No hay datos del empleado disponibles');
                    e.target.checked = !e.target.checked; // Revertir el switch
                    return;
                }

                try {
                    const empleado = JSON.parse(empleadoData);
                    const nuevoEstado = e.target.checked ? 'activo' : 'retirado';

                    // Si se está intentando marcar como retirado, verificar si tiene liquidación
                    if (nuevoEstado === 'retirado') {
                        try {
                            const tieneLiquidacion = await this.verificarLiquidacionEmpleado(empleado.id);
                            if (!tieneLiquidacion) {
                                this.mostrarError(
                                    'No se puede retirar al empleado sin generar su liquidación. ' +
                                    'Por favor, complete el proceso de liquidación primero.'
                                );
                                e.target.checked = !e.target.checked; // Revertir el switch
                                return;
                            }
                        } catch (error) {
                            this.mostrarError(error.message);
                            e.target.checked = !e.target.checked; // Revertir el switch
                            return;
                        }
                    }
                    
                    // Obtener el token CSRF
                    const csrfToken = this.getCsrfToken();
                    if (!csrfToken) {
                        throw new Error('No se encontró el token CSRF');
                    }

                    const response = await fetch(`/api/recursos_humanos/empleados/${empleado.id}/`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrfToken
                        },
                        body: JSON.stringify({
                            estado: nuevoEstado
                        }),
                        credentials: 'include'
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        let errorMessage = 'Error al actualizar el estado del empleado';
                        
                        if (errorData.estado && errorData.estado.length > 0) {
                            errorMessage = errorData.estado[0];
                        } else if (errorData.detail) {
                            errorMessage = errorData.detail;
                        }
                        
                        throw new Error(errorMessage);
                    }

                    const updatedEmpleado = await response.json();

                    // Actualizar los datos del empleado en el campo oculto
                    document.getElementById('empleado-liquidacion-data').value = JSON.stringify({
                        ...empleado,
                        estado: nuevoEstado
                    });

                    // Actualizar la interfaz
                    this.actualizarInterfazSegunEstado(nuevoEstado);
                    
                    // Mostrar mensaje de éxito
                    this.mostrarMensaje(
                        `El empleado ha sido ${nuevoEstado === 'activo' ? 'activado' : 'retirado'} exitosamente`,
                        'success'
                    );

                } catch (error) {
                    console.error('Error al actualizar estado:', error);
                    
                    // Revertir el switch al estado anterior
                    e.target.checked = !e.target.checked;
                    
                    // Mostrar mensaje de error específico
                    this.mostrarError(
                        error.message || 'Error al actualizar el estado del empleado. Por favor, intente nuevamente.'
                    );
                }
            });
        }

        // Mejorar manejo de tabs
        const tabElements = document.querySelectorAll('[data-bs-toggle="tab"]');
        tabElements.forEach(tab => {
            tab.addEventListener('shown.bs.tab', (event) => {
                const targetId = event.target.getAttribute('data-bs-target');
                const targetPane = document.querySelector(targetId);
                if (targetPane) {
                    targetPane.classList.add('show', 'active');
                }

                // Recalcular según la pestaña activa
                const empleadoData = document.getElementById('empleado-liquidacion-data').value;
                if (empleadoData) {
                    if (targetId === '#costos-panel') {
                        this.calcularCostosMensuales();
                    } else if (targetId === '#liquidacion-panel') {
                        // Asegurarse de que los campos sean visibles
                        const liquidacionPanel = document.getElementById('liquidacion-panel');
                        if (liquidacionPanel) {
                            liquidacionPanel.style.display = 'block';
                            liquidacionPanel.classList.add('show', 'active');
                        }
                    }
                }
            });
        });

        // Activar la primera pestaña por defecto
        const firstTab = document.querySelector('.nav-tabs .nav-link');
        if (firstTab) {
            const tab = new bootstrap.Tab(firstTab);
            tab.show();
        }
    }

    actualizarInterfazSegunEstado(estado) {
        const alertaRetirado = document.getElementById('empleado-retirado-alert');
        const formLiquidacion = document.getElementById('form-liquidacion');
        const estadoSwitch = document.getElementById('estado-empleado-switch');
        const estadoCard = document.getElementById('estado-empleado-card');
        const badgeActivo = document.getElementById('estado-badge-activo');
        const badgeRetirado = document.getElementById('estado-badge-retirado');

        if (!estadoCard || !estadoSwitch || !badgeActivo || !badgeRetirado || !alertaRetirado || !formLiquidacion) {
            console.error('No se encontraron todos los elementos necesarios para actualizar el estado');
            return;
        }

        // Mostrar la tarjeta de estado
        estadoCard.style.display = 'block';

        // Actualizar el switch y los badges
        estadoSwitch.checked = estado === 'activo';
        badgeActivo.style.display = estado === 'activo' ? 'inline-block' : 'none';
        badgeRetirado.style.display = estado === 'retirado' ? 'inline-block' : 'none';
        alertaRetirado.style.display = estado === 'retirado' ? 'block' : 'none';

        // Actualizar estado de los campos del formulario
        const inputs = formLiquidacion.querySelectorAll('input, select, button');
        inputs.forEach(input => {
            if (input.id !== 'estado-empleado-switch') {
                input.disabled = estado === 'retirado';
            }
        });

        // Mantener el switch habilitado
        estadoSwitch.disabled = false;
    }

    async verificarLiquidacionEmpleado(empleadoId) {
        try {
            const response = await fetch(`/api/recursos_humanos/empleados/${empleadoId}/liquidaciones/`);
            if (!response.ok) {
                if (response.status === 404) {
                    return false; // No tiene liquidaciones
                }
                throw new Error('Error al verificar liquidaciones');
            }
            const data = await response.json();
            return data && data.length > 0;
        } catch (error) {
            console.error('Error al verificar liquidaciones:', error);
            throw new Error('Error al verificar el estado de liquidación del empleado');
        }
    }

    // Add styles to the existing style block or create new one
    initStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .fade-in {
                opacity: 0;
                transition: opacity 0.3s ease-in-out;
            }
            
            .fade-in.show {
                opacity: 1;
            }
            
            #costos-mensuales,
            #resultados-liquidacion {
                opacity: 1;
                transition: opacity 0.3s ease-in-out;
            }
            
            #costos-mensuales.fade-out,
            #resultados-liquidacion.fade-out {
                opacity: 0;
            }
            
            .tab-pane {
                display: none;
            }
            
            .tab-pane.active {
                display: block;
            }
        `;
        document.head.appendChild(styleElement);
    }

    // Update the document ready handler
    static init() {
        document.addEventListener('DOMContentLoaded', () => {
            const liquidacion = new LiquidacionLaboral();
            liquidacion.initStyles();
        });
    }

    // Agregar función para obtener el token CSRF si no existe
    getCsrfToken() {
        // Primero intentar obtener del meta tag
        let token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        
        // Si no está en meta tag, buscar en el input hidden
        if (!token) {
            token = document.querySelector('input[name="csrfmiddlewaretoken"]')?.value;
        }
        
        // Si aún no se encuentra, buscar en las cookies
        if (!token) {
            token = document.cookie.split('; ')
                .find(row => row.startsWith('csrftoken='))
                ?.split('=')[1];
        }
        
        return token;
    }

    // Agregar función para mostrar mensajes de éxito si no existe
    mostrarMensaje(mensaje, tipo = 'success') {
        const infoContainer = document.getElementById('info-empleado-liquidacion');
        if (infoContainer) {
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
            alertDiv.innerHTML = `
                <i class="fas fa-${tipo === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
                ${mensaje}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            `;
            infoContainer.insertAdjacentElement('afterbegin', alertDiv);

            // Remover el mensaje después de 5 segundos
            setTimeout(() => {
                alertDiv.remove();
            }, 5000);
        }
    }

    // Calcular costos al empleador
    calcularCostosMensuales() {
        try {
            const empleadoData = document.getElementById('empleado-liquidacion-data')?.value;
            if (!empleadoData) {
                console.warn('No hay datos del empleado disponibles');
                return;
            }

            const empleado = JSON.parse(empleadoData);
            const salario = parseFloat(empleado.salario);
            const nivelRiesgoElement = document.getElementById('nivel-riesgo-arl');
            
            if (!nivelRiesgoElement) {
                console.warn('No se encontró el elemento nivel-riesgo-arl');
                return;
            }
            
            const nivelRiesgo = nivelRiesgoElement.value;

            // Determinar si aplica auxilio de transporte
            const aplicaAuxilioTransporte = salario <= (FACTORES_LIQUIDACION.SALARIO_MINIMO * 2);
            const basePS = salario + (aplicaAuxilioTransporte ? FACTORES_LIQUIDACION.AUXILIO_TRANSPORTE : 0);

            // 1. Seguridad Social (sobre salario)
            const costoSalud = salario * FACTORES_LIQUIDACION.SALUD_EMPLEADOR;
            const costoPension = salario * FACTORES_LIQUIDACION.PENSION_EMPLEADOR;
            
            // Determinar tasa de ARL según nivel de riesgo
            let tasaARL;
            switch(nivelRiesgo) {
                case '1': tasaARL = FACTORES_LIQUIDACION.ARL_RIESGO_1; break;
                case '2': tasaARL = FACTORES_LIQUIDACION.ARL_RIESGO_2; break;
                case '3': tasaARL = FACTORES_LIQUIDACION.ARL_RIESGO_3; break;
                case '4': tasaARL = FACTORES_LIQUIDACION.ARL_RIESGO_4; break;
                case '5': tasaARL = FACTORES_LIQUIDACION.ARL_RIESGO_5; break;
                default: tasaARL = FACTORES_LIQUIDACION.ARL_RIESGO_1;
            }
            const costoARL = salario * tasaARL;

            // 2. Parafiscales (sobre salario)
            const costoSENA = salario * FACTORES_LIQUIDACION.SENA;
            const costoICBF = salario * FACTORES_LIQUIDACION.ICBF;
            const costoCaja = salario * FACTORES_LIQUIDACION.CAJA_COMPENSACION;

            // 3. Prestaciones Sociales (sobre salario + auxilio de transporte)
            const costoPrima = basePS * (FACTORES_LIQUIDACION.PRIMA_SERVICIOS / 12);
            const costoCesantias = basePS * (FACTORES_LIQUIDACION.CESANTIAS / 12);
            const costoIntCesantias = costoCesantias * FACTORES_LIQUIDACION.INTERESES_CESANTIAS;
            const costoVacaciones = salario * (FACTORES_LIQUIDACION.VACACIONES.DIAS_POR_ANO / 360);

            // Actualizar valores en la interfaz
            this.actualizarValorCostoSeguro('salud', costoSalud);
            this.actualizarValorCostoSeguro('pension', costoPension);
            this.actualizarValorCostoSeguro('arl', costoARL);
            this.actualizarValorCostoSeguro('sena', costoSENA);
            this.actualizarValorCostoSeguro('icbf', costoICBF);
            this.actualizarValorCostoSeguro('caja', costoCaja);
            this.actualizarValorCostoSeguro('prima', costoPrima);
            this.actualizarValorCostoSeguro('cesantias', costoCesantias);
            this.actualizarValorCostoSeguro('int-cesantias', costoIntCesantias);
            this.actualizarValorCostoSeguro('vacaciones', costoVacaciones);

            // Calcular y mostrar el total
            const totalCostos = costoSalud + costoPension + costoARL + 
                              costoSENA + costoICBF + costoCaja + 
                              costoPrima + costoCesantias + costoIntCesantias + 
                              costoVacaciones;

            const porcentajeTotal = ((totalCostos / salario) * 100).toFixed(2);
            
            const porcentajeTotalElement = document.getElementById('porcentaje-total');
            if (porcentajeTotalElement) {
                porcentajeTotalElement.textContent = `${porcentajeTotal}%`;
            }

            const totalCostosElement = document.getElementById('total-costos');
            if (totalCostosElement) {
                totalCostosElement.textContent = this.formatearMoneda(totalCostos);
            }

        } catch (error) {
            console.error('Error al calcular costos mensuales:', error);
            this.mostrarError('Error al calcular los costos mensuales');
        }
    }

    actualizarValorCostoSeguro(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = this.formatearMoneda(valor);
        }
    }

    formatearMoneda(valor) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(valor);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    LiquidacionLaboral.init();
}); 