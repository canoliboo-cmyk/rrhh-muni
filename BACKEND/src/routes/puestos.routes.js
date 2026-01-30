const express = require("express");
const { pool, sql } = require("../db");

const router = express.Router();

// 🔹 Listar puestos
router.get("/", async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT id_puesto, nombre
      FROM Puestos
      ORDER BY nombre;
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error("Error puestos:", error);
    res.status(500).json({ message: "Error al obtener puestos" });
  }
});

// 🔹 Crear puesto
router.post("/", async (req, res) => {
  const { nombre } = req.body;

  if (!nombre || !nombre.trim()) {
    return res
      .status(400)
      .json({ message: "El nombre del puesto es obligatorio" });
  }

  try {
    const request = pool.request();
    request.input("nombre", sql.NVarChar(100), nombre.trim());

    const result = await request.query(`
      INSERT INTO Puestos (nombre)
      VALUES (@nombre);

      SELECT SCOPE_IDENTITY() AS id_puesto;
    `);

    const newId = result.recordset[0].id_puesto;

    res.status(201).json({
      id_puesto: newId,
      nombre: nombre.trim(),
    });
  } catch (error) {
    console.error("Error creando puesto:", error);
    res.status(500).json({ message: "Error al crear puesto" });
  }
});

module.exports = router;
