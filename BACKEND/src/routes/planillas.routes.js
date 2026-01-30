// src/routes/planillas.routes.js
const express = require("express");
const { pool } = require("../db");

const router = express.Router();

/* ===========================================================
   Helpers
=========================================================== */

// Devuelve los empleados del renglón (o todos) con su salario base
async function obtenerEmpleadosParaPlanilla(mes, anio, id_renglon) {
  const request = pool.request();

  if (id_renglon && id_renglon !== "todos") {
    request.input("id_renglon", parseInt(id_renglon, 10));
  }

  const whereRenglon =
    !id_renglon || id_renglon === "todos"
      ? ""
      : "WHERE e.id_renglon = @id_renglon";

  const result = await request.query(`
    SELECT
      e.id_empleado,
      e.codigo_empleado,
      CONCAT(e.nombres, ' ', e.apellidos) AS nombre,
      e.dpi,
      e.id_renglon,
      r.codigo AS renglon,
      e.salario_base
    FROM Empleados e
    INNER JOIN Renglones r ON r.id_renglon = e.id_renglon
    ${whereRenglon}
    ORDER BY e.codigo_empleado;
  `);

  return result.recordset;
}

// Calcula bonificaciones aplicadas a un empleado dado su salario base
async function calcularBonificacionesEmpleado(id_empleado, id_renglon, salarioBase) {
  const request = pool.request();
  request.input("id_empleado", id_empleado);
  request.input("id_renglon", id_renglon);

  const result = await request.query(`
    SELECT DISTINCT
      b.id_bonificacion,
      b.nombre,
      b.tipo,
      b.monto_porcentaje
    FROM Bonificaciones b
    LEFT JOIN BonificacionesRenglones br
      ON br.id_bonificacion = b.id_bonificacion
     AND br.id_renglon = @id_renglon
    LEFT JOIN BonificacionesEmpleados be
      ON be.id_bonificacion = b.id_bonificacion
     AND be.id_empleado = @id_empleado
    WHERE b.activo = 1
      AND (
           b.aplica_a_todos = 1
        OR br.id_bonificacion_renglon IS NOT NULL
        OR be.id_bonificacion_empleado IS NOT NULL
      );
  `);

  const bonos = [];
  let total = 0;

  for (const row of result.recordset) {
    let monto = 0;
    if (row.tipo === "MONTO") {
      monto = Number(row.monto_porcentaje);
    } else {
      // PORCENTAJE
      monto = (Number(salarioBase) * Number(row.monto_porcentaje)) / 100;
    }
    monto = Number(monto.toFixed(2));
    total += monto;

    bonos.push({
      id_bonificacion: row.id_bonificacion,
      nombre: row.nombre,
      tipo: row.tipo,
      porcentaje_o_monto: Number(row.monto_porcentaje),
      monto,
    });
  }

  return { bonos, total: Number(total.toFixed(2)) };
}

// Calcula descuentos aplicados a un empleado
async function calcularDescuentosEmpleado(id_empleado, id_renglon, salarioBase) {
  const request = pool.request();
  request.input("id_empleado", id_empleado);
  request.input("id_renglon", id_renglon);

  const result = await request.query(`
    SELECT DISTINCT
      d.id_descuento,
      d.nombre,
      d.tipo,
      d.monto_porcentaje
    FROM Descuentos d
    LEFT JOIN DescuentosRenglones dr
      ON dr.id_descuento = d.id_descuento
     AND dr.id_renglon = @id_renglon
    LEFT JOIN DescuentosEmpleados de
      ON de.id_descuento = d.id_descuento
     AND de.id_empleado = @id_empleado
    WHERE d.activo = 1
      AND (
           d.aplica_a_todos = 1
        OR dr.id_descuento_renglon IS NOT NULL
        OR de.id_descuento_empleado IS NOT NULL
      );
  `);

  const descuentos = [];
  let total = 0;

  for (const row of result.recordset) {
    let monto = 0;
    if (row.tipo === "MONTO") {
      monto = Number(row.monto_porcentaje);
    } else {
      // PORCENTAJE
      monto = (Number(salarioBase) * Number(row.monto_porcentaje)) / 100;
    }
    monto = Number(monto.toFixed(2));
    total += monto;

    descuentos.push({
      id_descuento: row.id_descuento,
      nombre: row.nombre,
      tipo: row.tipo,
      porcentaje_o_monto: Number(row.monto_porcentaje),
      monto,
    });
  }

  return { descuentos, total: Number(total.toFixed(2)) };
}

