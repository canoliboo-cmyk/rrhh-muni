const express = require("express");
const { pool } = require("../db");

const router = express.Router();

/* ============================================
   LISTAR BONIFICACIONES
============================================ */
router.get("/", async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT
        id_bonificacion        AS id,
        nombre,
        tipo,
        monto_porcentaje       AS valor,
        descripcion,
        aplica_a_todos,
        aplica_por_renglon,
        aplica_individual,
        activo,
        CASE
          WHEN aplica_a_todos = 1 THEN 'todos'
          WHEN aplica_por_renglon = 1 THEN 'renglon'
          WHEN aplica_individual = 1 THEN 'individual'
          ELSE 'otros'
        END                    AS destino
      FROM Bonificaciones
      ORDER BY nombre;
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error("Error bonificaciones (GET):", error);
    res.status(500).json({ message: "Error al obtener bonificaciones" });
  }
});

/* ============================================
   CREAR BONIFICACIÓN
============================================ */
router.post("/", async (req, res) => {
  try {
    const { nombre, tipo, valor, descripcion, destino } = req.body;

    if (!nombre || !tipo || !valor || !destino) {
      return res.status(400).json({
        message: "Nombre, tipo, valor y destino son obligatorios",
      });
    }

    const valorNum = parseFloat(valor);
    if (isNaN(valorNum) || valorNum <= 0) {
      return res
        .status(400)
        .json({ message: "El valor debe ser un número mayor a 0" });
    }

    let aplica_a_todos = 0;
    let aplica_por_renglon = 0;
    let aplica_individual = 0;

    if (destino === "todos") aplica_a_todos = 1;
    else if (destino === "renglon") aplica_por_renglon = 1;
    else if (destino === "individual") aplica_individual = 1;

    const request = pool.request();
    request.input("nombre", nombre);
    request.input("tipo", tipo);
    request.input("monto_porcentaje", valorNum);
    request.input("descripcion", descripcion || null);
    request.input("aplica_a_todos", aplica_a_todos);
    request.input("aplica_por_renglon", aplica_por_renglon);
    request.input("aplica_individual", aplica_individual);

    const result = await request.query(`
      INSERT INTO Bonificaciones
        (nombre, tipo, monto_porcentaje, descripcion,
         aplica_a_todos, aplica_por_renglon, aplica_individual, activo)
      VALUES
        (@nombre, @tipo, @monto_porcentaje, @descripcion,
         @aplica_a_todos, @aplica_por_renglon, @aplica_individual, 1);

      SELECT
        id_bonificacion        AS id,
        nombre,
        tipo,
        monto_porcentaje       AS valor,
        descripcion,
        aplica_a_todos,
        aplica_por_renglon,
        aplica_individual,
        activo,
        CASE
          WHEN aplica_a_todos = 1 THEN 'todos'
          WHEN aplica_por_renglon = 1 THEN 'renglon'
          WHEN aplica_individual = 1 THEN 'individual'
          ELSE 'otros'
        END                    AS destino
      FROM Bonificaciones
      WHERE id_bonificacion = SCOPE_IDENTITY();
    `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error("Error bonificaciones (POST):", error);
    res.status(500).json({ message: "Error al crear bonificación" });
  }
});

/* ============================================
   EDITAR BONIFICACIÓN
============================================ */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const idInt = parseInt(id, 10);

    if (!Number.isInteger(idInt)) {
      return res.status(400).json({ message: "id_bonificacion inválido" });
    }

    const { nombre, tipo, valor, descripcion, destino, activo } = req.body;

    if (!nombre || !tipo || !valor || !destino) {
      return res.status(400).json({
        message: "Nombre, tipo, valor y destino son obligatorios",
      });
    }

    const valorNum = parseFloat(valor);
    if (isNaN(valorNum) || valorNum <= 0) {
      return res
        .status(400)
        .json({ message: "El valor debe ser un número mayor a 0" });
    }

    const activoBit =
      typeof activo === "boolean" ? (activo ? 1 : 0) : activo ? 1 : 0;

    let aplica_a_todos = 0;
    let aplica_por_renglon = 0;
    let aplica_individual = 0;

    if (destino === "todos") aplica_a_todos = 1;
    else if (destino === "renglon") aplica_por_renglon = 1;
    else if (destino === "individual") aplica_individual = 1;

    const request = pool.request();
    request.input("id_bonificacion", idInt);
    request.input("nombre", nombre);
    request.input("tipo", tipo);
    request.input("monto_porcentaje", valorNum);
    request.input("descripcion", descripcion || null);
    request.input("aplica_a_todos", aplica_a_todos);
    request.input("aplica_por_renglon", aplica_por_renglon);
    request.input("aplica_individual", aplica_individual);
    request.input("activo", activoBit);

    await request.query(`
      UPDATE Bonificaciones
      SET
        nombre = @nombre,
        tipo = @tipo,
        monto_porcentaje = @monto_porcentaje,
        descripcion = @descripcion,
        aplica_a_todos = @aplica_a_todos,
        aplica_por_renglon = @aplica_por_renglon,
        aplica_individual = @aplica_individual,
        activo = @activo
      WHERE id_bonificacion = @id_bonificacion;
    `);

    res.json({ message: "Bonificación actualizada correctamente" });
  } catch (error) {
    console.error("Error bonificaciones (PUT):", error);
    res.status(500).json({ message: "Error al actualizar bonificación" });
  }
});

