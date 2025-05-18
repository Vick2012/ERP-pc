/**
 * Configuración global de la empresa para el desprendible de nómina
 * Contiene información corporativa que se mostrará en el documento
 */
const EMPRESA_CONFIG = {
    nombre: "EventSync - ERP Logística",
    nit: "900.123.456-7",
    direccion: "Calle 123 # 45-67",
    ciudad: "Bogotá D.C.",
    telefono: "601 4563214",
    email: "Erplogistica@gmail.com.co",
    sitioWeb: "www.eventsync.com",
};

/**
 * Configuración específica para el desprendible
 * Incluye información básica y ruta del logo
 */
const config = {
    empresa: "EventSync",
    direccion: "Calle Principal #123",
    telefono: "601 4563214",
    sitioWeb: "www.eventsync.com",
    logo: "/static/img/logo.png"
};

/**
 * Carga el template del desprendible de nómina
 * @returns {Promise<void>}
 */
async function cargarTemplateDesprendible() {
    try {
        // Verificar si el contenedor ya existe y tiene el contenido necesario
    const contenedor = document.getElementById('nomina-resumen');
        if (!contenedor) {
            throw new Error('No se encontró el contenedor del desprendible');
        }

        // Mostrar el estado de carga
        contenedor.innerHTML = `
            <div class="text-center p-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2">Cargando desprendible...</p>
            </div>
        `;
        contenedor.classList.remove('hidden');

        // Esperar un momento para que se muestre el spinner
        await new Promise(resolve => setTimeout(resolve, 100));

        // Si el contenedor ya tiene los elementos necesarios, solo mostrarlo
        if (verificarElementos()) {
            return true;
        }

        // Si no tiene los elementos necesarios, crear la estructura básica
        return crearEstructuraBasica();
    } catch (error) {
        console.error('Error al cargar el template:', error);
        return false;
    }
}

/**
 * Procesa el contenido del template HTML
 * @param {string} html - Contenido HTML del template
 * @returns {boolean}
 */
function procesarTemplate(html) {
    try {
        // Crear un contenedor temporal para el template
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Buscar el contenido del desprendible
        const contenidoDesprendible = temp.querySelector('#nomina-resumen');
        if (!contenidoDesprendible) {
            throw new Error('No se encontró el contenido del desprendible en el template');
        }

        // Obtener o crear el contenedor en el documento actual
        let contenedorActual = document.getElementById('nomina-resumen');
        if (!contenedorActual) {
            contenedorActual = document.createElement('div');
            contenedorActual.id = 'nomina-resumen';
            document.body.appendChild(contenedorActual);
        }

        // Actualizar el contenido
        contenedorActual.innerHTML = contenidoDesprendible.innerHTML;
        contenedorActual.className = contenidoDesprendible.className;
        return true;
    } catch (error) {
        console.error('Error al procesar el template:', error);
        return crearEstructuraBasica();
    }
}

/**
 * Crea una estructura básica del desprendible si falla la carga del template
 * @returns {Promise<boolean>}
 */
