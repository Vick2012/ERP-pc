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
    
    // Prestaciones Sociales
    PRIMA_SERVICIOS: 0.0833,         // 8.33% Prima de Servicios
    CESANTIAS: 0.0833,              // 8.33% Cesantías
    INTERESES_CESANTIAS: 0.01,       // 1% Intereses sobre Cesantías
    VACACIONES: 0.0417,             // 4.17% Vacaciones
    
    // Indemnizaciones por despido
    INDEMNIZACION_FIJO: {
        MENOS_1_ANO: 1,              // Proporción al tiempo faltante
        MAS_1_ANO: 30                // 30 días por el primer año y 20 por los siguientes
    },
    INDEMNIZACION_INDEFINIDO: {
        MENOS_1_ANO: 30,             // 30 días si es menos de 1 año
        ENTRE_1_5_ANOS: 30,          // 30 días por el primer año + 20 por cada año siguiente
        ENTRE_5_10_ANOS: 20,         // 20 días adicionales por cada año después del quinto
        MAS_10_ANOS: 20              // 20 días adicionales por cada año después del décimo
    },
    
    // Auxilio de Transporte 2024
    AUXILIO_TRANSPORTE: 140606,      // Auxilio de transporte 2024
    SALARIO_MINIMO: 1300000         // Salario mínimo 2024
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
        this.initEventListeners();
        this.activeTab = 'costos';
        this.lastScrollPosition = 0;
        
        // Initialize Bootstrap tabs
        const tabElements = document.querySelectorAll('[data-bs-toggle="tab"]');
        tabElements.forEach(tab => {
            new bootstrap.Tab(tab);
        });
    }

    initEventListeners() {
        // Escuchar cambios en el documento del empleado
        const documentoInput = document.getElementById('liquidacion-documento');
        const buscarBtn = document.getElementById('buscar-liquidacion');
        
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

    async buscarEmpleado(documento) {
        try {
            const response = await fetch(`/api/recursos_humanos/empleados/?documento=${documento}`);
            if (!response.ok) {
                throw new Error('No se encontró el empleado');
            }
            
            const empleados = await response.json();
            if (!empleados || empleados.length === 0) {
                throw new Error('No se encontró el empleado');
            }
            
            const empleado = empleados[0]; // Get the first match
            document.getElementById('empleado-liquidacion-data').value = JSON.stringify(empleado);
            
            // Mostrar información del empleado
            this.mostrarInformacionEmpleado(empleado);
            
            // Calcular costos mensuales iniciales
            await this.calcularCostosMensuales();
            
            // Activar la pestaña de costos por defecto
            const costosTab = document.getElementById('costos-tab');
            if (costosTab) {
                const tab = new bootstrap.Tab(costosTab);
                tab.show();
            }
            
        } catch (error) {
            this.manejarError(error, 'buscar empleado');
        }
    }

    mostrarError(mensaje) {
        const infoEmpleado = document.getElementById('info-empleado-liquidacion');
        if (infoEmpleado) {
            infoEmpleado.innerHTML = `
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    ${mensaje}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;
        }
    }

    validarCampos() {
        const empleadoData = document.getElementById('empleado-liquidacion-data').value;
        if (!empleadoData) {
            this.mostrarError('Por favor busque primero un empleado usando el número de documento');
            return false;
        }

        const camposFaltantes = [];
        const motivoRetiro = document.getElementById('motivo-retiro').value;
        const fechaInicio = document.getElementById('fecha-inicio').value;
        const fechaFin = document.getElementById('fecha-fin').value;

        if (!motivoRetiro) camposFaltantes.push('Motivo de Retiro');
        if (!fechaInicio) camposFaltantes.push('Fecha de Inicio');
        if (!fechaFin) camposFaltantes.push('Fecha de Finalización');

        if (camposFaltantes.length > 0) {
            this.mostrarError(`Por favor complete los siguientes campos:<br>
                <ul class="mb-0 mt-2">
                    ${camposFaltantes.map(campo => `<li>${campo}</li>`).join('')}
                </ul>`
            );
            return false;
        }

        return true;
    }

    // Manejo mejorado de errores
    async manejarError(error, contexto) {
        console.error(`Error en ${contexto}:`, error);
        
        let mensaje = 'Ha ocurrido un error inesperado';
        
        if (error.response) {
            // Error de respuesta del servidor
            switch (error.response.status) {
                case 400:
                    mensaje = 'Los datos proporcionados no son válidos';
                    break;
                case 401:
                    mensaje = 'No está autorizado para realizar esta operación';
                    break;
                case 404:
                    mensaje = 'No se encontró el recurso solicitado';
                    break;
                case 500:
                    mensaje = 'Error interno del servidor';
                    break;
                default:
                    mensaje = `Error del servidor (${error.response.status})`;
            }
        } else if (error.request) {
            // Error de red
            mensaje = 'No se pudo conectar con el servidor. Verifique su conexión a internet';
        }

        this.mostrarError(mensaje);
        
        // Limpiar estados de carga si existen
        const botones = document.querySelectorAll('button');
        botones.forEach(boton => {
            boton.disabled = false;
            if (boton.querySelector('.spinner-border')) {
                boton.querySelector('.spinner-border').remove();
            }
        });

        return false;
    }

    // Función para generar clave de caché
    generarClaveCacheCostos(empleado, nivelRiesgoArl) {
        return `${empleado.id}_${empleado.salario}_${nivelRiesgoArl}`;
    }

    generarClaveCacheLiquidacion(empleado, fechaInicio, fechaFin, motivoRetiro) {
        return `${empleado.id}_${fechaInicio}_${fechaFin}_${motivoRetiro}`;
    }

    generarClaveCacheTiempoServicio(fechaInicio, fechaFin) {
        return `${fechaInicio}_${fechaFin}`;
    }

    // Optimización del cálculo de tiempo de servicio
    calcularTiempoServicio(fechaIngreso, fechaRetiro) {
        const ingreso = new Date(fechaIngreso);
        const retiro = new Date(fechaRetiro);
        const diferencia = retiro - ingreso;
        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const anos = Math.floor(dias / 365);
        const meses = Math.floor((dias % 365) / 30);
        const diasRestantes = dias % 30;

        return {
            dias: dias,
            anos: anos,
            meses: meses,
            diasRestantes: diasRestantes
        };
    }

    calcularIndemnizacion(empleado, tiempoServicio, tipoContrato, salario) {
        if (tipoContrato === 'fijo') {
            // Cálculo para contrato a término fijo
            const tiempoFaltante = this.calcularTiempoFaltante(empleado.fecha_fin_contrato);
            return salario * (tiempoFaltante.meses + (tiempoFaltante.dias / 30));
        } else {
            // Cálculo para contrato indefinido
            let indemnizacion = 0;
            const salarioDiario = salario / 30;

            if (tiempoServicio.anos < 1) {
                indemnizacion = salarioDiario * FACTORES_LIQUIDACION.INDEMNIZACION_INDEFINIDO.MENOS_1_ANO;
            } else if (tiempoServicio.anos <= 5) {
                indemnizacion = (salarioDiario * 30) + (salarioDiario * 20 * (tiempoServicio.anos - 1));
            } else if (tiempoServicio.anos <= 10) {
                indemnizacion = (salarioDiario * 30) + (salarioDiario * 20 * 4) + 
                               (salarioDiario * FACTORES_LIQUIDACION.INDEMNIZACION_INDEFINIDO.ENTRE_5_10_ANOS * (tiempoServicio.anos - 5));
            } else {
                indemnizacion = (salarioDiario * 30) + (salarioDiario * 20 * 4) + 
                               (salarioDiario * 20 * 5) + 
                               (salarioDiario * FACTORES_LIQUIDACION.INDEMNIZACION_INDEFINIDO.MAS_10_ANOS * (tiempoServicio.anos - 10));
            }

            return indemnizacion;
        }
    }

    calcularPrestacionesSociales(salario, tiempoServicio, incluirAuxilioTransporte) {
        const baseCalculo = incluirAuxilioTransporte ? 
            salario + FACTORES_LIQUIDACION.AUXILIO_TRANSPORTE : salario;

        // Cesantías
        const cesantias = (baseCalculo * FACTORES_LIQUIDACION.CESANTIAS * tiempoServicio.dias) / 360;
        
        // Intereses sobre cesantías (12% anual)
        const interesesCesantias = (cesantias * 0.12 * tiempoServicio.dias) / 360;
        
        // Prima de servicios
        const prima = (baseCalculo * FACTORES_LIQUIDACION.PRIMA_SERVICIOS * tiempoServicio.dias) / 360;
        
        // Vacaciones (solo sobre salario básico)
        const vacaciones = (salario * FACTORES_LIQUIDACION.VACACIONES * tiempoServicio.dias) / 360;

        return {
            cesantias,
            interesesCesantias,
            prima,
            vacaciones
        };
    }

    // Optimización del cálculo de costos mensuales
    async calcularCostosMensuales() {
        const empleadoData = document.getElementById('empleado-liquidacion-data').value;
        if (!empleadoData) {
            this.mostrarError('Por favor busque primero un empleado usando el número de documento');
            return;
        }

        try {
            const empleado = JSON.parse(empleadoData);
            const salario = parseFloat(empleado.salario);
            const incluirAuxilioTransporte = salario <= (FACTORES_LIQUIDACION.SALARIO_MINIMO * 2);
            const nivelRiesgoArl = document.getElementById('nivel-riesgo-arl').value;

            // Calcular base para seguridad social
            const baseSeguridad = salario;
            
            // Calcular base para prestaciones
            const basePrestaciones = incluirAuxilioTransporte ? 
                salario + FACTORES_LIQUIDACION.AUXILIO_TRANSPORTE : salario;

            // Calcular aportes de seguridad social
            const aportesSalud = baseSeguridad * FACTORES_LIQUIDACION.SALUD_EMPLEADOR;
            const aportesPension = baseSeguridad * FACTORES_LIQUIDACION.PENSION_EMPLEADOR;
            const factorArl = this.obtenerFactorArl(nivelRiesgoArl);
            const aportesArl = baseSeguridad * factorArl;

            // Calcular parafiscales
            const aportesSena = baseSeguridad * FACTORES_LIQUIDACION.SENA;
            const aportesIcbf = baseSeguridad * FACTORES_LIQUIDACION.ICBF;
            const aportesCaja = baseSeguridad * FACTORES_LIQUIDACION.CAJA_COMPENSACION;

            // Calcular prestaciones sociales mensuales
            const prima = basePrestaciones * FACTORES_LIQUIDACION.PRIMA_SERVICIOS;
            const cesantias = basePrestaciones * FACTORES_LIQUIDACION.CESANTIAS;
            const interesesCesantias = cesantias * FACTORES_LIQUIDACION.INTERESES_CESANTIAS;
            const vacaciones = salario * FACTORES_LIQUIDACION.VACACIONES;

            // Calcular totales
            const totalSeguridadSocial = aportesSalud + aportesPension + aportesArl;
            const totalParafiscales = aportesSena + aportesIcbf + aportesCaja;
            const totalPrestaciones = prima + cesantias + interesesCesantias + vacaciones;
            const auxilioTransporte = incluirAuxilioTransporte ? FACTORES_LIQUIDACION.AUXILIO_TRANSPORTE : 0;

            const costoTotal = salario + auxilioTransporte + totalSeguridadSocial + 
                              totalParafiscales + totalPrestaciones;

            // Mostrar los resultados
            const costos = {
                salarioBase: salario,
                auxilioTransporte,
                seguridadSocial: {
                    salud: aportesSalud,
                    pension: aportesPension,
                    arl: aportesArl,
                    total: totalSeguridadSocial
                },
                parafiscales: {
                    sena: aportesSena,
                    icbf: aportesIcbf,
                    cajaCompensacion: aportesCaja,
                    total: totalParafiscales
                },
                prestaciones: {
                    prima,
                    cesantias,
                    interesesCesantias,
                    vacaciones,
                    total: totalPrestaciones
                },
                costoTotal
            };

            // Store the calculation results
            this.lastCostosCalculation = costos;

            // Asegurarse de que el contenedor esté visible
            const costosContainer = document.getElementById('costos-mensuales');
            if (costosContainer) {
                costosContainer.style.display = 'block';
                this.mostrarCostosMensuales(costos);
                setTimeout(() => {
                    costosContainer.classList.add('show');
                }, 50);
            }

        } catch (error) {
            console.error('Error al calcular costos mensuales:', error);
            this.mostrarError('Error al calcular costos mensuales. Por favor intente nuevamente.');
        }
    }

    obtenerFactorArl(nivelRiesgo) {
        switch (nivelRiesgo) {
            case '1': return FACTORES_LIQUIDACION.ARL_RIESGO_1;
            case '2': return FACTORES_LIQUIDACION.ARL_RIESGO_2;
            case '3': return FACTORES_LIQUIDACION.ARL_RIESGO_3;
            case '4': return FACTORES_LIQUIDACION.ARL_RIESGO_4;
            case '5': return FACTORES_LIQUIDACION.ARL_RIESGO_5;
            default: return FACTORES_LIQUIDACION.ARL_RIESGO_1;
        }
    }

    mostrarResultadosLiquidacion(liquidacion, tiempoServicio) {
        const resultadosContainer = document.getElementById('resultados-liquidacion');
        if (!resultadosContainer) return;

        // Asegurarse de que estamos en la pestaña de liquidación
        const liquidacionTab = document.getElementById('liquidacion-tab');
        if (liquidacionTab) {
            liquidacionTab.click();
        }

        resultadosContainer.innerHTML = `
            <div class="card shadow-sm">
                <div class="card-header bg-primary text-white">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-file-invoice-dollar me-2"></i>
                        Resultados de la Liquidación
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row mb-4">
                        <div class="col-12">
                            <div class="alert alert-info">
                                <h6 class="alert-heading mb-1">
                                    <i class="fas fa-info-circle me-2"></i>
                                    Motivo de Retiro
                                </h6>
                                <p class="mb-0">${liquidacion.motivo}</p>
                            </div>
                        </div>
                    </div>

                    <div class="row mb-4">
                        <div class="col-md-6">
                            <div class="card border-0 bg-light">
                                <div class="card-body">
                                    <h6 class="card-title">
                                        <i class="fas fa-clock me-2"></i>
                                        Tiempo de Servicio
                                    </h6>
                                    <p class="mb-0">
                                        ${tiempoServicio.anos} años, 
                                        ${tiempoServicio.meses} meses y 
                                        ${tiempoServicio.diasRestantes} días
                                    </p>
                                    <small class="text-muted">Total días trabajados: ${liquidacion.detalles.diasTrabajados}</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card border-0 bg-light">
                                <div class="card-body">
                                    <h6 class="card-title">
                                        <i class="fas fa-money-bill-wave me-2"></i>
                                        Base de Liquidación
                                    </h6>
                                    <p class="mb-0">Salario Base: ${this.formatCurrency(liquidacion.detalles.salarioBase)}</p>
                                    <p class="mb-0">Auxilio de Transporte: ${this.formatCurrency(liquidacion.detalles.auxilioTransporte)}</p>
                                    <p class="mb-0 fw-bold">Base para Prestaciones: ${this.formatCurrency(liquidacion.detalles.basePrestaciones)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <h6 class="border-bottom pb-2">
                                <i class="fas fa-hand-holding-usd me-2"></i>
                                Prestaciones Sociales
                            </h6>
                            <ul class="list-group list-group-flush mb-4">
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <i class="fas fa-gift me-2 text-primary"></i>
                                        Prima de Servicios
                                        <small class="d-block text-muted">Proporcional al tiempo trabajado</small>
                                    </div>
                                    <strong>${this.formatCurrency(liquidacion.prima)}</strong>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <i class="fas fa-coins me-2 text-primary"></i>
                                        Cesantías
                                        <small class="d-block text-muted">Proporcional al tiempo trabajado</small>
                                    </div>
                                    <strong>${this.formatCurrency(liquidacion.cesantias)}</strong>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <i class="fas fa-percentage me-2 text-primary"></i>
                                        Intereses sobre Cesantías
                                        <small class="d-block text-muted">12% anual proporcional</small>
                                    </div>
                                    <strong>${this.formatCurrency(liquidacion.interesesCesantias)}</strong>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <i class="fas fa-umbrella-beach me-2 text-primary"></i>
                                        Vacaciones
                                        <small class="d-block text-muted">Proporcional al tiempo trabajado</small>
                                    </div>
                                    <strong>${this.formatCurrency(liquidacion.vacaciones)}</strong>
                                </li>
                            </ul>
                        </div>
                        
                        <div class="col-md-6">
                            <h6 class="border-bottom pb-2">
                                <i class="fas fa-file-contract me-2"></i>
                                Indemnizaciones
                            </h6>
                            <ul class="list-group list-group-flush mb-4">
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <i class="fas fa-gavel me-2 text-primary"></i>
                                        Indemnización por Despido
                                        <small class="d-block text-muted">Según tipo de contrato y tiempo</small>
                                    </div>
                                    <strong>${this.formatCurrency(liquidacion.indemnizacion)}</strong>
                                </li>
                            </ul>

                            <div class="alert alert-primary">
                                <h6 class="alert-heading mb-2">Total a Pagar</h6>
                                <h3 class="mb-0">${this.formatCurrency(liquidacion.total)}</h3>
                                <small class="text-muted">Suma total de prestaciones e indemnizaciones</small>
                            </div>
                        </div>
                    </div>

                    <div class="row mt-4">
                        <div class="col-12">
                            <button type="button" class="btn btn-success btn-lg w-100">
                                <i class="fas fa-file-pdf me-2"></i>
                                Generar Documento de Liquidación
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Mostrar el contenedor con animación
        resultadosContainer.style.display = 'block';
        // Forzar un reflow
        resultadosContainer.offsetHeight;
        resultadosContainer.classList.add('show');

        // Scroll hacia los resultados
        resultadosContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    mostrarInformacionEmpleado(empleado) {
        const infoContainer = document.getElementById('info-empleado-liquidacion');
        if (!infoContainer) return;

        infoContainer.innerHTML = `
            <div class="card shadow-sm">
                <div class="card-body">
                    <h5 class="card-title">
                        <i class="fas fa-user me-2 text-primary"></i>
                        Información del Empleado
                    </h5>
                    <div class="row">
                        <div class="col-md-6">
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item">
                                    <i class="fas fa-id-card me-2 text-primary"></i>
                                    <strong>Nombre:</strong> ${empleado.nombre}
                                </li>
                                <li class="list-group-item">
                                    <i class="fas fa-fingerprint me-2 text-primary"></i>
                                    <strong>Documento:</strong> ${empleado.documento}
                                </li>
                                <li class="list-group-item">
                                    <i class="fas fa-briefcase me-2 text-primary"></i>
                                    <strong>Cargo:</strong> ${empleado.cargo}
                                </li>
                                <li class="list-group-item">
                                    <i class="fas fa-building me-2 text-primary"></i>
                                    <strong>Área:</strong> ${empleado.area}
                                </li>
                            </ul>
                        </div>
                        <div class="col-md-6">
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item">
                                    <i class="fas fa-calendar-check me-2 text-primary"></i>
                                    <strong>Fecha de Ingreso:</strong> ${this.formatDate(empleado.fecha_ingreso)}
                                </li>
                                <li class="list-group-item">
                                    <i class="fas fa-money-bill-wave me-2 text-primary"></i>
                                    <strong>Salario Base:</strong> ${this.formatCurrency(empleado.salario)}
                                </li>
                                <li class="list-group-item">
                                    <i class="fas fa-file-contract me-2 text-primary"></i>
                                    <strong>Tipo de Contrato:</strong> ${this.formatContractType(empleado.contrato)}
                                </li>
                                <li class="list-group-item">
                                    <i class="fas fa-bus me-2 text-primary"></i>
                                    <strong>Auxilio de Transporte:</strong> 
                                    ${empleado.salario <= (FACTORES_LIQUIDACION.SALARIO_MINIMO * 2) ? 'Sí' : 'No'}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Guardar datos del empleado para cálculos posteriores
        document.getElementById('empleado-liquidacion-data').value = JSON.stringify(empleado);
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatContractType(type) {
        const types = {
            'fijo': 'Término Fijo',
            'indefinido': 'Término Indefinido',
            'obra_labor': 'Obra o Labor',
            'temporal': 'Temporal'
        };
        return types[type] || type;
    }

    mostrarCostosMensuales(costos) {
        const costosContainer = document.getElementById('costos-mensuales');
        if (!costosContainer) return;

        // Remove any existing fade-out classes
        costosContainer.classList.remove('fade-out');
        
        // Ensure the container is visible
        costosContainer.style.display = 'block';
        costosContainer.classList.add('show');

        costosContainer.innerHTML = `
            <div class="card shadow-sm">
                <div class="card-header bg-white">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-calculator me-2 text-primary"></i>
                        Costos Mensuales del Empleado
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="card border-0 bg-light mb-4">
                                <div class="card-body">
                                    <h6 class="card-title border-bottom pb-2">
                                        <i class="fas fa-money-bill-wave me-2 text-primary"></i>
                                        Salario y Auxilios
                                    </h6>
                                    <ul class="list-group list-group-flush">
                                        <li class="list-group-item bg-light d-flex justify-content-between">
                                            <span>Salario Base:</span>
                                            <strong>${this.formatCurrency(costos.salarioBase)}</strong>
                                        </li>
                                        <li class="list-group-item bg-light d-flex justify-content-between">
                                            <span>Auxilio de Transporte:</span>
                                            <strong>${this.formatCurrency(costos.auxilioTransporte)}</strong>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div class="card border-0 bg-light">
                                <div class="card-body">
                                    <h6 class="card-title border-bottom pb-2">
                                        <i class="fas fa-shield-alt me-2 text-primary"></i>
                                        Seguridad Social
                                    </h6>
                                    <ul class="list-group list-group-flush">
                                        <li class="list-group-item bg-light d-flex justify-content-between">
                                            <span>Salud (8.5%):</span>
                                            <strong>${this.formatCurrency(costos.seguridadSocial.salud)}</strong>
                                        </li>
                                        <li class="list-group-item bg-light d-flex justify-content-between">
                                            <span>Pensión (12%):</span>
                                            <strong>${this.formatCurrency(costos.seguridadSocial.pension)}</strong>
                                        </li>
                                        <li class="list-group-item bg-light d-flex justify-content-between">
                                            <span>ARL:</span>
                                            <strong>${this.formatCurrency(costos.seguridadSocial.arl)}</strong>
                                        </li>
                                        <li class="list-group-item bg-light d-flex justify-content-between fw-bold">
                                            <span>Total Seguridad Social:</span>
                                            <span>${this.formatCurrency(costos.seguridadSocial.total)}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="card border-0 bg-light mb-4">
                                <div class="card-body">
                                    <h6 class="card-title border-bottom pb-2">
                                        <i class="fas fa-percentage me-2 text-primary"></i>
                                        Parafiscales
                                    </h6>
                                    <ul class="list-group list-group-flush">
                                        <li class="list-group-item bg-light d-flex justify-content-between">
                                            <span>SENA (2%):</span>
                                            <strong>${this.formatCurrency(costos.parafiscales.sena)}</strong>
                                        </li>
                                        <li class="list-group-item bg-light d-flex justify-content-between">
                                            <span>ICBF (3%):</span>
                                            <strong>${this.formatCurrency(costos.parafiscales.icbf)}</strong>
                                        </li>
                                        <li class="list-group-item bg-light d-flex justify-content-between">
                                            <span>Caja de Compensación (4%):</span>
                                            <strong>${this.formatCurrency(costos.parafiscales.cajaCompensacion)}</strong>
                                        </li>
                                        <li class="list-group-item bg-light d-flex justify-content-between fw-bold">
                                            <span>Total Parafiscales:</span>
                                            <span>${this.formatCurrency(costos.parafiscales.total)}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div class="card border-0 bg-light">
                                <div class="card-body">
                                    <h6 class="card-title border-bottom pb-2">
                                        <i class="fas fa-hand-holding-usd me-2 text-primary"></i>
                                        Prestaciones Sociales
                                    </h6>
                                    <ul class="list-group list-group-flush">
                                        <li class="list-group-item bg-light d-flex justify-content-between">
                                            <span>Prima de Servicios:</span>
                                            <strong>${this.formatCurrency(costos.prestaciones.prima)}</strong>
                                        </li>
                                        <li class="list-group-item bg-light d-flex justify-content-between">
                                            <span>Cesantías:</span>
                                            <strong>${this.formatCurrency(costos.prestaciones.cesantias)}</strong>
                                        </li>
                                        <li class="list-group-item bg-light d-flex justify-content-between">
                                            <span>Intereses sobre Cesantías:</span>
                                            <strong>${this.formatCurrency(costos.prestaciones.interesesCesantias)}</strong>
                                        </li>
                                        <li class="list-group-item bg-light d-flex justify-content-between">
                                            <span>Vacaciones:</span>
                                            <strong>${this.formatCurrency(costos.prestaciones.vacaciones)}</strong>
                                        </li>
                                        <li class="list-group-item bg-light d-flex justify-content-between fw-bold">
                                            <span>Total Prestaciones:</span>
                                            <span>${this.formatCurrency(costos.prestaciones.total)}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row mt-4">
                        <div class="col-12">
                            <div class="alert alert-primary">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="alert-heading mb-1">Costo Total Mensual</h6>
                                        <small class="text-muted">Este es el costo total mensual que representa el empleado para la empresa</small>
                                    </div>
                                    <h3 class="mb-0">${this.formatCurrency(costos.costoTotal)}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    // Optimización del cálculo de liquidación
    async calcularLiquidacion() {
        const empleadoData = document.getElementById('empleado-liquidacion-data').value;
        if (!empleadoData) {
            this.mostrarError('Por favor busque primero un empleado usando el número de documento');
            return;
        }

        // Validar todos los campos requeridos
        const camposFaltantes = [];
        
        const motivoRetiro = document.getElementById('motivo-retiro').value;
        if (!motivoRetiro) {
            camposFaltantes.push('Motivo de Retiro');
        }

        const fechaInicio = document.getElementById('fecha-inicio').value;
        if (!fechaInicio) {
            camposFaltantes.push('Fecha de Inicio');
        }

        const fechaFin = document.getElementById('fecha-fin').value;
        if (!fechaFin) {
            camposFaltantes.push('Fecha de Finalización');
        }

        // Si hay campos faltantes, mostrar error específico
        if (camposFaltantes.length > 0) {
            this.mostrarError(`Por favor complete los siguientes campos:<br>
                <ul class="mb-0 mt-2">
                    ${camposFaltantes.map(campo => `<li>${campo}</li>`).join('')}
                </ul>`
            );
            return;
        }

        // Validar que la fecha de fin sea posterior a la de inicio
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        if (fin <= inicio) {
            this.mostrarError('La fecha de finalización debe ser posterior a la fecha de inicio');
            return;
        }

        try {
            // Asegurarse de que estamos en la pestaña de liquidación
            const liquidacionTab = document.getElementById('liquidacion-tab');
            if (liquidacionTab) {
                const tab = new bootstrap.Tab(liquidacionTab);
                tab.show();
            }

            const empleado = JSON.parse(empleadoData);
            const tiempoServicio = this.calcularTiempoServicio(fechaInicio, fechaFin);
            const factoresMotivo = this.FACTORES_MOTIVO[motivoRetiro];
            const salarioBase = parseFloat(empleado.salario);
            const incluirAuxilioTransporte = salarioBase <= (FACTORES_LIQUIDACION.SALARIO_MINIMO * 2);
            const auxilioTransporte = incluirAuxilioTransporte ? FACTORES_LIQUIDACION.AUXILIO_TRANSPORTE : 0;

            // Calcular base para prestaciones
            const basePrestaciones = salarioBase + auxilioTransporte;

            // Calcular prestaciones sociales proporcionales
            const diasTrabajados = tiempoServicio.dias;
            const factorProporcional = diasTrabajados / 360;

            // Prima de servicios proporcional
            const prima = basePrestaciones * FACTORES_LIQUIDACION.PRIMA_SERVICIOS * factorProporcional;

            // Cesantías proporcionales
            const cesantias = basePrestaciones * FACTORES_LIQUIDACION.CESANTIAS * factorProporcional;

            // Intereses sobre cesantías proporcionales (12% anual)
            const interesesCesantias = (cesantias * 0.12) * factorProporcional;

            // Vacaciones proporcionales (solo sobre salario básico)
            const vacaciones = salarioBase * FACTORES_LIQUIDACION.VACACIONES * factorProporcional;

            // Calcular indemnización si aplica
            let indemnizacion = 0;
            if (factoresMotivo.indemnizacion) {
                if (empleado.contrato === 'fijo') {
                    // Para contratos a término fijo: salario por tiempo faltante
                    const fechaFinContrato = new Date(empleado.fecha_fin_contrato);
                    const diasFaltantes = Math.ceil((fechaFinContrato - fin) / (1000 * 60 * 60 * 24));
                    if (diasFaltantes > 0) {
                        indemnizacion = (salarioBase / 30) * diasFaltantes;
                    }
                } else {
                    // Para contratos indefinidos
                    const salarioDiario = salarioBase / 30;
                    if (tiempoServicio.anos < 1) {
                        indemnizacion = salarioDiario * 30;
                    } else if (tiempoServicio.anos <= 5) {
                        indemnizacion = (salarioDiario * 30) + (salarioDiario * 20 * (tiempoServicio.anos - 1));
                    } else if (tiempoServicio.anos <= 10) {
                        indemnizacion = (salarioDiario * 30) + (salarioDiario * 20 * 4) + 
                                      (salarioDiario * 20 * (tiempoServicio.anos - 5));
                    } else {
                        indemnizacion = (salarioDiario * 30) + (salarioDiario * 20 * 4) + 
                                      (salarioDiario * 20 * 5) + 
                                      (salarioDiario * 20 * (tiempoServicio.anos - 10));
                    }
                }
            }

            // Calcular total
            const liquidacionTotal = {
                prima,
                cesantias,
                interesesCesantias,
                vacaciones,
                indemnizacion,
                total: prima + cesantias + interesesCesantias + vacaciones + indemnizacion,
                motivo: factoresMotivo.descripcion,
                detalles: {
                    salarioBase,
                    auxilioTransporte,
                    basePrestaciones,
                    diasTrabajados,
                    tiempoServicio
                }
            };

            // Mostrar los resultados
            const resultadosContainer = document.getElementById('resultados-liquidacion');
            if (resultadosContainer) {
                resultadosContainer.style.display = 'none';
                resultadosContainer.classList.remove('show');
                
                // Esperar a que la pestaña se active
                setTimeout(() => {
                    this.mostrarResultadosLiquidacion(liquidacionTotal, tiempoServicio);
                }, 100);
            }

        } catch (error) {
            console.error('Error al calcular liquidación:', error);
            this.mostrarError('Error al calcular la liquidación. Por favor intente nuevamente.');
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
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    LiquidacionLaboral.init();
}); 