/* ============================================
   CAMBIAR ESTADO ACTIVO
============================================ */
router.patch("/:id/activo", async (req, res) => {
  try {
    const { id } = req.params;
    const idInt = parseInt(id, 10);

    if (!Number.isInteger(idInt)) {
      return res.status(400).json({ message: "id_bonificacion inválido" });
    }

    const { activo } = req.body;
    const activoBit =
      typeof activo === "boolean" ? (activo ? 1 : 0) : activo ? 1 : 0;

    const request = pool.request();
    request.input("id_bonificacion", idInt);
    request.input("activo", activoBit);

    await request.query(`
      UPDATE Bonificaciones
      SET activo = @activo
      WHERE id_bonificacion = @id_bonificacion;
    `);

    res.json({ message: "Estado de bonificación actualizado" });
  } catch (error) {
    console.error("Error bonificaciones (PATCH activo):", error);
    res.status(500).json({ message: "Error al cambiar estado" });
  }
});

/* ============================================
   ELIMINAR BONIFICACIÓN
============================================ */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const idInt = parseInt(id, 10);

    if (!Number.isInteger(idInt)) {
      return res.status(400).json({ message: "id_bonificacion inválido" });
    }

    const request = pool.request();
    request.input("id_bonificacion", idInt);

    // primero eliminar asignaciones
    await request.query(`
      DELETE FROM BonificacionesEmpleados
      WHERE id_bonificacion = @id_bonificacion;

      DELETE FROM BonificacionesRenglones
      WHERE id_bonificacion = @id_bonificacion;

      DELETE FROM Bonificaciones
      WHERE id_bonificacion = @id_bonificacion;
    `);

    res.json({ message: "Bonificación eliminada correctamente" });
  } catch (error) {
    console.error("Error bonificaciones (DELETE):", error);
    res.status(500).json({ message: "Error al eliminar bonificación" });
  }
});

/* ============================================
   ASIGNACIONES POR RENGLÓN
   GET: ids de renglones asignados
   POST: reemplaza la lista de renglones
============================================ */
router.get("/:id/renglones", async (req, res) => {
  try {
    const idInt = parseInt(req.params.id, 10);
    if (!Number.isInteger(idInt)) {
      return res.status(400).json({ message: "id_bonificacion inválido" });
    }

    const result = await pool
      .request()
      .input("id_bonificacion", idInt)
      .query(`
        SELECT id_renglon
        FROM BonificacionesRenglones
        WHERE id_bonificacion = @id_bonificacion;
      `);

    const ids = result.recordset.map((r) => r.id_renglon);
    res.json(ids);
  } catch (error) {
    console.error("Error GET renglones bono:", error);
    res.status(500).json({ message: "Error al obtener renglones del bono" });
  }
});

