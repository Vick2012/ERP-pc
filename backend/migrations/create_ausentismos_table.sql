-- Crear tipo enum para los tipos de registro
CREATE TYPE tipo_registro AS ENUM (
    'ausentismo',
    'hora_extra_diurna',
    'hora_extra_nocturna',
    'recargo_nocturno',
    'hora_extra_dominical'
);

-- Crear tabla de ausentismos y horas extras
CREATE TABLE IF NOT EXISTS ausentismos_horas_extras (
    id SERIAL PRIMARY KEY,
    empleado_id INTEGER NOT NULL,
    fecha DATE NOT NULL,
    tipo tipo_registro NOT NULL,
    duracion_horas DECIMAL(5,2) NOT NULL CHECK (duracion_horas > 0 AND duracion_horas <= 24),
    motivo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_empleado
        FOREIGN KEY (empleado_id)
        REFERENCES empleados(id)
        ON DELETE CASCADE
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_ausentismos_empleado ON ausentismos_horas_extras(empleado_id);
CREATE INDEX idx_ausentismos_fecha ON ausentismos_horas_extras(fecha);
CREATE INDEX idx_ausentismos_tipo ON ausentismos_horas_extras(tipo);

-- Función para actualizar el timestamp de actualización
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar el timestamp automáticamente
CREATE TRIGGER update_ausentismos_updated_at
    BEFORE UPDATE ON ausentismos_horas_extras
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Vista para facilitar el cálculo de nómina
CREATE OR REPLACE VIEW vista_ausentismos_periodo AS
SELECT 
    e.documento,
    e.nombre as empleado_nombre,
    ah.fecha,
    ah.tipo,
    ah.duracion_horas,
    ah.motivo,
    CASE 
        WHEN ah.tipo = 'hora_extra_diurna' THEN ah.duracion_horas * 1.25
        WHEN ah.tipo = 'hora_extra_nocturna' THEN ah.duracion_horas * 1.75
        WHEN ah.tipo = 'recargo_nocturno' THEN ah.duracion_horas * 0.35
        WHEN ah.tipo = 'hora_extra_dominical' THEN ah.duracion_horas * 2.0
        ELSE 0
    END as factor_multiplicador
FROM ausentismos_horas_extras ah
JOIN empleados e ON e.id = ah.empleado_id;

-- Función para obtener el total de horas extras y ausentismos en un periodo
CREATE OR REPLACE FUNCTION calcular_horas_periodo(
    p_empleado_id INTEGER,
    p_fecha_inicio DATE,
    p_fecha_fin DATE
)
RETURNS TABLE (
    tipo tipo_registro,
    total_horas DECIMAL(10,2),
    factor_total DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ah.tipo,
        SUM(ah.duracion_horas) as total_horas,
        SUM(
            CASE 
                WHEN ah.tipo = 'hora_extra_diurna' THEN ah.duracion_horas * 1.25
                WHEN ah.tipo = 'hora_extra_nocturna' THEN ah.duracion_horas * 1.75
                WHEN ah.tipo = 'recargo_nocturno' THEN ah.duracion_horas * 0.35
                WHEN ah.tipo = 'hora_extra_dominical' THEN ah.duracion_horas * 2.0
                ELSE ah.duracion_horas
            END
        ) as factor_total
    FROM ausentismos_horas_extras ah
    WHERE 
        ah.empleado_id = p_empleado_id
        AND ah.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
    GROUP BY ah.tipo;
END;
$$ LANGUAGE plpgsql;

-- Comentarios de la tabla y columnas
COMMENT ON TABLE ausentismos_horas_extras IS 'Registro de ausentismos y horas extras de los empleados';
COMMENT ON COLUMN ausentismos_horas_extras.id IS 'Identificador único del registro';
COMMENT ON COLUMN ausentismos_horas_extras.empleado_id IS 'ID del empleado relacionado';
COMMENT ON COLUMN ausentismos_horas_extras.fecha IS 'Fecha del registro';
COMMENT ON COLUMN ausentismos_horas_extras.tipo IS 'Tipo de registro (ausentismo, hora extra, etc.)';
COMMENT ON COLUMN ausentismos_horas_extras.duracion_horas IS 'Duración en horas del registro';
COMMENT ON COLUMN ausentismos_horas_extras.motivo IS 'Motivo o descripción del registro';
COMMENT ON COLUMN ausentismos_horas_extras.created_at IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN ausentismos_horas_extras.updated_at IS 'Fecha y hora de última actualización del registro'; 