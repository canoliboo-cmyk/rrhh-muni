const express = require("express");
const path = require("path");
const multer = require("multer");
const { pool } = require("../db");

const router = express.Router();

/* ============================================
   CONFIGURACIÓN DE MULTER (FOTO Y DPI)
   Carpetas reales:
   BACKEND/fotosempleados
   BACKEND/dpiempleados
============================================ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // __dirname = BACKEND/src/routes  → subimos a BACKEND
    const rootDir = path.join(__dirname, "..", "..");

    if (file.fieldname === "foto") {
      cb(null, path.join(rootDir, "fotosempleados"));
    } else if (file.fieldname === "dpi") {
      cb(null, path.join(rootDir, "dpiempleados"));
    } else {
      cb(null, path.join(rootDir, "uploads"));
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    cb(null, `${file.fieldname}-${timestamp}${ext}`);
  },
});

const upload = multer({ storage });

// Buscar empleados por DPI / código / nombre
router.get("/buscar", async (req, res) => {
  const { q } = req.query;
  const termino = (q || "").trim();

  if (!termino) {
    return res.json([]);
  }

  try {
    const request = pool.request();
    request.input("texto", `%${termino}%`);

    const result = await request.query(`
      SELECT TOP 20
        e.id_empleado,
        e.codigo_empleado,
        CONCAT(e.nombres,' ',e.apellidos) AS nombre,
        e.dpi,
        r.codigo AS renglon
      FROM Empleados e
      INNER JOIN Renglones r ON r.id_renglon = e.id_renglon
      WHERE e.dpi LIKE @texto
         OR e.codigo_empleado LIKE @texto
         OR (e.nombres + ' ' + e.apellidos) LIKE @texto
      ORDER BY e.codigo_empleado;
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error("Error buscando empleados:", error);
    res.status(500).json({ message: "Error al buscar empleados" });
  }
});

/* ============================================
   LISTADO DE EMPLEADOS
   GET /api/empleados
============================================ */
router.get("/", async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT
        e.id_empleado,
        e.codigo_empleado                    AS codigo,
        CONCAT(e.nombres,' ',e.apellidos)    AS nombre,
        e.dpi,
        p.nombre                             AS puesto,
        d.nombre                             AS departamento,
        r.codigo                             AS renglon,
        e.estado,
        e.telefono,
        CONVERT(char(10), e.fecha_ingreso, 23) AS fechaIngreso,
        e.salario_base                       AS salarioBase,
        0                                    AS vacacionesDisponibles,
        e.foto_perfil_ruta                   AS foto_perfil_ruta,
        e.dpi_pdf_ruta                       AS dpi_pdf_ruta
      FROM Empleados e
      INNER JOIN Renglones r      ON r.id_renglon = e.id_renglon
      INNER JOIN Departamentos d  ON d.id_departamento = e.id_departamento
      INNER JOIN Puestos p        ON p.id_puesto = e.id_puesto
      ORDER BY e.codigo_empleado;
    `);

    res.json(
      result.recordset.map((row) => ({
        ...row,
        // URLs que coinciden con las rutas estáticas del server
        fotoUrl: row.foto_perfil_ruta
          ? `http://localhost:4000/uploads/fotos-empleados/${row.foto_perfil_ruta}`
          : null,
        dpiUrl: row.dpi_pdf_ruta
          ? `http://localhost:4000/uploads/dpi-empleados/${row.dpi_pdf_ruta}`
          : null,
      }))
    );
  } catch (error) {
    console.error("Error empleados:", error);
    res.status(500).json({ message: "Error al obtener empleados" });
  }
});