/* ===========================================================
   POST /api/planillas/calcular
=========================================================== */
router.post("/calcular", async (req, res) => {
  const { mes, anio, id_renglon } = req.body;

  try {
    const mesInt = parseInt(mes, 10);
    const anioInt = parseInt(anio, 10);
    const idRenglonInt =
      !id_renglon || id_renglon === "todos"
        ? null
        : parseInt(id_renglon, 10);

    // 1. Empleados a procesar
    const empleados = await obtenerEmpleadosParaPlanilla(
      mesInt,
      anioInt,
      idRenglonInt
    );

    if (empleados.length === 0) {
      return res
        .status(400)
        .json({ message: "No hay empleados para generar la planilla." });
    }

    // 2. Calcular planilla en memoria
    const detalleCalculado = [];
    let totalEmpleados = 0;
    let totalMontoPlanilla = 0;

    for (const emp of empleados) {
      const salarioBase = Number(emp.salario_base);
      const idRenglonEmpleado = idRenglonInt ?? emp.id_renglon;

      const { bonos, total: totalBonos } =
        await calcularBonificacionesEmpleado(
          emp.id_empleado,
          idRenglonEmpleado,
          salarioBase
        );

      const { descuentos, total: totalDescuentos } =
        await calcularDescuentosEmpleado(
          emp.id_empleado,
          idRenglonEmpleado,
          salarioBase
        );

      const salarioBruto = Number((salarioBase + totalBonos).toFixed(2));
      const salarioNeto = Number(
        (salarioBruto - totalDescuentos).toFixed(2)
      );

      totalEmpleados += 1;
      totalMontoPlanilla += salarioNeto;

      detalleCalculado.push({
        id_empleado: emp.id_empleado,
        codigo_empleado: emp.codigo_empleado,
        nombre: emp.nombre,
        dpi: emp.dpi,
        renglon: emp.renglon,
        salarioBase,
        totalBonos,
        totalDescuentos,
        salarioBruto,
        salarioNeto,
        bonos,
        descuentos,
      });
    }

    totalMontoPlanilla = Number(totalMontoPlanilla.toFixed(2));

    // 3. Guardar encabezado
    const conn = pool.request();
    conn.input("mes", mesInt);
    conn.input("anio", anioInt);
    conn.input("id_renglon", idRenglonInt);
    conn.input(
      "descripcion",
      idRenglonInt
        ? `Planilla renglón ${idRenglonInt} ${mesInt}/${anioInt}`
        : `Planilla general ${mesInt}/${anioInt}`
    );
    conn.input("total_empleados", totalEmpleados);
    conn.input("total_monto", totalMontoPlanilla);
    conn.input("estado", "GENERADA");

    const headerResult = await conn.query(`
      INSERT INTO Planillas (
        mes, anio, id_renglon, descripcion,
        total_empleados, total_monto, estado
      )
      VALUES (
        @mes, @anio, @id_renglon, @descripcion,
        @total_empleados, @total_monto, @estado
      );
      SELECT SCOPE_IDENTITY() AS id_planilla;
    `);

    const id_planilla = headerResult.recordset[0].id_planilla;

    // 4. Guardar detalle + desglose bonos/descuentos
    for (const d of detalleCalculado) {
      const reqDetalle = pool.request();
      reqDetalle.input("id_planilla", id_planilla);
      reqDetalle.input("id_empleado", d.id_empleado);
      reqDetalle.input("salario_base", d.salarioBase);
      reqDetalle.input("total_bonificaciones", d.totalBonos);
      reqDetalle.input("total_descuentos", d.totalDescuentos);
      reqDetalle.input("salario_bruto", d.salarioBruto);
      reqDetalle.input("salario_neto", d.salarioNeto);

      const detResult = await reqDetalle.query(`
        INSERT INTO PlanillaDetalle (
          id_planilla, id_empleado,
          salario_base, total_bonificaciones,
          total_descuentos, salario_bruto, salario_neto
        )
        VALUES (
          @id_planilla, @id_empleado,
          @salario_base, @total_bonificaciones,
          @total_descuentos, @salario_bruto, @salario_neto
        );
        SELECT SCOPE_IDENTITY() AS id_planilla_detalle;
      `);

      const id_planilla_detalle =
        detResult.recordset[0].id_planilla_detalle;

      // Bonificaciones detalle
      for (const b of d.bonos) {
        const reqBono = pool.request();
        reqBono.input("id_planilla_detalle", id_planilla_detalle);
        reqBono.input("id_bonificacion", b.id_bonificacion);
        reqBono.input("nombre_bonificacion", b.nombre);
        reqBono.input("monto", b.monto);
        await reqBono.query(`
          INSERT INTO PlanillaDetalleBonificaciones (
            id_planilla_detalle, id_bonificacion,
            nombre_bonificacion, monto
          )
          VALUES (
            @id_planilla_detalle, @id_bonificacion,
            @nombre_bonificacion, @monto
          );
        `);
      }

      // Descuentos detalle
      for (const desc of d.descuentos) {
        const reqDesc = pool.request();
        reqDesc.input("id_planilla_detalle", id_planilla_detalle);
        reqDesc.input("id_descuento", desc.id_descuento);
        reqDesc.input("nombre_descuento", desc.nombre);
        reqDesc.input("monto", desc.monto);
        await reqDesc.query(`
          INSERT INTO PlanillaDetalleDescuentos (
            id_planilla_detalle, id_descuento,
            nombre_descuento, monto
          )
          VALUES (
            @id_planilla_detalle, @id_descuento,
            @nombre_descuento, @monto
          );
        `);
      }
    }

    // 5. Respuesta al front
    res.json({
      id_planilla,
      mes: mesInt,
      anio: anioInt,
      id_renglon: idRenglonInt,
      total_empleados: totalEmpleados,
      total_monto: totalMontoPlanilla,
      estado: "GENERADA",
      detalle: detalleCalculado,
    });
  } catch (error) {
    console.error("Error al calcular planilla:", error);
    res.status(500).json({ message: "Error al calcular planilla" });
  }
});

