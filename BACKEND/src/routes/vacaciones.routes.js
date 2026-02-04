// src/routes/vacaciones.routes.js
const express = require("express");
const { pool } = require("../db");

const router = express.Router();

/* ============================================================
   GET /api/vacaciones
   Listado de solicitudes de vacaciones
   (con datos básicos del empleado y su foto)
============================================================ */
router.get("/", async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT
        v.id_vacacion AS id,
        v.id_vacacion,
        e.dpi                                AS empleadoDpi,
        CONCAT(e.nombres, ' ', e.apellidos)  AS empleadoNombre,
        e.foto_perfil_ruta                   AS foto_perfil_ruta,
        CONVERT(varchar(10), v.fecha_inicio, 23)    AS fechaInicio,
        CONVERT(varchar(10), v.fecha_fin, 23)       AS fechaFin,
        v.dias,
        CONVERT(varchar(10), v.fecha_solicitud, 23) AS fechaSolicitud,
        v.estado,
        v.motivo
      FROM Vacaciones v
      INNER JOIN Empleados e
        ON e.id_empleado = v.id_empleado
      ORDER BY v.fecha_solicitud DESC, v.id_vacacion DESC;
    `);

    const rows = result.recordset.map((row) => ({
      id: row.id,
      empleadoDpi: row.empleadoDpi,
      empleadoNombre: row.empleadoNombre,
      fechaInicio: row.fechaInicio,
      fechaFin: row.fechaFin,
      dias: row.dias,
      fechaSolicitud: row.fechaSolicitud,
      estado: row.estado,
      motivo: row.motivo,
      // Foto del empleado (misma lógica que en empleados.routes.js)
      fotoUrl: row.foto_perfil_ruta
        ? `http://localhost:4000/uploads/fotos-empleados/${row.foto_perfil_ruta}`
        : null,
    }));

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener vacaciones:", error);
    res.status(500).json({
      message: "Error al obtener vacaciones",
      error: error.message, // 👈 para ver el detalle en Network → Response
    });
  }
});

/* ============================================================
   POST /api/vacaciones
   Crear una nueva solicitud de vacaciones
   Body esperado desde el front:
   {
     dpi,
     fechaInicio,
     fechaFin,
     dias,
     motivo
   }
============================================================ */
router.post("/", async (req, res) => {
  const { dpi, fechaInicio, fechaFin, dias, motivo } = req.body;

  if (!dpi || !fechaInicio || !fechaFin || !dias) {
    return res.status(400).json({
      message:
        "Faltan datos obligatorios (dpi, fechaInicio, fechaFin, dias).",
    });
  }

  try {
    // 1. Buscar empleado por DPI
    const empResult = await pool
      .request()
      .input("dpi", dpi)
      .query(`
        SELECT TOP 1
          e.id_empleado,
          e.dpi,
          CONCAT(e.nombres, ' ', e.apellidos) AS nombreCompleto,
          e.foto_perfil_ruta
        FROM Empleados e
        WHERE e.dpi = @dpi;
      `);

    if (empResult.recordset.length === 0) {
      return res
        .status(400)
        .json({ message: "No se encontró un empleado con ese DPI." });
    }

    const emp = empResult.recordset[0];

    const hoy = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const diasInt = parseInt(dias, 10) || 0;

    // 2. Insertar la solicitud de vacaciones
    const insertResult = await pool
      .request()
      .input("id_empleado", emp.id_empleado)
      .input("fecha_inicio", fechaInicio)
      .input("fecha_fin", fechaFin)
      .input("dias", diasInt)
      .input("motivo", motivo || null)
      .input("fecha_solicitud", hoy)
      .input("estado", "Pendiente")
      .query(`
        INSERT INTO Vacaciones (
          id_empleado,
          fecha_inicio,
          fecha_fin,
          dias,
          motivo,
          fecha_solicitud,
          estado
        )
        VALUES (
          @id_empleado,
          @fecha_inicio,
          @fecha_fin,
          @dias,
          @motivo,
          @fecha_solicitud,
          @estado
        );
        SELECT SCOPE_IDENTITY() AS id_vacacion;
      `);

    const id_vacacion = insertResult.recordset[0].id_vacacion;

    // 3. Responder con el objeto que el front necesita
    res.status(201).json({
      id: id_vacacion,
      empleadoDpi: emp.dpi,
      empleadoNombre: emp.nombreCompleto,
      fechaInicio,
      fechaFin,
      dias: diasInt,
      fechaSolicitud: hoy,
      estado: "Pendiente",
      motivo: motivo || "",
      fotoUrl: emp.foto_perfil_ruta
        ? `http://localhost:4000/uploads/fotos-empleados/${emp.foto_perfil_ruta}`
        : null,
    });
  } catch (error) {
    console.error("Error al crear vacaciones:", error);
    res.status(500).json({
      message: "Error al crear solicitud de vacaciones",
      error: error.message,
    });
  }
});

