const express = require("express");
const { pool, sql } = require("../db");

const router = express.Router();

// 🔹 Listar departamentos
router.get("/", async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT id_departamento, nombre
      FROM Departamentos
      ORDER BY nombre;
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error("Error departamentos:", error);
    res.status(500).json({ message: "Error al obtener departamentos" });
  }
});

// 🔹 Crear departamento
router.post("/", async (req, res) => {
  const { nombre } = req.body;

  if (!nombre || !nombre.trim()) {
    return res
      .status(400)
      .json({ message: "El nombre del departamento es obligatorio" });
  }

  try {
    const request = pool.request();
    request.input("nombre", sql.NVarChar(100), nombre.trim());

    const result = await request.query(`
      INSERT INTO Departamentos (nombre)
      VALUES (@nombre);

      SELECT SCOPE_IDENTITY() AS id_departamento;
    `);

    const newId = result.recordset[0].id_departamento;

    res.status(201).json({
      id_departamento: newId,
      nombre: nombre.trim(),
    });
  } catch (error) {
    console.error("Error creando departamento:", error);
    res.status(500).json({ message: "Error al crear departamento" });
  }
});

module.exports = router;