/* ============================================
   OBTENER UN EMPLEADO POR ID
   GET /api/empleados/:id
============================================ */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const idEmpleadoInt = parseInt(id, 10);
    if (!Number.isInteger(idEmpleadoInt)) {
      return res.status(400).json({ message: "id_empleado inválido" });
    }

    const result = await pool
      .request()
      .input("id_empleado", idEmpleadoInt)
      .query(`
        SELECT
          e.id_empleado,
          e.codigo_empleado,
          e.nombres,
          e.apellidos,
          e.dpi,
          e.fecha_nacimiento,
          e.telefono,
          e.direccion,
          e.id_renglon,
          e.id_departamento,
          e.id_puesto,
          e.estado,
          e.fecha_ingreso,
          e.salario_base,
          e.foto_perfil_ruta AS foto_perfil_ruta,
          e.dpi_pdf_ruta     AS dpi_pdf_ruta
        FROM Empleados e
        WHERE e.id_empleado = @id_empleado;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    const emp = result.recordset[0];

    res.json({
      ...emp,
      fotoUrl: emp.foto_perfil_ruta
        ? `http://localhost:4000/uploads/fotos-empleados/${emp.foto_perfil_ruta}`
        : null,
      dpiUrl: emp.dpi_pdf_ruta
        ? `http://localhost:4000/uploads/dpi-empleados/${emp.dpi_pdf_ruta}`
        : null,
    });
  } catch (error) {
    console.error("Error empleado por id:", error);
    res.status(500).json({ message: "Error al obtener empleado" });
  }
});

/* ============================================
   CREAR EMPLEADO
   POST /api/empleados
============================================ */
router.post(
  "/",
  upload.fields([
    { name: "foto", maxCount: 1 },
    { name: "dpi", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        codigo_empleado,
        nombres,
        apellidos,
        dpi,
        fecha_nacimiento,
        telefono,
        direccion,
        id_renglon,
        id_departamento,
        id_puesto,
        estado,
        fecha_ingreso,
        salario_base,
      } = req.body;

      const idRenglonInt = id_renglon ? parseInt(id_renglon, 10) : null;
      const idDepartamentoInt = id_departamento
        ? parseInt(id_departamento, 10)
        : null;
      const idPuestoInt = id_puesto ? parseInt(id_puesto, 10) : null;

      const salarioBaseParsed = salario_base
        ? parseFloat(salario_base)
        : 0;

      const fotoFile = req.files?.foto?.[0] || null;
      const dpiFile = req.files?.dpi?.[0] || null;

      const foto_perfil_ruta = fotoFile ? fotoFile.filename : null;
      const dpi_pdf_ruta = dpiFile ? dpiFile.filename : null;

      const request = pool.request();

      request.input("codigo_empleado", codigo_empleado || null);
      request.input("nombres", nombres || null);
      request.input("apellidos", apellidos || null);
      request.input("dpi", dpi || null);

      request.input(
        "fecha_nacimiento",
        fecha_nacimiento && fecha_nacimiento !== "" ? fecha_nacimiento : null
      );
      request.input("telefono", telefono || null);
      request.input("direccion", direccion || null);

      request.input("id_renglon", idRenglonInt);
      request.input("id_departamento", idDepartamentoInt);
      request.input("id_puesto", idPuestoInt);

      request.input("estado", estado || "ACTIVO");

      request.input(
        "fecha_ingreso",
        fecha_ingreso && fecha_ingreso !== "" ? fecha_ingreso : null
      );

      request.input("salario_base", salarioBaseParsed);
      request.input("foto_perfil_ruta", foto_perfil_ruta);
      request.input("dpi_pdf_ruta", dpi_pdf_ruta);

      const result = await request.query(`
        INSERT INTO Empleados
        (
          codigo_empleado,
          nombres,
          apellidos,
          dpi,
          fecha_nacimiento,
          telefono,
          direccion,
          id_renglon,
          id_departamento,
          id_puesto,
          estado,
          fecha_ingreso,
          salario_base,
          foto_perfil_ruta,
          dpi_pdf_ruta
        )
        VALUES
        (
          @codigo_empleado,
          @nombres,
          @apellidos,
          @dpi,
          @fecha_nacimiento,
          @telefono,
          @direccion,
          @id_renglon,
          @id_departamento,
          @id_puesto,
          @estado,
          @fecha_ingreso,
          @salario_base,
          @foto_perfil_ruta,
          @dpi_pdf_ruta
        );

        SELECT SCOPE_IDENTITY() AS id_empleado;
      `);

      const newId = result.recordset[0].id_empleado;

      res.status(201).json({
        id_empleado: newId,
        codigo: codigo_empleado,
        nombre: `${nombres} ${apellidos}`,
        dpi,
        puesto: null,
        departamento: null,
        renglon: null,
        estado: estado || "ACTIVO",
        telefono,
        fechaIngreso: fecha_ingreso,
        salarioBase: salarioBaseParsed,
        vacacionesDisponibles: 0,
        foto_perfil_ruta,
        dpi_pdf_ruta,
        fotoUrl: foto_perfil_ruta
          ? `http://localhost:4000/uploads/fotos-empleados/${foto_perfil_ruta}`
          : null,
        dpiUrl: dpi_pdf_ruta
          ? `http://localhost:4000/uploads/dpi-empleados/${dpi_pdf_ruta}`
          : null,
      });
    } catch (error) {
      console.error("Error al crear empleado:", error);
      res.status(500).json({ message: "Error al crear empleado" });
    }
  }
);