/* ============================================================
   PUT /api/vacaciones/:id
   Actualizar estado de la solicitud (Aprobado / Rechazado / Pendiente)
   Body: { estado }
============================================================ */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!estado) {
    return res
      .status(400)
      .json({ message: "El campo 'estado' es obligatorio." });
  }

  try {
    const idInt = parseInt(id, 10);
    if (!Number.isInteger(idInt)) {
      return res.status(400).json({ message: "id_vacacion inválido" });
    }

    await pool
      .request()
      .input("id_vacacion", idInt)
      .input("estado", estado)
      .query(`
        UPDATE Vacaciones
        SET estado = @estado
        WHERE id_vacacion = @id_vacacion;
      `);

    res.json({ message: "Solicitud de vacaciones actualizada correctamente." });
  } catch (error) {
    console.error("Error al actualizar vacaciones:", error);
    res.status(500).json({
      message: "Error al actualizar vacaciones",
      error: error.message,
    });
  }
});

/* ============================================================
   GET /api/vacaciones/dias-disponibles?anio=2026
   Días de vacación disponibles por empleado para un año
   (ejemplo simple: 20 días al año menos lo ya tomado)
============================================================ */
router.get("/dias-disponibles", async (req, res) => {
  const anio = parseInt(req.query.anio, 10) || new Date().getFullYear();
  const DIAS_ANUALES = 20; // 👈 puedes ajustar esto o sacarlo de otra tabla

  try {
    const result = await pool
      .request()
      .input("anio", anio)
      .query(`
        WITH DiasTomados AS (
          SELECT
            v.id_empleado,
            SUM(v.dias) AS diasTomados
          FROM Vacaciones v
          WHERE YEAR(v.fecha_inicio) = @anio
             OR YEAR(v.fecha_fin) = @anio
          GROUP BY v.id_empleado
        )
        SELECT
          e.id_empleado,
          e.codigo_empleado                AS codigo,
          CONCAT(e.nombres, ' ', e.apellidos) AS nombre,
          e.dpi,
          e.foto_perfil_ruta,
          ISNULL(${DIAS_ANUALES} - ISNULL(dt.diasTomados, 0), ${DIAS_ANUALES}) AS diasDisponibles
        FROM Empleados e
        LEFT JOIN DiasTomados dt
          ON dt.id_empleado = e.id_empleado
        WHERE e.estado = 'ACTIVO'
        ORDER BY e.codigo_empleado;
      `);

    const rows = result.recordset.map((row) => ({
      codigo: row.codigo,
      dpi: row.dpi,
      nombre: row.nombre,
      diasDisponibles: row.diasDisponibles,
      fotoUrl: row.foto_perfil_ruta
        ? `http://localhost:4000/uploads/fotos-empleados/${row.foto_perfil_ruta}`
        : null,
    }));

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener días disponibles:", error);
    res.status(500).json({
      message: "Error al obtener días disponibles",
      error: error.message,
    });
  }
});

module.exports = router;
