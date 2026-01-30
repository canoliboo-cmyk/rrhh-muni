--tabla departamentos
select * from Empleados
select * from Puestos
select * from renglones
select * from Departamentos

CREATE TABLE Departamentos (
    id_departamento INT IDENTITY(1,1) NOT NULL,
    nombre NVARCHAR(100) NOT NULL,
    descripcion NVARCHAR(255) NULL,
    activo BIT NOT NULL DEFAULT 1,
    fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_Departamentos PRIMARY KEY (id_departamento),
    CONSTRAINT UQ_Departamentos_nombre UNIQUE (nombre)
);

--tabla puesto
CREATE TABLE Puestos (
    id_puesto INT IDENTITY(1,1) NOT NULL,
    nombre NVARCHAR(150) NOT NULL,
    descripcion NVARCHAR(255) NULL,
    id_departamento INT NOT NULL,
    activo BIT NOT NULL DEFAULT 1,
    fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_Puestos PRIMARY KEY (id_puesto),
    CONSTRAINT UQ_Puestos_nombre UNIQUE (nombre),

    CONSTRAINT FK_Puestos_Departamentos
        FOREIGN KEY (id_departamento) REFERENCES Departamentos(id_departamento)
);

CREATE TABLE Empleados (
    id_empleado INT IDENTITY(1,1) NOT NULL,
    
    -- Datos personales
    nombres NVARCHAR(150) NOT NULL,
    apellidos NVARCHAR(150) NOT NULL,
    dpi VARCHAR(13) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    telefono VARCHAR(20) NULL,
    direccion NVARCHAR(255) NULL,

    -- Datos laborales
    id_renglon INT NOT NULL,
    id_departamento INT NOT NULL,
    id_puesto INT NOT NULL,
    fecha_ingreso DATE NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    salario_base DECIMAL(10,2) NOT NULL,

    -- Archivos
    foto_perfil_ruta NVARCHAR(255) NULL,
    dpi_pdf_ruta NVARCHAR(255) NULL,

    fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_Empleados PRIMARY KEY (id_empleado),
    CONSTRAINT UQ_Empleados_dpi UNIQUE (dpi),

    CONSTRAINT CHK_Empleados_estado
        CHECK (estado IN ('ACTIVO', 'INACTIVO', 'SUSPENDIDO')),

    CONSTRAINT FK_Empleados_Renglones
        FOREIGN KEY (id_renglon) REFERENCES Renglones(id_renglon),

    CONSTRAINT FK_Empleados_Departamentos
        FOREIGN KEY (id_departamento) REFERENCES Departamentos(id_departamento),

    CONSTRAINT FK_Empleados_Puestos
        FOREIGN KEY (id_puesto) REFERENCES Puestos(id_puesto)
);

INSERT INTO Empleados (
    nombres,
    apellidos,
    dpi,
    fecha_nacimiento,
    telefono,
    direccion,
    id_renglon,
    id_departamento,
    id_puesto,
    fecha_ingreso,
    estado,
    salario_base,
    foto_perfil_ruta,
    dpi_pdf_ruta
)
VALUES (
    N'Carlos Andrés',
    N'López Ramírez',
    '3012345670101',
    '1992-08-15',
    '5555-1234',
    N'Zona 1, San José Acatempa, Jutiapa',
    1,  -- id_renglon (cambia por el tuyo)
    2,  -- id_departamento (cambia por el tuyo)
    3,  -- id_puesto (cambia por el tuyo)
    '2024-01-10',
    'ACTIVO',
    4500.00,
    N'fotosempleados\3012345670101.jpg',   -- luego lo llenará tu backend
    N'dpiempleados\3012345670101.pdf'
);

ALTER TABLE Empleados
ADD codigo_empleado VARCHAR(20) NOT NULL DEFAULT(''),
    correo NVARCHAR(150) NULL,
    vacaciones_disponibles INT NOT NULL DEFAULT 0;

-- Y que el código sea único
ALTER TABLE Empleados
ADD CONSTRAINT UQ_Empleados_codigo_empleado UNIQUE (codigo_empleado);



--select bd
SELECT
    e.id_empleado,
    e.codigo_empleado AS codigo,
    CONCAT(e.nombres, ' ', e.apellidos) AS nombre,
    e.dpi,
    p.nombre AS puesto,
    d.nombre AS departamento,
    r.codigo AS renglon,
    -- estado en formato similar al front
    CASE 
        WHEN e.estado = 'ACTIVO' THEN 'Activo'
        WHEN e.estado = 'INACTIVO' THEN 'Inactivo'
        ELSE e.estado
    END AS estado,
    e.correo,
    e.telefono,
    e.fecha_ingreso AS fechaIngreso,
    e.salario_base AS salarioBase,
    e.vacaciones_disponibles AS vacacionesDisponibles
FROM Empleados e
INNER JOIN Renglones r      ON e.id_renglon = r.id_renglon
INNER JOIN Departamentos d  ON e.id_departamento = d.id_departamento
INNER JOIN Puestos p        ON e.id_puesto = p.id_puesto
ORDER BY e.codigo_empleado;