/* ===========================================================
   GET /api/planillas  (lista recientes)
=========================================================== */
router.get("/", async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT
        p.id_planilla,
        p.mes,
        p.anio,
        p.id_renglon,
        r.codigo AS codigo_renglon,
        p.descripcion,
        p.total_empleados,
        p.total_monto,
        p.estado
      FROM Planillas p
      LEFT JOIN Renglones r ON r.id_renglon = p.id_renglon
      ORDER BY p.fecha_creacion DESC, p.id_planilla DESC;
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener planillas:", error);
    res.status(500).json({ message: "Error al obtener planillas" });
  }
});

/* ===========================================================
   GET /api/planillas/:id
=========================================================== */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const idInt = parseInt(id, 10);
    if (!Number.isInteger(idInt)) {
      return res.status(400).json({ message: "id_planilla inválido" });
    }

    const headerResult = await pool
      .request()
      .input("id_planilla", idInt)
      .query(`
        SELECT
          p.id_planilla,
          p.mes,
          p.anio,
          p.id_renglon,
          r.codigo AS codigo_renglon,
          p.descripcion,
          p.total_empleados,
          p.total_monto,
          p.estado
        FROM Planillas p
        LEFT JOIN Renglones r ON r.id_renglon = p.id_renglon
        WHERE p.id_planilla = @id_planilla;
      `);

    if (headerResult.recordset.length === 0) {
      return res.status(404).json({ message: "Planilla no encontrada" });
    }

    const header = headerResult.recordset[0];

    const detalleResult = await pool
      .request()
      .input("id_planilla", idInt)
      .query(`
        SELECT
          pd.id_planilla_detalle,
          pd.id_empleado,
          e.codigo_empleado,
          CONCAT(e.nombres, ' ', e.apellidos) AS nombre,
          e.dpi,
          r.codigo AS renglon,
          pd.salario_base,
          pd.total_bonificaciones,
          pd.total_descuentos,
          pd.salario_bruto,
          pd.salario_neto,
          (
            SELECT
              b.nombre_bonificacion AS nombre,
              b.monto
            FROM PlanillaDetalleBonificaciones b
            WHERE b.id_planilla_detalle = pd.id_planilla_detalle
            FOR JSON PATH
          ) AS bonos_json,
          (
            SELECT
              d.nombre_descuento AS nombre,
              d.monto
            FROM PlanillaDetalleDescuentos d
            WHERE d.id_planilla_detalle = pd.id_planilla_detalle
            FOR JSON PATH
          ) AS descuentos_json
        FROM PlanillaDetalle pd
        INNER JOIN Empleados e  ON e.id_empleado = pd.id_empleado
        INNER JOIN Renglones r  ON r.id_renglon = e.id_renglon
        WHERE pd.id_planilla = @id_planilla
        ORDER BY e.codigo_empleado;
      `);

    const detalle = detalleResult.recordset.map((row) => ({
      id_empleado: row.id_empleado,
      codigo_empleado: row.codigo_empleado,
      nombre: row.nombre,
      dpi: row.dpi,
      renglon: row.renglon,
      salarioBase: Number(row.salario_base),
      totalBonos: Number(row.total_bonificaciones),
      totalDescuentos: Number(row.total_descuentos),
      salarioBruto: Number(row.salario_bruto),
      salarioNeto: Number(row.salario_neto),
      bonos: row.bonos_json ? JSON.parse(row.bonos_json) : [],
      descuentos: row.descuentos_json ? JSON.parse(row.descuentos_json) : [],
    }));

    res.json({
      header: {
        id_planilla: header.id_planilla,
        mes: header.mes,
        anio: header.anio,
        id_renglon: header.id_renglon,
        codigo_renglon: header.codigo_renglon,
        descripcion: header.descripcion,
        total_empleados: header.total_empleados,
        total_monto: Number(header.total_monto),
        estado: header.estado,
      },
      detalle,
    });
  } catch (error) {
    console.error("Error al obtener planilla por id:", error);
    res.status(500).json({ message: "Error al obtener planilla" });
  }
});

module.exports = router;