async function crearEstructuraBasica() {
    try {
        console.log('Iniciando creación de estructura básica...');
        
        // Buscar el contenedor principal
        const contenedorPrincipal = document.getElementById('nomina-resumen');
        if (!contenedorPrincipal) {
            console.error('No se encontró el contenedor principal del desprendible');
            return false;
        }

        // Mostrar el estado de carga
        contenedorPrincipal.innerHTML = `
            <div class="text-center p-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2">Creando estructura del desprendible...</p>
            </div>
        `;
        contenedorPrincipal.className = 'p-4 bg-light rounded shadow';

        // Esperar un momento para que se muestre el spinner
        await new Promise(resolve => setTimeout(resolve, 100));

        // Crear la estructura del desprendible
        const contenido = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h4 class="text-primary mb-0">Desprendible de Nómina</h4>
                <img src="${config.logo}" alt="Logo" style="height: 50px;">
            </div>

            <div class="row">
                <div class="col-md-6">
                    <div class="card mb-3">
                        <div class="card-body">
                            <h5 class="card-title">Información del Empleado</h5>
                            <p class="mb-2"><strong>Nombre:</strong> <span id="nomina-empleado"></span></p>
                            <p class="mb-2"><strong>Periodo:</strong> 
                                <span id="nomina-periodo-inicio-resumen"></span> al 
                                <span id="nomina-periodo-fin-resumen"></span>
                            </p>
                            <p class="mb-0"><strong>Tipo de Periodo:</strong> 
                                <span id="nomina-periodo-tipo-resumen"></span>
                            </p>
                        </div>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Detalle de Pago</h5>
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <tbody>
                                        <tr>
                                            <td><strong>Salario Base:</strong></td>
                                            <td class="text-end">
                                                <span id="nomina-salario-base-resumen"></span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><strong>Bonificaciones:</strong></td>
                                            <td class="text-end">
                                                <span id="nomina-bonificaciones"></span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><strong>Deducciones:</strong></td>
                                            <td class="text-end">
                                                <span id="nomina-deducciones"></span>
                                            </td>
                                        </tr>
                                        <tr class="table-primary">
                                            <td><strong>Salario Neto:</strong></td>
                                            <td class="text-end">
                                                <strong><span id="nomina-salario-neto"></span></strong>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="d-flex gap-3 mt-4 justify-content-center print-hide">
                <button id="generar-pdf" class="btn btn-primary">
                    <i class="fas fa-file-pdf me-2"></i>Generar PDF
                </button>
                <button id="guardar-nomina" class="btn btn-success">
                    <i class="fas fa-save me-2"></i>Guardar Nómina
                </button>
            </div>

            <div class="text-center mt-3">
                <small class="text-muted">Este documento es un comprobante de pago</small>
            </div>

            <footer class="mt-4 text-end border-top pt-3">
                <div id="generation-info" class="text-muted"></div>
            </footer>
        `;

        // Agregar el contenido al contenedor
        contenedorPrincipal.innerHTML = contenido;

        // Esperar un momento para que el DOM se actualice
        await new Promise(resolve => setTimeout(resolve, 50));

        // Verificar que todos los elementos se hayan creado correctamente
        const elementosRequeridos = [
            'nomina-empleado',
            'nomina-periodo-inicio-resumen',
            'nomina-periodo-fin-resumen',
            'nomina-periodo-tipo-resumen',
            'nomina-salario-base-resumen',
            'nomina-bonificaciones',
            'nomina-deducciones',
            'nomina-salario-neto',
            'generation-info'
        ];

        const elementosFaltantes = elementosRequeridos.filter(id => !document.getElementById(id));
        if (elementosFaltantes.length > 0) {
            console.error('No se pudieron crear los siguientes elementos:', elementosFaltantes);
            return false;
        }

        console.log('Estructura básica creada exitosamente');
        return true;
    } catch (error) {
        console.error('Error al crear estructura básica:', error);
        return false;
    }
}

/**
 * Verifica que todos los elementos necesarios existan en el DOM
 * @returns {boolean}
 */
function verificarElementos() {
    const elementos = [
        'nomina-empleado',
        'nomina-periodo-inicio-resumen',
        'nomina-periodo-fin-resumen',
        'nomina-periodo-tipo-resumen',
        'nomina-salario-base-resumen',
        'nomina-bonificaciones',
        'nomina-deducciones',
        'nomina-salario-neto',
        'generation-info'
    ];

    const elementosFaltantes = elementos.filter(id => !document.getElementById(id));
    
    if (elementosFaltantes.length > 0) {
        console.error('Elementos faltantes:', elementosFaltantes);
        return false;
    }

    return true;
}

/**
 * Genera el desprendible de nómina con la información proporcionada
 * @param {Object} empleado - Datos del empleado (nombre, etc.)
 * @param {Object} periodo - Información del período de pago (inicio, fin, tipo)
 * @param {Object} salario - Información salarial (base, bonificaciones, deducciones, etc.)
 */
async function generarDesprendible(empleado, periodo, salario) {
    try {
        console.log('Iniciando generación del desprendible...');

        // 1. Verificar y obtener el contenedor
        const contenedor = document.getElementById('nomina-resumen');
        if (!contenedor) {
            throw new Error('No se encontró el contenedor del desprendible');
        }

        // 2. Crear la estructura básica
        contenedor.className = 'p-4 bg-light rounded shadow';
        contenedor.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 class="text-primary mb-1">Desprendible de Nómina</h4>
                    <small class="text-muted">${EMPRESA_CONFIG.nombre}</small>
                </div>
                <img src="${config.logo}" alt="Logo" class="img-fluid" style="height: 60px;">
            </div>

            <div class="row">
                <div class="col-12 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title mb-4">
                                <i class="fas fa-user-tie me-2"></i>Información del Empleado
                            </h5>
                            <div class="row g-3">
                                <div class="col-md-4">
                                    <label class="form-label fw-bold">Nombre:</label>
                                    <div class="form-control-plaintext border-bottom pb-2" id="nomina-empleado"></div>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label fw-bold">Tipo Documento:</label>
                                    <div class="form-control-plaintext border-bottom pb-2" id="nomina-tipo-documento"></div>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label fw-bold">Documento:</label>
                                    <div class="form-control-plaintext border-bottom pb-2" id="nomina-documento-display"></div>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label fw-bold">Fecha de Ingreso:</label>
                                    <div class="form-control-plaintext border-bottom pb-2" id="nomina-fecha-ingreso"></div>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label fw-bold">Cargo:</label>
                                    <div class="form-control-plaintext border-bottom pb-2" id="nomina-cargo"></div>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label fw-bold">Área:</label>
                                    <div class="form-control-plaintext border-bottom pb-2" id="nomina-area"></div>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label fw-bold">Teléfono:</label>
                                    <div class="form-control-plaintext border-bottom pb-2" id="nomina-telefono"></div>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label fw-bold">Correo:</label>
                                    <div class="form-control-plaintext border-bottom pb-2" id="nomina-correo"></div>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label fw-bold">Contrato:</label>
                                    <div class="form-control-plaintext border-bottom pb-2" id="nomina-contrato"></div>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label fw-bold">Contacto:</label>
                                    <div class="form-control-plaintext border-bottom pb-2" id="nomina-contacto"></div>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label fw-bold">Salario Base:</label>
                                    <div class="form-control-plaintext border-bottom pb-2" id="nomina-salario-base"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-12">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">
                                <i class="fas fa-file-invoice-dollar me-2"></i>Detalle de Pago
                            </h5>
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <tbody>
                                        <tr>
                                            <td><i class="fas fa-money-bill-wave me-2"></i>Salario Base:</td>
                                            <td class="text-end">
                                                <span id="nomina-salario-base-resumen" class="text-primary"></span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><i class="fas fa-plus-circle me-2"></i>Bonificaciones:</td>
                                            <td class="text-end">
                                                <span id="nomina-bonificaciones" class="text-success"></span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><i class="fas fa-minus-circle me-2"></i>Deducciones:</td>
                                            <td class="text-end">
                                                <span id="nomina-deducciones" class="text-danger"></span>
                                            </td>
                                        </tr>
                                        <tr class="table-primary">
                                            <td><i class="fas fa-coins me-2"></i>Salario Neto:</td>
                                            <td class="text-end">
                                                <strong><span id="nomina-salario-neto" class="h5 mb-0"></span></strong>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="d-flex gap-3 mt-4 justify-content-center print-hide">
                <button id="guardar-nomina" class="btn btn-primary">
                    <i class="fas fa-save me-2"></i>Guardar Nómina
                </button>
                <button id="generar-pdf" class="btn btn-success">
                    <i class="fas fa-file-pdf me-2"></i>Generar PDF
                </button>
            </div>

            <div class="text-center mt-3">
                <small class="text-muted">Este documento es un comprobante de pago</small>
            </div>

            <footer class="mt-4 text-end border-top pt-3">
                <div id="generation-info" class="text-muted"></div>
            </footer>
        `;

        // 3. Esperar a que el DOM se actualice
        await new Promise(resolve => setTimeout(resolve, 50));

        // 4. Verificar que los elementos existan
        const elementosRequeridos = [
            'nomina-empleado',
            'nomina-tipo-documento',
            'nomina-documento-display',
            'nomina-fecha-ingreso',
            'nomina-cargo',
            'nomina-area',
            'nomina-telefono',
            'nomina-correo',
            'nomina-contrato',
            'nomina-contacto',
            'nomina-salario-base',
            'nomina-salario-base-resumen',
            'nomina-bonificaciones',
            'nomina-deducciones',
            'nomina-salario-neto',
            'generation-info'
        ];

        const elementosFaltantes = elementosRequeridos.filter(id => !document.getElementById(id));
        if (elementosFaltantes.length > 0) {
            throw new Error(`No se encontraron los siguientes elementos: ${elementosFaltantes.join(', ')}`);
        }

        // 5. Actualizar los valores
        const actualizaciones = {
            'nomina-empleado': empleado?.nombre || 'No especificado',
            'nomina-tipo-documento': empleado?.tipo_documento || 'No especificado',
            'nomina-documento-display': empleado?.documento || 'No especificado',
            'nomina-fecha-ingreso': empleado?.fecha_ingreso || 'No especificado',
            'nomina-cargo': empleado?.cargo || 'No especificado',
            'nomina-area': empleado?.area || 'No especificado',
            'nomina-telefono': empleado?.telefono || 'No especificado',
            'nomina-correo': empleado?.correo || 'No especificado',
            'nomina-contrato': empleado?.contrato || 'No especificado',
            'nomina-contacto': empleado?.contacto || 'No especificado',
            'nomina-salario-base': formatearMoneda(empleado?.salario || 0),
            'nomina-salario-base-resumen': formatearMoneda(salario?.base || 0),
            'nomina-bonificaciones': formatearMoneda(salario?.bonificaciones || 0),
            'nomina-deducciones': formatearMoneda(salario?.deducciones || 0),
            'nomina-salario-neto': formatearMoneda(salario?.salario_neto || 0)
        };

        for (const [id, valor] of Object.entries(actualizaciones)) {
            const elemento = document.getElementById(id);
            if (!elemento) {
                console.error(`Elemento ${id} no encontrado al intentar actualizar su valor`);
                continue;
            }
            elemento.textContent = valor;
        }

        // 6. Actualizar información de generación
        const generationInfo = document.getElementById('generation-info');
        if (generationInfo) {
            generationInfo.textContent = `Generado el ${new Date().toLocaleDateString()} | ${config.sitioWeb}`;
        }

        console.log('Desprendible generado exitosamente');
    } catch (error) {
        console.error('Error al generar el desprendible:', error);
        throw error;
    }
}

