--TABLA PARA BONIFICACIONES

CREATE TABLE Bonificaciones (
    id_bonificacion INT IDENTITY(1,1) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL,              -- 'MONTO' o 'PORCENTAJE'
    monto_porcentaje DECIMAL(10,2) NOT NULL,
    descripcion VARCHAR(255) NULL,

    aplica_a_todos BIT NOT NULL DEFAULT 0,      -- Se puede aplicar a todos los empleados
    aplica_por_renglon BIT NOT NULL DEFAULT 0,  -- Se puede aplicar por renglón presupuestario
    aplica_individual BIT NOT NULL DEFAULT 0,   -- Se puede aplicar a empleados específicos

    activo BIT NOT NULL DEFAULT 1,
    fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_Bonificaciones PRIMARY KEY (id_bonificacion),
    CONSTRAINT CHK_Bonificaciones_tipo CHECK (tipo IN ('MONTO', 'PORCENTAJE')),
    CONSTRAINT CHK_Bonificaciones_monto_porcentaje CHECK (monto_porcentaje > 0)
);

--select
select * from Bonificaciones

INSERT INTO Bonificaciones (
    nombre,
    tipo,
    monto_porcentaje,
    descripcion,
    aplica_a_todos,
    aplica_por_renglon,
    aplica_individual
)
VALUES
-- Bono general para todos
('Bono municipal general', 'MONTO', 250.00,
 'Bono general otorgado a todo el personal activo',
 1, 0, 0),

-- Bono por renglón (ej. solo renglón 011, lo controlaremos en tabla de relación)
('Bono de productividad', 'MONTO', 500.00,
 'Bono mensual fijo para personal que cumple metas',
 0, 1, 1),

-- Bono calculado por porcentaje
('Bono por riesgo', 'PORCENTAJE', 10.00,
 'Porcentaje aplicado sobre el sueldo base para puestos de riesgo',
 0, 1, 1);

 SELECT
    b.id_bonificacion AS id,
    b.nombre,
    LOWER(b.tipo) AS tipo,                    -- 'monto' | 'porcentaje'
    b.monto_porcentaje AS valor,

    -- asignación principal: prioridad todos > renglón > empleado
    CASE 
        WHEN b.aplica_a_todos = 1 THEN 'todos'
        WHEN b.aplica_por_renglon = 1 THEN 'renglon'
        WHEN b.aplica_individual = 1 THEN 'empleado'
        ELSE 'todos'
    END AS asignacion,

    -- texto para la tarjeta
    CASE 
        WHEN b.aplica_a_todos = 1 THEN 'Aplica a todos'
        WHEN b.aplica_por_renglon = 1 THEN 'Por renglón'
        WHEN b.aplica_individual = 1 THEN 'Empleado específico'
        ELSE 'Aplica a todos'
    END AS detalleAsignacion,

    b.activo
FROM Bonificaciones b
ORDER BY b.nombre;
