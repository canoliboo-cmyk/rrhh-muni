--TABLA PARA RENGLONES

CREATE TABLE Renglones (
    id_renglon INT IDENTITY(1,1) NOT NULL,
    codigo VARCHAR(10) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) NULL,
    activo BIT NOT NULL DEFAULT 1,
    fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_Renglones PRIMARY KEY (id_renglon),
    CONSTRAINT UQ_Renglones_codigo UNIQUE (codigo)
);

--insert
 select * from Renglones
 INSERT INTO Renglones (codigo, nombre, descripcion)
VALUES
('011', 'Personal permanente', 'Personal con plaza presupuestada permanente'),
('022', 'Personal por contrato', 'Personal contratado por servicios profesionales'),
('029', 'Personal por planilla', 'Personal temporal por necesidades específicas');

SELECT 
    r.id_renglon,
    r.codigo,
    r.nombre,
    r.descripcion,
    COUNT(e.id_empleado) AS empleadosAsignados
FROM Renglones r
LEFT JOIN Empleados e
    ON e.id_renglon = r.id_renglon
   AND e.estado = 'ACTIVO'   -- opcional: solo empleados activos
WHERE r.activo = 1
GROUP BY 
    r.id_renglon,
    r.codigo,
    r.nombre,
    r.descripcion
ORDER BY r.codigo;