/**
 * Formatea un valor numérico como moneda colombiana
 * @param {number} valor - Valor a formatear
 * @returns {string} Valor formateado como moneda
 */
function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(valor);
}

/**
 * Control de debounce para evitar múltiples clics
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Genera el PDF del desprendible
 */
async function generarPDF() {
    try {
        // Deshabilitar el botón mientras se genera el PDF
        const botonPDF = document.getElementById('generar-pdf');
        if (botonPDF.disabled) return;
        
        botonPDF.disabled = true;
        botonPDF.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generando...';

        // Verificar que los datos necesarios estén presentes
        if (!verificarDatosNecesarios()) {
            throw new Error('Faltan datos necesarios para generar el PDF');
        }

        // Generar el PDF
        await generarDesprendiblePDF();

        // Restaurar el botón después de 1 segundo
        setTimeout(() => {
            botonPDF.disabled = false;
            botonPDF.innerHTML = '<i class="fas fa-file-pdf me-2"></i>Generar PDF';
        }, 1000);

    } catch (error) {
        const botonPDF = document.getElementById('generar-pdf');
        botonPDF.disabled = false;
        botonPDF.innerHTML = '<i class="fas fa-file-pdf me-2"></i>Generar PDF';
        Utils.showMessage('Error al generar el PDF: ' + error.message, 'error');
    }
}

