// src/routes/permisos.routes.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { pool } = require("../db");

const router = express.Router();

/* ===========================================================
   CONFIGURACIÓN DE MULTER PARA ARCHIVOS FIRMADOS
   Carpeta: BACKEND/permisos
=========================================================== */

const permisosDir = path.join(__dirname, "..", "permisos");

if (!fs.existsSync(permisosDir)) {
  fs.mkdirSync(permisosDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, permisosDir);
  },
  filename: (req, file, cb) => {
    const dpi = (req.body.dpi || "sin_dpi").replace(/\D/g, "");
    const ext = path.extname(file.originalname) || ".pdf";
    const timestamp = Date.now();
    cb(null, `${dpi}_permiso_${timestamp}${ext}`);
  },
});

const uploadFirmado = multer({ storage });

/* ===========================================================
   GET /api/permisos
   Lista de permisos con datos de empleado
=========================================================== */
router.get("/", async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT
        p.id_permiso AS id,                    -- 👈 alias para el front
        p.id_permiso,
        e.dpi,
        CONCAT(e.nombres, ' ', e.apellidos) AS empleado,
        d.nombre AS dependencia,
        p.tipo,
        CONVERT(varchar(10), p.fecha_inicio, 23)    AS fechaInicio,
        CONVERT(varchar(10), p.fecha_fin, 23)       AS fechaFin,
        p.motivo,
        CONVERT(varchar(10), p.fecha_solicitud, 23) AS fechaSolicitud,
        p.estado,
        p.archivo_firmado                           AS archivoFirmadoNombre
      FROM Permisos p
      INNER JOIN Empleados e
        ON e.id_empleado = p.id_empleado
      LEFT JOIN Departamentos d
        ON d.id_departamento = e.id_departamento
      ORDER BY p.fecha_solicitud DESC, p.id_permiso DESC;
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener permisos:", error);
    res.status(500).json({ message: "Error al obtener permisos" });
  }
});

/* ===========================================================
   POST /api/permisos
   Crear permiso (SIN archivo firmado aún)
   Body desde el front:
   {
     dpi,
     tipo,
     fechaInicio,
     fechaFin,
     motivo
   }
=========================================================== */
router.post("/", async (req, res) => {
  const { dpi, tipo, fechaInicio, fechaFin, motivo } = req.body;

  if (!dpi || !tipo || !fechaInicio || !motivo) {
    return res.status(400).json({
      message:
        "Faltan datos obligatorios (dpi, tipo, fechaInicio, motivo).",
    });
  }

  try {
    // 1. Buscar empleado por DPI
    const empResult = await pool
      .request()
      .input("dpi", dpi)
      .query(`
        SELECT id_empleado
        FROM Empleados
        WHERE dpi = @dpi;
      `);

    if (empResult.recordset.length === 0) {
      return res.status(400).json({
        message: "No se encontró un empleado con ese DPI.",
      });
    }

    const id_empleado = empResult.recordset[0].id_empleado;
    const hoy = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const fechaFinReal = fechaFin || fechaInicio;

    // 2. Insertar permiso
    const insertResult = await pool
      .request()
      .input("id_empleado", id_empleado)
      .input("tipo", tipo)
      .input("fecha_inicio", fechaInicio)
      .input("fecha_fin", fechaFinReal)
      .input("motivo", motivo)
      .input("fecha_solicitud", hoy)
      .input("estado", "Pendiente")
      .query(`
        INSERT INTO Permisos (
          id_empleado,
          tipo,
          fecha_inicio,
          fecha_fin,
          motivo,
          fecha_solicitud,
          estado,
          archivo_firmado
        )
        VALUES (
          @id_empleado,
          @tipo,
          @fecha_inicio,
          @fecha_fin,
          @motivo,
          @fecha_solicitud,
          @estado,
          NULL
        );
        SELECT SCOPE_IDENTITY() AS id_permiso;
      `);

    const id_permiso = insertResult.recordset[0].id_permiso;

    res.status(201).json({
      message: "Permiso creado correctamente.",
      id_permiso,
    });
  } catch (error) {
    console.error("Error al crear permiso:", error);
    res.status(500).json({ message: "Error al crear permiso" });
  }
});

/* ===========================================================
   PUT /api/permisos/:id
   Actualizar estado (Aprobado / Rechazado / Pendiente)
   Body: { estado }
=========================================================== */
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
      return res.status(400).json({ message: "id_permiso inválido" });
    }

    await pool
      .request()
      .input("id_permiso", idInt)
      .input("estado", estado)
      .query(`
        UPDATE Permisos
        SET estado = @estado
        WHERE id_permiso = @id_permiso;
      `);

    res.json({ message: "Permiso actualizado correctamente." });
  } catch (error) {
    console.error("Error al actualizar permiso:", error);
    res.status(500).json({ message: "Error al actualizar permiso" });
  }
});

/* ===========================================================
   HANDLER COMÚN PARA SUBIR ARCHIVO FIRMADO
=========================================================== */
async function handleUploadFirmado(req, res) {
  const { id } = req.params;

  try {
    const idInt = parseInt(id, 10);
    if (!Number.isInteger(idInt)) {
      return res.status(400).json({ message: "id_permiso inválido" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No se recibió ningún archivo." });
    }

    const nombreArchivo = req.file.filename;

    await pool
      .request()
      .input("id_permiso", idInt)
      .input("archivo_firmado", nombreArchivo)
      .query(`
        UPDATE Permisos
        SET archivo_firmado = @archivo_firmado
        WHERE id_permiso = @id_permiso;
      `);

    res.json({
      message: "Archivo firmado cargado correctamente.",
      archivo_firmado: nombreArchivo,
    });
  } catch (error) {
    console.error("Error al subir archivo firmado:", error);
    res
      .status(500)
      .json({ message: "Error al subir archivo firmado" });
  }
}

/* ===========================================================
   POST /api/permisos/:id/firmado
   POST /api/permisos/:id/upload   👈 alias para tu front
   Campo file: "archivo"
=========================================================== */
router.post(
  "/:id/firmado",
  uploadFirmado.single("archivo"),
  handleUploadFirmado
);

router.post(
  "/:id/upload",
  uploadFirmado.single("archivo"),
  handleUploadFirmado
);

module.exports = router;
