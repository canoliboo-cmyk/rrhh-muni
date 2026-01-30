// src/pages/Planillas.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  RiCalculatorLine,
  RiFileExcel2Line,
  RiFilePdfLine,
  RiCheckLine,
} from "react-icons/ri";

const API_URL = "http://localhost:4000/api";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function formatearMoneda(valor) {
  return Number(valor || 0).toLocaleString("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function Planillas() {
  const hoy = new Date();

  // Filtros generador
  const [mes, setMes] = useState(hoy.getMonth() + 1); // 1-12
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [renglones, setRenglones] = useState([]);
  const [idRenglon, setIdRenglon] = useState("todos");

  // Datos de backend
  const [planillasRecientes, setPlanillasRecientes] = useState([]);
  const [ultimaPlanilla, setUltimaPlanilla] = useState(null);

  // Loading
  const [loadingCalcular, setLoadingCalcular] = useState(false);
  const [loadingInicial, setLoadingInicial] = useState(false);

  // ============================
  // Carga inicial
  // ============================
  useEffect(() => {
    const load = async () => {
      setLoadingInicial(true);
      try {
        const [rengRes, plansRes] = await Promise.all([
          fetch(`${API_URL}/renglones`),
          fetch(`${API_URL}/planillas`),
        ]);

        const renglonesData = await rengRes.json();
        const planillasData = await plansRes.json();

        setRenglones(Array.isArray(renglonesData) ? renglonesData : []);
        setPlanillasRecientes(Array.isArray(planillasData) ? planillasData : []);
      } catch (error) {
        console.error("Error al cargar planillas/renglones:", error);
        alert("Error al cargar datos de planillas.");
      } finally {
        setLoadingInicial(false);
      }
    };

    load();
  }, []);

  // ============================
  // Columnas dinámicas (bonos / descuentos)
  // ============================
  const conceptosBonos = useMemo(() => {
    if (!ultimaPlanilla?.detalle) return [];
    const set = new Set();
    ultimaPlanilla.detalle.forEach((row) => {
      (row.bonos || []).forEach((b) => {
        if (b?.nombre) set.add(b.nombre);
      });
    });
    return Array.from(set);
  }, [ultimaPlanilla]);

  const conceptosDescuentos = useMemo(() => {
    if (!ultimaPlanilla?.detalle) return [];
    const set = new Set();
    ultimaPlanilla.detalle.forEach((row) => {
      (row.descuentos || []).forEach((d) => {
        if (d?.nombre) set.add(d.nombre);
      });
    });
    return Array.from(set);
  }, [ultimaPlanilla]);

  // ============================
  // Totales generales + por columna
  // ============================
  const { totales, totalesConceptos } = useMemo(() => {
    const baseTotales = {
      empleados: 0,
      sueldos: 0,
      bonificaciones: 0,
      descuentos: 0,
      bruto: 0,
      liquido: 0,
    };

    const baseConceptos = {
      bonos: {},       // { nombreBono: totalMonto }
      descuentos: {},  // { nombreDesc: totalMonto }
    };

    if (!ultimaPlanilla?.detalle) {
      return { totales: baseTotales, totalesConceptos: baseConceptos };
    }

    const t = { ...baseTotales };
    const c = { bonos: {}, descuentos: {} };

    ultimaPlanilla.detalle.forEach((row) => {
      const salarioBase = Number(row.salarioBase || 0);
      const totalBonos = Number(row.totalBonos || 0);
      const totalDesc = Number(row.totalDescuentos || 0);
      const salarioBruto =
        row.salarioBruto !== undefined
          ? Number(row.salarioBruto)
          : salarioBase + totalBonos;
      const salarioNeto =
        row.salarioNeto !== undefined
          ? Number(row.salarioNeto)
          : salarioBruto - totalDesc;

      t.empleados += 1;
      t.sueldos += salarioBase;
      t.bonificaciones += totalBonos;
      t.descuentos += totalDesc;
      t.bruto += salarioBruto;
      t.liquido += salarioNeto;

      // Totales por bono
      (row.bonos || []).forEach((b) => {
        const nombre = b.nombre;
        const monto = Number(b.monto || 0);
        c.bonos[nombre] = (c.bonos[nombre] || 0) + monto;
      });

      // Totales por descuento
      (row.descuentos || []).forEach((d) => {
        const nombre = d.nombre;
        const monto = Number(d.monto || 0);
        c.descuentos[nombre] = (c.descuentos[nombre] || 0) + monto;
      });
    });

    return { totales: t, totalesConceptos: c };
  }, [ultimaPlanilla]);

  // ============================
  // Calcular / generar planilla
  // ============================
  const handleCalcular = async () => {
    setLoadingCalcular(true);
    try {
      const resp = await fetch(`${API_URL}/planillas/calcular`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mes,
          anio,
          id_renglon: idRenglon,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || "Error al generar la planilla");
      }

      const data = await resp.json(); // viene con bonos[] y descuentos[]
      setUltimaPlanilla(data);

      const plansRes = await fetch(`${API_URL}/planillas`);
      const planillasData = await plansRes.json();
      setPlanillasRecientes(Array.isArray(planillasData) ? planillasData : []);

      alert("Planilla generada correctamente.");
    } catch (error) {
      console.error("Error al generar planilla:", error);
      alert(error.message || "Error al generar planilla.");
    } finally {
      setLoadingCalcular(false);
    }
  };

  // ============================
  // Ver detalle de planilla guardada
  // ============================
  const handleVerDetalleGuardado = async (id_planilla) => {
    try {
      const resp = await fetch(`${API_URL}/planillas/${id_planilla}`);
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || "Error al obtener detalle");
      }

      const data = await resp.json();

      setUltimaPlanilla({
        id_planilla: data.header.id_planilla,
        mes: data.header.mes,
        anio: data.header.anio,
        id_renglon: data.header.id_renglon,
        descripcion: data.header.descripcion,
        total_empleados: data.header.total_empleados,
        total_monto: data.header.total_monto,
        estado: data.header.estado,
        // cada item YA trae bonos[] y descuentos[]
        detalle: data.detalle,
      });
    } catch (error) {
      console.error("Error al ver detalle de planilla:", error);
      alert(error.message || "Error al ver detalle de planilla.");
    }
  };

  // ============================
  // Botones de exportar / aprobar (solo UI)
  // ============================
  const handleExportExcel = () => {
    alert("Solo UI: aquí se generaría el Excel de la planilla.");
  };

  const handleExportPdf = () => {
    alert("Solo UI: aquí se generaría el PDF de la planilla.");
  };

  const handleAprobar = () => {
    alert("Solo UI: aquí se marcaría la planilla como Aprobada/Pagada.");
  };

  const anios = [];
  for (let y = 2020; y <= 2035; y++) {
    anios.push(y);
  }

  // ============================
  // Render
  // ============================
  return (
    <div className="page">
      <div className="empleados-header">
        <div>
          <h2 className="page__title">Planillas</h2>
          <p className="page__subtitle">
            Generación y gestión de planillas mensuales.
          </p>
        </div>
      </div>

      {/* Generar planilla */}
      <section className="section-card planillas-generator">
        <h3 className="section-card__title">Generar Planilla</h3>

        <div className="planillas-generator__fields">
          {/* Mes */}
          <div className="form-group">
            <label className="form-label">Mes</label>
            <select
              className="form-input"
              value={mes}
              onChange={(e) => setMes(parseInt(e.target.value, 10))}
            >
              {MESES.map((m, index) => (
                <option key={m} value={index + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Año */}
          <div className="form-group">
            <label className="form-label">Año</label>
            <select
              className="form-input"
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
            >
              {anios.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Renglón */}
          <div className="form-group">
            <label className="form-label">Renglón</label>
            <select
              className="form-input"
              value={idRenglon}
              onChange={(e) => setIdRenglon(e.target.value)}
            >
              <option value="todos">Todos</option>
              {renglones.map((r) => (
                <option key={r.id_renglon} value={r.id_renglon}>
                  {r.codigo}
                </option>
              ))}
            </select>
          </div>

          {/* Botón calcular */}
          <div className="planillas-generator__button-wrapper">
            <button
              type="button"
              className="btn-primary planillas-generator__calculate"
              onClick={handleCalcular}
              disabled={loadingCalcular || loadingInicial}
            >
              <RiCalculatorLine />
              {loadingCalcular ? "Calculando..." : "Calcular"}
            </button>
          </div>
        </div>
      </section>

      {/* Planillas recientes */}
      <section className="section-card planillas-recientes">
        <h3 className="section-card__title">Planillas Recientes</h3>

        {planillasRecientes.length === 0 ? (
          <p>No se han generado planillas todavía.</p>
        ) : (
          <div className="planillas-recientes-list">
            {planillasRecientes.map((p) => (
              <button
                key={p.id_planilla}
                type="button"
                className="planillas-reciente-item"
                onClick={() => handleVerDetalleGuardado(p.id_planilla)}
              >
                <div>
                  <p className="planillas-reciente-item__title">
                    Planilla {MESES[p.mes - 1]} {p.anio} -{" "}
                    {p.codigo_renglon || "Todos"}
                  </p>
                  <p className="planillas-reciente-item__detail">
                    {p.total_empleados} empleados •{" "}
                    {formatearMoneda(p.total_monto)}
                  </p>
                </div>
                <span
                  className={`status-pill ${
                    p.estado === "PAGADA"
                      ? "status-pill--paid"
                      : p.estado === "APROBADA"
                      ? "status-pill--approved"
                      : "status-pill--pending"
                  }`}
                >
                  {p.estado}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Detalle de planilla calculada / seleccionada */}
      {ultimaPlanilla && (
        <>
          <section className="section-card planilla-detalle-card">
            <div className="planilla-detalle-header">
              <h3 className="section-card__title">
                Planilla de {MESES[ultimaPlanilla.mes - 1]}{" "}
                {ultimaPlanilla.anio}
              </h3>

              <div className="planilla-detalle-actions">
                <button
                  type="button"
                  className="btn-outline btn-outline--small"
                  onClick={handleExportExcel}
                >
                  <RiFileExcel2Line />
                  Exportar Excel
                </button>
                <button
                  type="button"
                  className="btn-outline btn-outline--small"
                  onClick={handleExportPdf}
                >
                  <RiFilePdfLine />
                  Exportar PDF
                </button>
                <button
                  type="button"
                  className="btn-success btn-success--small"
                  onClick={handleAprobar}
                >
                  <RiCheckLine />
                  Aprobar
                </button>
              </div>
            </div>

            <div className="empleados-table-card planilla-detalle-table">
              <table className="empleados-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Empleado</th>
                    <th>DPI</th>
                    <th>Renglón</th>
                    <th>Salario base</th>

                    {/* Columnas dinámicas de BONOS */}
                    {conceptosBonos.map((nombre) => (
                      <th key={`bono-${nombre}`}>{nombre}</th>
                    ))}

                    {/* Columnas dinámicas de DESCUENTOS */}
                    {conceptosDescuentos.map((nombre) => (
                      <th key={`desc-${nombre}`}>{nombre}</th>
                    ))}

                    <th>Salario bruto</th>
                    <th>Salario neto</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimaPlanilla.detalle.map((row) => {
                    const bonos = Array.isArray(row.bonos) ? row.bonos : [];
                    const descuentos = Array.isArray(row.descuentos)
                      ? row.descuentos
                      : [];

                    return (
                      <tr key={row.id_empleado}>
                        <td>{row.codigo_empleado}</td>
                        <td>{row.nombre}</td>
                        <td>{row.dpi}</td>
                        <td>
                          <span className="pill-renglon">
                            {row.renglon}
                          </span>
                        </td>
                        <td>{formatearMoneda(row.salarioBase)}</td>

                        {/* Valores por cada bono */}
                        {conceptosBonos.map((nombre) => {
                          const b = bonos.find((x) => x.nombre === nombre);
                          const monto = b ? b.monto : 0;
                          return (
                            <td
                              key={`row-${row.id_empleado}-bono-${nombre}`}
                              className="amount-positive"
                            >
                              {formatearMoneda(monto)}
                            </td>
                          );
                        })}

                        {/* Valores por cada descuento */}
                        {conceptosDescuentos.map((nombre) => {
                          const d = descuentos.find(
                            (x) => x.nombre === nombre
                          );
                          const monto = d ? d.monto : 0;
                          return (
                            <td
                              key={`row-${row.id_empleado}-desc-${nombre}`}
                              className="amount-negative"
                            >
                              {formatearMoneda(monto)}
                            </td>
                          );
                        })}

                        <td>{formatearMoneda(row.salarioBruto)}</td>
                        <td className="amount-strong">
                          {formatearMoneda(row.salarioNeto)}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Fila de TOTALES */}
                  <tr className="planilla-detalle-totales-row">
                    <td className="planilla-detalle-totales-label">
                      TOTALES
                    </td>
                    <td />
                    <td />
                    <td />
                    <td>{formatearMoneda(totales.sueldos)}</td>

                    {/* Totales por bono */}
                    {conceptosBonos.map((nombre) => (
                      <td
                        key={`tot-bono-${nombre}`}
                        className="amount-positive"
                      >
                        {formatearMoneda(
                          totalesConceptos.bonos[nombre] || 0
                        )}
                      </td>
                    ))}

                    {/* Totales por descuento */}
                    {conceptosDescuentos.map((nombre) => (
                      <td
                        key={`tot-desc-${nombre}`}
                        className="amount-negative"
                      >
                        {formatearMoneda(
                          totalesConceptos.descuentos[nombre] || 0
                        )}
                      </td>
                    ))}

                    <td>{formatearMoneda(totales.bruto)}</td>
                    <td className="amount-strong">
                      {formatearMoneda(totales.liquido)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Resumen inferior */}
          <section className="planilla-resumen-grid">
            <div className="summary-card">
              <p className="summary-card__label">Total Empleados</p>
              <p className="summary-card__value summary-card__value--normal">
                {totales.empleados}
              </p>
            </div>
            <div className="summary-card summary-card--green">
              <p className="summary-card__label">Total Sueldos</p>
              <p className="summary-card__value">
                {formatearMoneda(totales.sueldos)}
              </p>
            </div>
            <div className="summary-card summary-card--red">
              <p className="summary-card__label">Total Descuentos</p>
              <p className="summary-card__value">
                {formatearMoneda(totales.descuentos)}
              </p>
            </div>
            <div className="summary-card summary-card--purple">
              <p className="summary-card__label">Líquido Total</p>
              <p className="summary-card__value">
                {formatearMoneda(totales.liquido)}
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Planillas;
