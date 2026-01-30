const express = require("express");
const { pool, sql } = require("../db");

const router = express.Router();

/* ======================================================
   LISTAR RENGLONES (con conteo de empleados)
====================================================== */
router.get("/", async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT 
        r.id_renglon,
        r.codigo,
        r.nombre,
        r.descripcion,
        r.activo,
        COUNT(e.id_empleado) AS empleadosAsignados
      FROM Renglones r
      LEFT JOIN Empleados e 
        ON e.id_renglon = r.id_renglon 
       AND e.estado = 'ACTIVO'
      WHERE r.activo = 1
      GROUP BY 
        r.id_renglon, r.codigo, r.nombre, r.descripcion, r.activo
      ORDER BY r.codigo
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error("Error renglones:", error);
    res.status(500).json({ message: "Error al obtener renglones" });
  }
});

/* ======================================================
   CREAR RENGLÓN
====================================================== */
router.post("/", async (req, res) => {
  const { codigo, nombre, descripcion } = req.body;

  if (!codigo || !nombre) {
    return res.status(400).json({
      message: "Código y nombre son obligatorios",
    });
  }

  try {
    const result = await pool
      .request()
      .input("codigo", sql.VarChar(10), codigo)
      .input("nombre", sql.NVarChar(100), nombre)
      .input("descripcion", sql.NVarChar(255), descripcion || null)
      .query(`
        INSERT INTO Renglones (codigo, nombre, descripcion, activo)
        VALUES (@codigo, @nombre, @descripcion, 1);

        SELECT SCOPE_IDENTITY() AS id_renglon;
      `);

    res.status(201).json({
      id_renglon: result.recordset[0].id_renglon,
      codigo,
      nombre,
      descripcion,
      empleadosAsignados: 0,
    });
  } catch (error) {
    console.error("Error crear renglón:", error);
    res.status(500).json({ message: "Error al crear renglón" });
  }
});

/* ======================================================
   EDITAR RENGLÓN
====================================================== */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { codigo, nombre, descripcion } = req.body;

  try {
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("codigo", sql.VarChar(10), codigo)
      .input("nombre", sql.NVarChar(100), nombre)
      .input("descripcion", sql.NVarChar(255), descripcion || null)
      .query(`
        UPDATE Renglones
        SET codigo = @codigo,
            nombre = @nombre,
            descripcion = @descripcion
        WHERE id_renglon = @id
      `);

    res.json({ message: "Renglón actualizado" });
  } catch (error) {
    console.error("Error editar renglón:", error);
    res.status(500).json({ message: "Error al editar renglón" });
  }
});

/* ======================================================
   ELIMINAR RENGLÓN (BORRADO FÍSICO)
====================================================== */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const request = pool.request();
    request.input("id_renglon", sql.Int, id);

    // 1. Verificar si tiene empleados
    const empleadosResult = await request.query(`
      SELECT COUNT(*) AS total
      FROM Empleados
      WHERE id_renglon = @id_renglon;
    `);

    const totalEmpleados = empleadosResult.recordset[0].total;

    if (totalEmpleados > 0) {
      return res.status(400).json({
        message:
          "No se puede eliminar el renglón porque tiene empleados asignados. " +
          "Primero reasigna o da de baja esos empleados.",
      });
    }

    // 2. Borrar físicamente el renglón
    await pool
      .request()
      .input("id_renglon", sql.Int, id)
      .query(`
        DELETE FROM Renglones
        WHERE id_renglon = @id_renglon;
      `);

    res.json({ message: "Renglón eliminado definitivamente." });
  } catch (error) {
    console.error("Error al eliminar renglón:", error);
    res.status(500).json({ message: "Error al eliminar renglón" });
  }
});

/* ======================================================
   EMPLEADOS POR RENGLÓN
====================================================== */
router.get("/:id/empleados", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool
      .request()
      .input("id_renglon", sql.Int, id)
      .query(`
        SELECT
          e.id_empleado,
          e.codigo_empleado AS codigo,
          CONCAT(e.nombres,' ',e.apellidos) AS nombre,
          e.dpi,
          p.nombre AS puesto,
          d.nombre AS departamento,
          e.salario_base AS salarioBase,
          e.estado
        FROM Empleados e
        INNER JOIN Puestos p ON p.id_puesto = e.id_puesto
        INNER JOIN Departamentos d ON d.id_departamento = e.id_departamento
        WHERE e.id_renglon = @id_renglon
          AND e.estado = 'ACTIVO'
        ORDER BY e.codigo_empleado
      `);

    res.json(result.recordset);
  } catch (error) {
    console.error("Error empleados por renglón:", error);
    res.status(500).json({ message: "Error al obtener empleados" });
  }
});

module.exports = router;
