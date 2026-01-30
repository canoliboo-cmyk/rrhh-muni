--TABLA PARA DESCUENTOS
CREATE TABLE Descuentos (
    id_descuento INT IDENTITY(1,1) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL,               -- 'MONTO' o 'PORCENTAJE'
    monto_porcentaje DECIMAL(10,2) NOT NULL,
    descripcion VARCHAR(255) NULL,

    aplica_a_todos BIT NOT NULL DEFAULT 0,       -- Se puede aplicar a todos los empleados
    aplica_por_renglon BIT NOT NULL DEFAULT 0,   -- Se puede aplicar por renglón
    aplica_individual BIT NOT NULL DEFAULT 0,    -- Se puede aplicar a empleados específicos

    activo BIT NOT NULL DEFAULT 1,
    fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_Descuentos PRIMARY KEY (id_descuento),
    CONSTRAINT CHK_Descuentos_tipo CHECK (tipo IN ('MONTO', 'PORCENTAJE')),
    CONSTRAINT CHK_Descuentos_monto_porcentaje CHECK (monto_porcentaje > 0)
);

--select

select * from Descuentos
INSERT INTO Descuentos (
    nombre,
    tipo,
    monto_porcentaje,
    descripcion,
    aplica_a_todos,
    aplica_por_renglon,
    aplica_individual
)
VALUES
-- Descuento obligatorio a todos
('IGSS', 'PORCENTAJE', 4.83,
 'Descuento obligatorio de IGSS sobre el sueldo base',
 1, 0, 0),

-- Descuento que aplica a ciertos renglones
('Préstamo cooperativa', 'MONTO', 300.00,
 'Cuota fija mensual por préstamo de cooperativa',
 0, 1, 1),

-- Descuento individual
('Descuento disciplinario', 'MONTO', 150.00,
 'Descuento aplicado por sanción disciplinaria',
 0, 0, 1);

 SELECT
    d.id_descuento AS id,
    d.nombre,

    -- tipo para la pastillita (pill)
    CASE 
        WHEN d.nombre = 'IGSS' THEN 'IGSS'
        WHEN d.nombre = 'ISR'  THEN 'ISR'
        ELSE 'Personalizado'
    END AS tipo,

    CASE 
        WHEN d.tipo = 'MONTO' THEN d.monto_porcentaje
        ELSE NULL
    END AS montoFijo,

    CASE 
        WHEN d.tipo = 'PORCENTAJE' THEN d.monto_porcentaje
        ELSE NULL
    END AS porcentaje,

    d.activo,
    d.descripcion AS descripcionCard
FROM Descuentos d
ORDER BY d.nombre;

