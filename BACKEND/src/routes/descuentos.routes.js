const express = require("express");
const { pool } = require("../db");

const router = express.Router();

/* ============================================
   LISTAR DESCUENTOS
   GET /api/descuentos
============================================ */
router.get("/", async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT
        id_descuento          AS id,
        nombre,
        tipo,
        monto_porcentaje      AS valor,
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
        END                   AS destino
      FROM descuentos
      ORDER BY nombre;
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error("Error descuentos (GET):", error);
    res.status(500).json({ message: "Error al obtener descuentos" });
  }
});

/* ============================================
   CREAR DESCUENTO
   POST /api/descuentos
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
      INSERT INTO descuentos
        (nombre, tipo, monto_porcentaje, descripcion,
         aplica_a_todos, aplica_por_renglon, aplica_individual, activo)
      VALUES
        (@nombre, @tipo, @monto_porcentaje, @descripcion,
         @aplica_a_todos, @aplica_por_renglon, @aplica_individual, 1);

      SELECT
        id_descuento          AS id,
        nombre,
        tipo,
        monto_porcentaje      AS valor,
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
        END                   AS destino
      FROM descuentos
      WHERE id_descuento = SCOPE_IDENTITY();
    `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error("Error descuentos (POST):", error);
    res.status(500).json({ message: "Error al crear descuento" });
  }
});

/* ============================================
   EDITAR DESCUENTO
   PUT /api/descuentos/:id
============================================ */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const idInt = parseInt(id, 10);

    if (!Number.isInteger(idInt)) {
      return res.status(400).json({ message: "id_descuento inválido" });
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
    request.input("id_descuento", idInt);
    request.input("nombre", nombre);
    request.input("tipo", tipo);
    request.input("monto_porcentaje", valorNum);
    request.input("descripcion", descripcion || null);
    request.input("aplica_a_todos", aplica_a_todos);
    request.input("aplica_por_renglon", aplica_por_renglon);
    request.input("aplica_individual", aplica_individual);
    request.input("activo", activoBit);

    await request.query(`
      UPDATE descuentos
      SET
        nombre = @nombre,
        tipo = @tipo,
        monto_porcentaje = @monto_porcentaje,
        descripcion = @descripcion,
        aplica_a_todos = @aplica_a_todos,
        aplica_por_renglon = @aplica_por_renglon,
        aplica_individual = @aplica_individual,
        activo = @activo
      WHERE id_descuento = @id_descuento;
    `);

    res.json({ message: "Descuento actualizado correctamente" });
  } catch (error) {
    console.error("Error descuentos (PUT):", error);
    res.status(500).json({ message: "Error al actualizar descuento" });
  }
});

/* ============================================
   CAMBIAR ESTADO ACTIVO
   PATCH /api/descuentos/:id/activo
============================================ */
router.patch("/:id/activo", async (req, res) => {
  try {
    const { id } = req.params;
    const idInt = parseInt(id, 10);

    if (!Number.isInteger(idInt)) {
      return res.status(400).json({ message: "id_descuento inválido" });
    }

    const { activo } = req.body;
    const activoBit =
      typeof activo === "boolean" ? (activo ? 1 : 0) : activo ? 1 : 0;

    const request = pool.request();
    request.input("id_descuento", idInt);
    request.input("activo", activoBit);

    await request.query(`
      UPDATE descuentos
      SET activo = @activo
      WHERE id_descuento = @id_descuento;
    `);

    res.json({ message: "Estado de descuento actualizado" });
  } catch (error) {
    console.error("Error descuentos (PATCH activo):", error);
    res.status(500).json({ message: "Error al cambiar estado" });
  }
});

/* ============================================
   ELIMINAR DESCUENTO (y sus asignaciones)
   DELETE /api/descuentos/:id
============================================ */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const idInt = parseInt(id, 10);

    if (!Number.isInteger(idInt)) {
      return res.status(400).json({ message: "id_descuento inválido" });
    }

    const request = pool.request();
    request.input("id_descuento", idInt);

    await request.query(`
      DELETE FROM DescuentosEmpleados
      WHERE id_descuento = @id_descuento;

      DELETE FROM DescuentosRenglones
      WHERE id_descuento = @id_descuento;

      DELETE FROM descuentos
      WHERE id_descuento = @id_descuento;
    `);

    res.json({ message: "Descuento eliminado correctamente" });
  } catch (error) {
    console.error("Error descuentos (DELETE):", error);
    res.status(500).json({ message: "Error al eliminar descuento" });
  }
});

