document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const form = document.getElementById('calculadora-liquidacion');
    const documentoInput = document.getElementById('documento_empleado');
    const nombreInput = document.getElementById('nombre_empleado');
    const salarioInput = document.getElementById('salario_base');
    const tipoContratoSelect = document.getElementById('tipo_contrato');
    const fechaInicioInput = document.getElementById('fecha_inicio');
    const fechaTerminacionInput = document.getElementById('fecha_terminacion');
    const motivoRetiroSelect = document.getElementById('motivo_retiro');
    const tiempoLaboradoDiv = document.getElementById('tiempo_laborado');
    const resultadosDiv = document.getElementById('resultados');
    const confirmacionModal = new bootstrap.Modal(document.getElementById('confirmacionModal'));

    // Constantes para cálculos
    const DIAS_POR_ANO = 360;
    const DIAS_POR_MES = 30;
    const PORCENTAJE_CESANTIAS = 0.0833; // 8.33%
    const PORCENTAJE_INTERESES_CESANTIAS = 0.12; // 12% anual
    const PORCENTAJE_PRIMA = 0.0833; // 8.33%
    const PORCENTAJE_VACACIONES = 0.0417; // 4.17%

    // Función para formatear moneda
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // Función para calcular días entre fechas
    const calcularDiasLaborados = (fechaInicio, fechaFin) => {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        const diferencia = fin - inicio;
        return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    };

    // Función para actualizar el tiempo laborado
    const actualizarTiempoLaborado = () => {
        if (fechaInicioInput.value && fechaTerminacionInput.value) {
            const dias = calcularDiasLaborados(fechaInicioInput.value, fechaTerminacionInput.value);
            const anos = Math.floor(dias / DIAS_POR_ANO);
            const meses = Math.floor((dias % DIAS_POR_ANO) / DIAS_POR_MES);
            const diasRestantes = dias % DIAS_POR_MES;

            tiempoLaboradoDiv.innerHTML = `
                <strong>Tiempo total:</strong> ${anos} años, ${meses} meses y ${diasRestantes} días
                <br>
                <strong>Total días:</strong> ${dias} días
            `;
        }
    };

    // Función para calcular cesantías
    const calcularCesantias = (salario, dias) => {
        return (salario * dias * PORCENTAJE_CESANTIAS) / DIAS_POR_ANO;
    };

    // Función para calcular intereses sobre cesantías
    const calcularInteresesCesantias = (cesantias, dias) => {
        return (cesantias * PORCENTAJE_INTERESES_CESANTIAS * dias) / DIAS_POR_ANO;
    };

    // Función para calcular prima de servicios
    const calcularPrima = (salario, dias) => {
        return (salario * dias * PORCENTAJE_PRIMA) / DIAS_POR_ANO;
    };

    // Función para calcular vacaciones
    const calcularVacaciones = (salario, dias) => {
        return (salario * dias * PORCENTAJE_VACACIONES) / DIAS_POR_ANO;
    };

    // Función para calcular indemnización
    const calcularIndemnizacion = (salario, tipoContrato, dias, motivoRetiro) => {
        if (motivoRetiro !== 'sin_justa_causa') {
            return 0;
        }

        let indemnizacion = 0;
        const salarioDiario = salario / 30;

        if (tipoContrato === 'indefinido') {
            if (dias <= DIAS_POR_ANO) {
                indemnizacion = salarioDiario * 30;
            } else {
                const anosCompletos = Math.floor(dias / DIAS_POR_ANO);
                indemnizacion = salarioDiario * 30; // Primer año
                indemnizacion += salarioDiario * 20 * (anosCompletos - 1); // Años adicionales
            }
        } else if (tipoContrato === 'fijo') {
            // Para contratos a término fijo, la indemnización es el tiempo restante del contrato
            const diasRestantes = dias;
            indemnizacion = salarioDiario * diasRestantes;
        }

        return indemnizacion;
    };

    // Función para realizar todos los cálculos
    const calcularLiquidacion = async (event) => {
        event.preventDefault();

        // Validar campos requeridos
        if (!documentoInput.value || !fechaInicioInput.value || !fechaTerminacionInput.value || !motivoRetiroSelect.value) {
            alert('Por favor complete todos los campos requeridos');
            return;
        }

        try {
            const response = await fetch('/api/recursos_humanos/calcular_liquidacion/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                },
                body: JSON.stringify({
                    documento: documentoInput.value,
                    fecha_inicio: fechaInicioInput.value,
                    fecha_fin: fechaTerminacionInput.value,
                    motivo_retiro: motivoRetiroSelect.value
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al calcular la liquidación');
            }

            const data = await response.json();

            // Actualizar valores en la interfaz
            document.getElementById('cesantias').textContent = formatCurrency(data.cesantias);
            document.getElementById('intereses_cesantias').textContent = formatCurrency(data.intereses_cesantias);
            document.getElementById('prima_servicios').textContent = formatCurrency(data.prima_servicios);
            document.getElementById('vacaciones').textContent = formatCurrency(data.vacaciones);
            document.getElementById('indemnizacion').textContent = formatCurrency(data.indemnizacion);
            document.getElementById('total_liquidacion').textContent = formatCurrency(data.total);

            // Mostrar resultados y modal de confirmación
            resultadosDiv.style.display = 'block';
            resultadosDiv.scrollIntoView({ behavior: 'smooth' });
            confirmacionModal.show();
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    };

    // Función para guardar la liquidación
    const guardarLiquidacion = async () => {
        try {
            const response = await fetch('/api/recursos_humanos/liquidaciones/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                },
                body: JSON.stringify({
                    empleado_nombre: nombreInput.value,
                    contrato: tipoContratoSelect.value,
                    motivo_retiro: motivoRetiroSelect.value,
                    fecha_liquidacion: fechaTerminacionInput.value,
                    cesantias: parseFloat(document.getElementById('cesantias').textContent.replace(/[^0-9.-]+/g, '')),
                    intereses_cesantias: parseFloat(document.getElementById('intereses_cesantias').textContent.replace(/[^0-9.-]+/g, '')),
                    prima_servicios: parseFloat(document.getElementById('prima_servicios').textContent.replace(/[^0-9.-]+/g, '')),
                    vacaciones: parseFloat(document.getElementById('vacaciones').textContent.replace(/[^0-9.-]+/g, '')),
                    indemnizacion: parseFloat(document.getElementById('indemnizacion').textContent.replace(/[^0-9.-]+/g, ''))
                })
            });

            if (!response.ok) {
                throw new Error('Error al guardar la liquidación');
            }

            const result = await response.json();
            confirmacionModal.hide();
            alert('Liquidación guardada exitosamente');
            
            // Limpiar el formulario
            form.reset();
            resultadosDiv.style.display = 'none';
        } catch (error) {
            console.error('Error:', error);
            alert('Error al guardar la liquidación: ' + error.message);
        }
    };

    // Event Listeners
    form.addEventListener('submit', calcularLiquidacion);
    
    fechaInicioInput.addEventListener('change', actualizarTiempoLaborado);
    fechaTerminacionInput.addEventListener('change', actualizarTiempoLaborado);

    // Validación de fechas
    fechaTerminacionInput.addEventListener('change', function() {
        const fechaInicio = new Date(fechaInicioInput.value);
        const fechaTerminacion = new Date(this.value);

        if (fechaTerminacion < fechaInicio) {
            alert('La fecha de terminación no puede ser anterior a la fecha de inicio');
            this.value = '';
            tiempoLaboradoDiv.innerHTML = '';
        }
    });

    // Manejo del modal de confirmación
    document.getElementById('confirmarLiquidacion').addEventListener('click', guardarLiquidacion);

    // Formateo automático del campo de salario
    salarioInput.addEventListener('input', function(e) {
        let value = this.value.replace(/\D/g, '');
        if (value.length > 0) {
            value = parseInt(value).toLocaleString('es-CO');
            this.value = value;
        }
    });

    // Validación del salario mínimo
    const SALARIO_MINIMO = 1300000; // Actualizar según el año
    salarioInput.addEventListener('blur', function() {
        const valor = parseInt(this.value.replace(/\D/g, ''));
        if (valor < SALARIO_MINIMO) {
            alert(`El salario no puede ser menor al salario mínimo (${SALARIO_MINIMO.toLocaleString('es-CO')})`);
            this.value = '';
        }
    });
}); 