router.post("/:id/renglones", async (req, res) => {
  try {
    const idInt = parseInt(req.params.id, 10);
    if (!Number.isInteger(idInt)) {
      return res.status(400).json({ message: "id_bonificacion inválido" });
    }

    const { idsRenglones } = req.body;
    const ids = Array.isArray(idsRenglones)
      ? idsRenglones
          .map((n) => parseInt(n, 10))
          .filter((n) => Number.isInteger(n))
      : [];

    const requestDelete = pool.request();
    requestDelete.input("id_bonificacion", idInt);
    await requestDelete.query(`
      DELETE FROM BonificacionesRenglones
      WHERE id_bonificacion = @id_bonificacion;
    `);

    if (ids.length > 0) {
      const values = ids
        .map((idR) => `(${idInt}, ${idR})`)
        .join(", ");

      await pool.request().query(`
        INSERT INTO BonificacionesRenglones (id_bonificacion, id_renglon)
        VALUES ${values};
      `);
    }

    res.json({ message: "Renglones asignados correctamente" });
  } catch (error) {
    console.error("Error POST renglones bono:", error);
    res.status(500).json({ message: "Error al asignar renglones" });
  }
});

/* ============================================
   ASIGNACIONES INDIVIDUALES (EMPLEADOS)
============================================ */
router.get("/:id/empleados", async (req, res) => {
  try {
    const idInt = parseInt(req.params.id, 10);
    if (!Number.isInteger(idInt)) {
      return res.status(400).json({ message: "id_bonificacion inválido" });
    }

    const result = await pool
      .request()
      .input("id_bonificacion", idInt)
      .query(`
        SELECT
          be.id_empleado,
          e.codigo_empleado,
          CONCAT(e.nombres,' ',e.apellidos) AS nombre,
          e.dpi,
          r.codigo AS renglon
        FROM BonificacionesEmpleados be
        INNER JOIN Empleados e ON e.id_empleado = be.id_empleado
        INNER JOIN Renglones r ON r.id_renglon = e.id_renglon
        WHERE be.id_bonificacion = @id_bonificacion;
      `);

    res.json(result.recordset);
  } catch (error) {
    console.error("Error GET empleados bono:", error);
    res.status(500).json({ message: "Error al obtener empleados del bono" });
  }
});

router.post("/:id/empleados", async (req, res) => {
  try {
    const idInt = parseInt(req.params.id, 10);
    if (!Number.isInteger(idInt)) {
      return res.status(400).json({ message: "id_bonificacion inválido" });
    }

    const { idsEmpleados } = req.body;
    const ids = Array.isArray(idsEmpleados)
      ? idsEmpleados
          .map((n) => parseInt(n, 10))
          .filter((n) => Number.isInteger(n))
      : [];

    const requestDelete = pool.request();
    requestDelete.input("id_bonificacion", idInt);
    await requestDelete.query(`
      DELETE FROM BonificacionesEmpleados
      WHERE id_bonificacion = @id_bonificacion;
    `);

    if (ids.length > 0) {
      const values = ids
        .map((idE) => `(${idInt}, ${idE})`)
        .join(", ");

      await pool.request().query(`
        INSERT INTO BonificacionesEmpleados (id_bonificacion, id_empleado)
        VALUES ${values};
      `);
    }

    res.json({ message: "Empleados asignados correctamente" });
  } catch (error) {
    console.error("Error POST empleados bono:", error);
    res.status(500).json({ message: "Error al asignar empleados" });
  }
});

module.exports = router;
