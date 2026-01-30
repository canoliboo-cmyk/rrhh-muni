// src/pages/Reportes.jsx
import { useState } from "react";
import {
  RiFileList3Line,
  RiFileUserLine,
  RiCalendarTodoLine,
  RiFileChartLine,
} from "react-icons/ri";

const REPORT_TYPES = [
  { id: "empleados", label: "Reporte de Empleados", icon: RiFileUserLine, description: "Lista completa de empleados con filtros avanzados." },
  { id: "planillas", label: "Reporte de Planillas", icon: RiFileList3Line, description: "Resumen de planillas mensuales y anuales." },
  { id: "permisos", label: "Reporte de Permisos", icon: RiCalendarTodoLine, description: "Control de permisos por empleado." },
  { id: "vacaciones", label: "Reporte de Vacaciones", icon: RiCalendarTodoLine, description: "Control de vacaciones por empleado." },
  { id: "renglones", label: "Reporte por Renglón", icon: RiFileChartLine, description: "Distribución de personal y costos por renglón." },
  { id: "bonificaciones", label: "Reporte de Bonificaciones", icon: RiFileChartLine, description: "Bonos aplicados a empleados y renglones." },
  { id: "descuentos", label: "Reporte de Descuentos", icon: RiFileChartLine, description: "Deducciones y descuentos aplicados." },
  // { id: "asistencia", label: "Reporte de Asistencia", icon: RiCalendarTodoLine, description: "Control de asistencia mensual." },
];