/* ============================================
   ASIGNACIÓN POR RENGLÓN
   GET /api/descuentos/:id/renglones
   POST /api/descuentos/:id/renglones
============================================ */
router.get("/:id/renglones", async (req, res) => {
  try {
    const idInt = parseInt(req.params.id, 10);
    if (!Number.isInteger(idInt)) {
      return res.status(400).json({ message: "id_descuento inválido" });
    }

    const result = await pool
      .request()
      .input("id_descuento", idInt)
      .query(`
        SELECT id_renglon
        FROM DescuentosRenglones
        WHERE id_descuento = @id_descuento;
      `);

    const ids = result.recordset.map((r) => r.id_renglon);
    res.json(ids);
  } catch (error) {
    console.error("Error GET renglones descuento:", error);
    res.status(500).json({ message: "Error al obtener renglones del descuento" });
  }
});

router.post("/:id/renglones", async (req, res) => {
  try {
    const idInt = parseInt(req.params.id, 10);
    if (!Number.isInteger(idInt)) {
      return res.status(400).json({ message: "id_descuento inválido" });
    }

    const { idsRenglones } = req.body;
    const ids = Array.isArray(idsRenglones)
      ? idsRenglones
          .map((n) => parseInt(n, 10))
          .filter((n) => Number.isInteger(n))
      : [];

    const requestDelete = pool.request();
    requestDelete.input("id_descuento", idInt);
    await requestDelete.query(`
      DELETE FROM DescuentosRenglones
      WHERE id_descuento = @id_descuento;
    `);

    if (ids.length > 0) {
      const values = ids
        .map((idR) => `(${idInt}, ${idR})`)
        .join(", ");

      await pool.request().query(`
        INSERT INTO DescuentosRenglones (id_descuento, id_renglon)
        VALUES ${values};
      `);
    }

    res.json({ message: "Renglones asignados correctamente al descuento" });
  } catch (error) {
    console.error("Error POST renglones descuento:", error);
    res.status(500).json({ message: "Error al asignar renglones" });
  }
});

/* ============================================
   ASIGNACIÓN A EMPLEADOS
   GET /api/descuentos/:id/empleados
   POST /api/descuentos/:id/empleados
============================================ */
router.get("/:id/empleados", async (req, res) => {
  try {
    const idInt = parseInt(req.params.id, 10);
    if (!Number.isInteger(idInt)) {
      return res.status(400).json({ message: "id_descuento inválido" });
    }

    const result = await pool
      .request()
      .input("id_descuento", idInt)
      .query(`
        SELECT
          de.id_empleado,
          e.codigo_empleado,
          CONCAT(e.nombres,' ',e.apellidos) AS nombre,
          e.dpi,
          r.codigo AS renglon
        FROM DescuentosEmpleados de
        INNER JOIN Empleados e ON e.id_empleado = de.id_empleado
        INNER JOIN Renglones r ON r.id_renglon = e.id_renglon
        WHERE de.id_descuento = @id_descuento;
      `);

    res.json(result.recordset);
  } catch (error) {
    console.error("Error GET empleados descuento:", error);
    res.status(500).json({ message: "Error al obtener empleados del descuento" });
  }
});

router.post("/:id/empleados", async (req, res) => {
  try {
    const idInt = parseInt(req.params.id, 10);
    if (!Number.isInteger(idInt)) {
      return res.status(400).json({ message: "id_descuento inválido" });
    }

    const { idsEmpleados } = req.body;
    const ids = Array.isArray(idsEmpleados)
      ? idsEmpleados
          .map((n) => parseInt(n, 10))
          .filter((n) => Number.isInteger(n))
      : [];

    const requestDelete = pool.request();
    requestDelete.input("id_descuento", idInt);
    await requestDelete.query(`
      DELETE FROM DescuentosEmpleados
      WHERE id_descuento = @id_descuento;
    `);

    if (ids.length > 0) {
      const values = ids
        .map((idE) => `(${idInt}, ${idE})`)
        .join(", ");

      await pool.request().query(`
        INSERT INTO DescuentosEmpleados (id_descuento, id_empleado)
        VALUES ${values};
      `);
    }

    res.json({ message: "Empleados asignados correctamente al descuento" });
  } catch (error) {
    console.error("Error POST empleados descuento:", error);
    res.status(500).json({ message: "Error al asignar empleados" });
  }
});

module.exports = router;