// Inicialización con debounce
document.addEventListener('DOMContentLoaded', () => {
    const botonPDF = document.getElementById('generar-pdf');
    if (botonPDF) {
        const generarPDFDebounced = debounce(generarPDF, 1000);
        botonPDF.addEventListener('click', generarPDFDebounced);
    }
});

// Inicialización del módulo de nómina
window.NominaApp = {
    ready: false,
    initialized: false,
    
    // Función para inicializar el módulo
    async init() {
        try {
            console.log('Iniciando inicialización del módulo de nómina...');
            
            // Verificar que estamos en la página correcta
            const contenedor = document.getElementById('nomina-resumen');
            if (!contenedor) {
                console.log('No estamos en la página de nómina');
                return false;
            }

            // Verificar elementos y crearlos si faltan
            if (!verificarElementosNomina()) {
                console.log('Creando elementos faltantes...');
                const elementosCreados = await crearElementosFaltantes();
                if (!elementosCreados) {
                    throw new Error('No se pudieron crear los elementos necesarios');
                }
            }

            // Inicializar valores por defecto
            inicializarValoresDefecto();

            // Configurar eventos
            const documentoInput = document.getElementById('nomina-documento');
            if (documentoInput) {
                documentoInput.addEventListener('change', (e) => buscarEmpleado(e.target.value));
                documentoInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') buscarEmpleado(e.target.value);
                });
            }

            // Configurar botones
            const guardarBtn = document.getElementById('guardar-nomina');
            const generarPdfBtn = document.getElementById('generar-pdf');

            if (guardarBtn) guardarBtn.addEventListener('click', guardarNomina);
            if (generarPdfBtn) generarPdfBtn.addEventListener('click', generarPDF);

            this.ready = true;
            this.initialized = true;
            console.log('Módulo de nómina inicializado correctamente');
            return true;
        } catch (error) {
            console.error('Error al inicializar el módulo de nómina:', error);
            return false;
        }
    }
};

