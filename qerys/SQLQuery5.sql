SELECT * FROM dbo.Bonificaciones
SELECT * FROM BonificacionesRenglones 

SELECT * FROM BonificacionesEmpleados 


SELECT * FROM descuentos


 SELECT * FROM DescuentosRenglones 
SELECT * FROM  DescuentosEmpleados
-- Tabla de encabezado de planilla
CREATE TABLE Planillas (
    id_planilla       INT IDENTITY(1,1) PRIMARY KEY,
    mes               INT NOT NULL,           -- 1-12
    anio              INT NOT NULL,
    id_renglon        INT NULL,               -- NULL = todos los renglones
    descripcion       NVARCHAR(200) NULL,
    total_empleados   INT NOT NULL,
    total_monto       DECIMAL(12,2) NOT NULL, -- suma de salarios netos
    estado            VARCHAR(20) NOT NULL,   -- GENERADA / APROBADA / PAGADA
    fecha_creacion    DATETIME NOT NULL DEFAULT GETDATE()
);


select * from  dbo.Planillas 


select * from  dbo.PlanillaDetalle 
  
  select * from Bonificaciones
  
  select * from PlanillaDetalleBonificaciones 
    select * from  PlanillaDetalleDescuentos 