function Reportes() {
  const [selectedReport, setSelectedReport] = useState("empleados");

  const handlePreview = () => {
    // Aquí luego llamas a tu backend con los filtros actuales
    alert("Esta es solo la interfaz. La lógica de generación de reportes se conectará al backend.");
  };

  const handleDownload = (format) => {
    // format: "pdf" | "excel"
    alert(`Descargar reporte en formato ${format.toUpperCase()} (solo UI por ahora).`);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page__title">Reportes</h2>
          <p className="page__subtitle">
            Generación de reportes e informes del sistema de Recursos Humanos.
          </p>
        </div>
      </div>

      {/* Bloque superior: filtros dinámicos */}
      <div className="reports-filter-card">
        <h3 className="section-card__title">Generar Reporte</h3>

        <div className="reports-filter-grid">
          {/* Tipo de reporte */}
          <div className="form-group">
            <label className="form-label">Tipo de Reporte</label>
            <select
              className="form-input"
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
            >
              {REPORT_TYPES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtros específicos según el tipo de reporte */}
          <div className="reports-dynamic-filters">
            {selectedReport === "empleados" && <FiltrosEmpleados />}
            {selectedReport === "renglones" && <FiltrosRenglones />}
            {selectedReport === "planillas" && <FiltrosPlanillas />}
            {selectedReport === "bonificaciones" && <FiltrosBonificaciones />}
            {selectedReport === "descuentos" && <FiltrosDescuentos />}
            {selectedReport === "permisos" && <FiltrosPermisos />}
            {selectedReport === "vacaciones" && <FiltrosVacaciones />}
            {/* {selectedReport === "asistencia" && <FiltrosAsistencia />} */}
          </div>
        </div>

        <div className="reports-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handlePreview}
          >
            Generar Vista Previa
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => handleDownload("pdf")}
          >
            Descargar PDF
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => handleDownload("excel")}
          >
            Descargar Excel
          </button>
        </div>
      </div>

      {/* Bloque inferior: tipos de reportes disponibles + recientes */}
      <div className="reports-layout">
        <div className="reports-types">
          <h3 className="section-card__title">Tipos de Reportes Disponibles</h3>
          <div className="reports-types-grid">
            {REPORT_TYPES.map((r) => {
              const Icon = r.icon;
              const isActive = r.id === selectedReport;
              return (
                <button
                  key={r.id}
                  type="button"
                  className={`report-type-card ${isActive ? "report-type-card--active" : ""}`}
                  onClick={() => setSelectedReport(r.id)}
                >
                  <div className="report-type-card__icon">
                    <Icon />
                  </div>
                  <div>
                    <p className="report-type-card__title">{r.label}</p>
                    <p className="report-type-card__desc">{r.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="reports-recent">
          <h3 className="section-card__title">Reportes Generados Recientemente</h3>
          <ul className="reports-recent-list">
            <li className="reports-recent-item">
              <div>
                <p className="reports-recent__title">
                  Reporte de Empleados - Enero 2026
                </p>
                <p className="reports-recent__meta">Generado el 15/01/2026</p>
              </div>
              <button type="button" className="icon-button" title="Descargar">
                ⬇
              </button>
            </li>
            <li className="reports-recent-item">
              <div>
                <p className="reports-recent__title">
                  Reporte de Planillas - Diciembre 2025
                </p>
                <p className="reports-recent__meta">Generado el 05/01/2026</p>
              </div>
              <button type="button" className="icon-button" title="Descargar">
                ⬇
              </button>
            </li>
            <li className="reports-recent-item">
              <div>
                <p className="reports-recent__title">
                  Reporte por Renglón - 2025
                </p>
                <p className="reports-recent__meta">Generado el 02/01/2026</p>
              </div>
              <button type="button" className="icon-button" title="Descargar">
                ⬇
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* =============================
   FILTROS ESPECÍFICOS POR MÓDULO
   (solo UI, sin lógica de backend)
============================= */

function FiltrosEmpleados() {
  return (
    <div className="filters-grid">
      <div className="form-group">
        <label className="form-label">Renglón</label>
        <select className="form-input">
          <option value="">Todos</option>
          <option value="011">011</option>
          <option value="021">021</option>
          <option value="022">022</option>
          <option value="029">029</option>
          <option value="031">031</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Estado</label>
        <select className="form-input">
          <option value="">Todos</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Departamento</label>
        <input
          type="text"
          className="form-input"
          placeholder="Ej. Recursos Humanos"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Buscar por DPI / Código / Nombre</label>
        <input
          type="text"
          className="form-input"
          placeholder="Escribe DPI, código o nombre..."
        />
      </div>

      <div className="form-group">
        <label className="form-label">Fecha de ingreso (desde)</label>
        <input type="date" className="form-input" />
      </div>
      <div className="form-group">
        <label className="form-label">Fecha de ingreso (hasta)</label>
        <input type="date" className="form-input" />
      </div>

      <div className="form-group">
        <label className="form-label">Salario base desde (Q)</label>
        <input type="number" className="form-input" min="0" />
      </div>
      <div className="form-group">
        <label className="form-label">Salario base hasta (Q)</label>
        <input type="number" className="form-input" min="0" />
      </div>
    </div>
  );
}

function FiltrosRenglones() {
  return (
    <div className="filters-grid">
      <div className="form-group">
        <label className="form-label">Renglón</label>
        <select className="form-input">
          <option value="">Todos</option>
          <option value="011">011</option>
          <option value="021">021</option>
          <option value="022">022</option>
          <option value="029">029</option>
          <option value="031">031</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Solo renglones con empleados</label>
        <select className="form-input">
          <option value="todos">Mostrar todos</option>
          <option value="con-empleados">Solo con empleados</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Empleados desde</label>
        <input type="number" className="form-input" min="0" />
      </div>
      <div className="form-group">
        <label className="form-label">Empleados hasta</label>
        <input type="number" className="form-input" min="0" />
      </div>
    </div>
  );
}

function FiltrosPlanillas() {
  return (
    <div className="filters-grid">
      <div className="form-group">
        <label className="form-label">Mes</label>
        <select className="form-input">
          <option value="">Todos</option>
          <option>Enero</option>
          <option>Febrero</option>
          <option>Marzo</option>
          <option>Abril</option>
          <option>Mayo</option>
          <option>Junio</option>
          <option>Julio</option>
          <option>Agosto</option>
          <option>Septiembre</option>
          <option>Octubre</option>
          <option>Noviembre</option>
          <option>Diciembre</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Año</label>
        <input type="number" className="form-input" min="2000" max="2100" />
      </div>
      <div className="form-group">
        <label className="form-label">Renglón</label>
        <select className="form-input">
          <option value="">Todos</option>
          <option value="011">011</option>
          <option value="021">021</option>
          <option value="022">022</option>
          <option value="029">029</option>
          <option value="031">031</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Estado de planilla</label>
        <select className="form-input">
          <option value="">Todas</option>
          <option value="calculada">Calculada</option>
          <option value="aprobada">Aprobada</option>
          <option value="pagada">Pagada</option>
          <option value="anulada">Anulada</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Departamento</label>
        <input type="text" className="form-input" placeholder="Ej. Tesorería" />
      </div>
      <div className="form-group">
        <label className="form-label">Empleado (DPI / Código / Nombre)</label>
        <input type="text" className="form-input" placeholder="Buscar empleado..." />
      </div>

      <div className="form-group">
        <label className="form-label">Fecha de pago (desde)</label>
        <input type="date" className="form-input" />
      </div>
      <div className="form-group">
        <label className="form-label">Fecha de pago (hasta)</label>
        <input type="date" className="form-input" />
      </div>
    </div>
  );
}

function FiltrosBonificaciones() {
  return (
    <div className="filters-grid">
      <div className="form-group">
        <label className="form-label">Tipo de bonificación</label>
        <select className="form-input">
          <option value="">Todas</option>
          <option value="monto-fijo">Monto fijo</option>
          <option value="porcentaje">Porcentaje</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Estado</label>
        <select className="form-input">
          <option value="">Todas</option>
          <option value="activa">Activas</option>
          <option value="inactiva">Inactivas</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Asignar a</label>
        <select className="form-input">
          <option value="">Todos los empleados</option>
          <option value="renglon">Por renglón</option>
          <option value="empleado">Empleado específico</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Rango de fechas (desde)</label>
        <input type="date" className="form-input" />
      </div>
      <div className="form-group">
        <label className="form-label">Rango de fechas (hasta)</label>
        <input type="date" className="form-input" />
      </div>
    </div>
  );
}

function FiltrosDescuentos() {
  return (
    <div className="filters-grid">
      <div className="form-group">
        <label className="form-label">Tipo de descuento</label>
        <select className="form-input">
          <option value="">Todos</option>
          <option value="igss">IGSS</option>
          <option value="isr">ISR</option>
          <option value="personalizado">Personalizado</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Estado</label>
        <select className="form-input">
          <option value="">Todos</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Esquema</label>
        <select className="form-input">
          <option value="">Todos</option>
          <option value="monto-fijo">Monto fijo</option>
          <option value="porcentaje">Porcentaje</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Porcentaje desde (%)</label>
        <input type="number" className="form-input" min="0" step="0.01" />
      </div>
      <div className="form-group">
        <label className="form-label">Porcentaje hasta (%)</label>
        <input type="number" className="form-input" min="0" step="0.01" />
      </div>
    </div>
  );
}

function FiltrosPermisos() {
  return (
    <div className="filters-grid">
      <div className="form-group">
        <label className="form-label">Estado</label>
        <select className="form-input">
          <option value="">Todos</option>
          <option value="pendiente">Pendientes</option>
          <option value="aprobado">Aprobados</option>
          <option value="rechazado">Rechazados</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Tipo de permiso</label>
        <select className="form-input">
          <option value="">Todos</option>
          <option value="personal">Personal</option>
          <option value="enfermedad">Enfermedad</option>
          <option value="comision">Comisión</option>
          <option value="otro">Otro</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Departamento</label>
        <input type="text" className="form-input" placeholder="Ej. Recursos Humanos" />
      </div>
      <div className="form-group">
        <label className="form-label">Empleado (DPI / Código / Nombre)</label>
        <input type="text" className="form-input" placeholder="Buscar empleado..." />
      </div>

      <div className="form-group">
        <label className="form-label">Fecha solicitud (desde)</label>
        <input type="date" className="form-input" />
      </div>
      <div className="form-group">
        <label className="form-label">Fecha solicitud (hasta)</label>
        <input type="date" className="form-input" />
      </div>

      <div className="form-group">
        <label className="form-label">Fecha inicio permiso (desde)</label>
        <input type="date" className="form-input" />
      </div>
      <div className="form-group">
        <label className="form-label">Fecha fin permiso (hasta)</label>
        <input type="date" className="form-input" />
      </div>
    </div>
  );
}

function FiltrosVacaciones() {
  return (
    <div className="filters-grid">
      <div className="form-group">
        <label className="form-label">Estado</label>
        <select className="form-input">
          <option value="">Todos</option>
          <option value="pendiente">Pendientes</option>
          <option value="aprobado">Aprobadas</option>
          <option value="rechazado">Rechazadas</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Empleado (DPI / Código / Nombre)</label>
        <input type="text" className="form-input" placeholder="Buscar empleado..." />
      </div>
      <div className="form-group">
        <label className="form-label">Departamento</label>
        <input type="text" className="form-input" placeholder="Ej. Tesorería" />
      </div>

      <div className="form-group">
        <label className="form-label">Fecha inicio (desde)</label>
        <input type="date" className="form-input" />
      </div>
      <div className="form-group">
        <label className="form-label">Fecha inicio (hasta)</label>
        <input type="date" className="form-input" />
      </div>

      <div className="form-group">
        <label className="form-label">Fecha fin (desde)</label>
        <input type="date" className="form-input" />
      </div>
      <div className="form-group">
        <label className="form-label">Fecha fin (hasta)</label>
        <input type="date" className="form-input" />
      </div>

      <div className="form-group">
        <label className="form-label">Días solicitados desde</label>
        <input type="number" className="form-input" min="0" />
      </div>
      <div className="form-group">
        <label className="form-label">Días solicitados hasta</label>
        <input type="number" className="form-input" min="0" />
      </div>
    </div>
  );
}

export default Reportes;