/**
 * Verifica que todos los elementos necesarios existan en el DOM
 * @returns {boolean}
 */
function verificarElementosNomina() {
    const elementosRequeridos = [
        'nomina-empleado',
        'nomina-documento',
        'nomina-salario-base-resumen',
        'nomina-bonificaciones',
        'nomina-deducciones',
        'nomina-salario-neto',
        'nomina-periodo-inicio',
        'nomina-periodo-fin',
        'nomina-periodo-tipo'
    ];
    
    const elementosFaltantes = elementosRequeridos.filter(id => !document.getElementById(id));
    if (elementosFaltantes.length > 0) {
        console.error('Elementos faltantes:', elementosFaltantes);
    }
    return elementosFaltantes.length === 0;
}

/**
 * Inicializa los valores por defecto en el formulario
 */
function inicializarValoresDefecto() {
    // Inicializar fechas
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    const periodoInicio = document.getElementById('nomina-periodo-inicio');
    const periodoFin = document.getElementById('nomina-periodo-fin');

    if (periodoInicio) periodoInicio.value = primerDia.toISOString().split('T')[0];
    if (periodoFin) periodoFin.value = ultimoDia.toISOString().split('T')[0];

    // Inicializar valores monetarios
    ['nomina-salario-base-resumen', 'nomina-bonificaciones', 'nomina-deducciones', 'nomina-salario-neto'].forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento && !elemento.textContent.startsWith('$')) {
            elemento.textContent = '$0';
        }
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('DOM cargado, iniciando módulo de nómina...');
        await window.NominaApp.init();
    } catch (error) {
        console.error('Error durante la inicialización:', error);
    }
});

// Eliminar cualquier inicialización anterior
document.removeEventListener('DOMContentLoaded', initNominaModule);

// Remover cualquier event listener existente del botón PDF
const botonPDF = document.getElementById('generar-pdf');
if (botonPDF) {
    const nuevoBoton = botonPDF.cloneNode(true);
    botonPDF.parentNode.replaceChild(nuevoBoton, botonPDF);
} 