/* ============================================
   ACTUALIZAR EMPLEADO
   PUT /api/empleados/:id
============================================ */
router.put(
  "/:id",
  upload.fields([
    { name: "foto", maxCount: 1 },
    { name: "dpi", maxCount: 1 },
  ]),
  async (req, res) => {
    const { id } = req.params;

    try {
      const {
        codigo_empleado,
        nombres,
        apellidos,
        dpi,
        fecha_nacimiento,
        telefono,
        direccion,
        id_renglon,
        id_departamento,
        id_puesto,
        estado,
        fecha_ingreso,
        salario_base,
      } = req.body;

      const idEmpleadoInt = parseInt(id, 10);
      if (!Number.isInteger(idEmpleadoInt)) {
        return res.status(400).json({ message: "id_empleado inválido" });
      }

      const idRenglonInt = id_renglon ? parseInt(id_renglon, 10) : null;
      const idDepartamentoInt = id_departamento
        ? parseInt(id_departamento, 10)
        : null;
      const idPuestoInt = id_puesto ? parseInt(id_puesto, 10) : null;

      const salarioBaseParsed = salario_base
        ? parseFloat(salario_base)
        : 0;

      const fotoFile = req.files?.foto?.[0] || null;
      const dpiFile = req.files?.dpi?.[0] || null;

      const nuevaFotoRuta = fotoFile ? fotoFile.filename : null;
      const nuevoDpiRuta = dpiFile ? dpiFile.filename : null;

      const request = pool.request();

      request.input("id_empleado", idEmpleadoInt);
      request.input("codigo_empleado", codigo_empleado || null);
      request.input("nombres", nombres || null);
      request.input("apellidos", apellidos || null);
      request.input("dpi", dpi || null);

      request.input(
        "fecha_nacimiento",
        fecha_nacimiento && fecha_nacimiento !== "" ? fecha_nacimiento : null
      );
      request.input("telefono", telefono || null);
      request.input("direccion", direccion || null);

      request.input("id_renglon", idRenglonInt);
      request.input("id_departamento", idDepartamentoInt);
      request.input("id_puesto", idPuestoInt);

      request.input("estado", estado || "ACTIVO");

      request.input(
        "fecha_ingreso",
        fecha_ingreso && fecha_ingreso !== "" ? fecha_ingreso : null
      );

      request.input("salario_base", salarioBaseParsed);
      request.input("nueva_foto", nuevaFotoRuta);
      request.input("nuevo_dpi", nuevoDpiRuta);

      await request.query(`
        UPDATE Empleados
        SET
          codigo_empleado   = @codigo_empleado,
          nombres           = @nombres,
          apellidos         = @apellidos,
          dpi               = @dpi,
          fecha_nacimiento  = @fecha_nacimiento,
          telefono          = @telefono,
          direccion         = @direccion,
          id_renglon        = @id_renglon,
          id_departamento   = @id_departamento,
          id_puesto         = @id_puesto,
          estado            = @estado,
          fecha_ingreso     = @fecha_ingreso,
          salario_base      = @salario_base,
          foto_perfil_ruta  = COALESCE(@nueva_foto, foto_perfil_ruta),
          dpi_pdf_ruta      = COALESCE(@nuevo_dpi, dpi_pdf_ruta)
        WHERE id_empleado = @id_empleado;
      `);

      res.json({ message: "Empleado actualizado correctamente" });
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      res.status(500).json({ message: "Error al actualizar empleado" });
    }
  }
);

module.exports = router;
