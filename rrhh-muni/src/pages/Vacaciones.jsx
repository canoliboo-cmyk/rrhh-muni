import { useMemo, useState } from "react";
import {
  RiCalendarLine,
  RiTimeLine,
  RiCheckLine,
  RiSuitcaseLine,
  RiSearchLine,
} from "react-icons/ri";

// 🔹 Datos de ejemplo (luego se reemplazan por la base de datos)
const MOCK_EMPLOYEES = [
  {
    codigo: "EMP001",
    dpi: "3012345670202",
    nombre: "Juan Carlos Pérez García",
    diasDisponibles: 15,
  },
  {
    codigo: "EMP002",
    dpi: "3012345670303",
    nombre: "María Elena López Ramírez",
    diasDisponibles: 10,
  },
  {
    codigo: "EMP003",
    dpi: "3012345670404",
    nombre: "Carlos Alberto Rodríguez",
    diasDisponibles: 12,
  },
  {
    codigo: "EMP004",
    dpi: "3012345670505",
    nombre: "Ana Sofía Hernández",
    diasDisponibles: 8,
  },
  {
    codigo: "EMP005",
    dpi: "3012345670606",
    nombre: "Luis Fernando Morales",
    diasDisponibles: 10,
  },
  {
    codigo: "EMP006",
    dpi: "3012345670707",
    nombre: "Patricia González Méndez",
    diasDisponibles: 14,
  },
];

const MOCK_VACATIONS = [
  {
    id: 1,
    empleadoDpi: "3012345670202",
    empleadoNombre: "Juan Carlos Pérez García",
    fechaInicio: "2026-02-10",
    fechaFin: "2026-02-21",
    dias: 10,
    fechaSolicitud: "2026-01-15",
    estado: "Aprobado",
  },
  {
    id: 2,
    empleadoDpi: "3012345670707",
    empleadoNombre: "Patricia González Méndez",
    fechaInicio: "2026-03-05",
    fechaFin: "2026-03-12",
    dias: 6,
    fechaSolicitud: "2026-01-18",
    estado: "Pendiente",
  },
];

function Vacaciones() {
  // Estado de solicitudes
  const [vacaciones, setVacaciones] = useState(MOCK_VACATIONS);

  // Filtros de la tabla
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");

  // Modal nueva solicitud
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dpiBusqueda, setDpiBusqueda] = useState("");
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [formNueva, setFormNueva] = useState({
    fechaInicio: "",
    fechaFin: "",
    dias: "",
    motivo: "",
  });

  // 🔹 Resumen (cards de arriba)
  const resumen = useMemo(() => {
    const total = vacaciones.length;
    const pendientes = vacaciones.filter((v) => v.estado === "Pendiente").length;
    const aprobadas = vacaciones.filter((v) => v.estado === "Aprobado").length;
    const diasTotales = vacaciones.reduce((acc, v) => acc + v.dias, 0);

    return { total, pendientes, aprobadas, diasTotales };
  }, [vacaciones]);

  // 🔹 Filtro de tabla por texto / estado
  const vacacionesFiltradas = vacaciones.filter((v) => {
    const term = search.toLowerCase();

    const matchSearch =
      !term ||
      v.empleadoNombre.toLowerCase().includes(term) ||
      v.empleadoDpi.includes(term);

    const matchEstado =
      filterEstado === "todos" || v.estado.toLowerCase() === filterEstado;

    return matchSearch && matchEstado;
  });

  // 🔹 Lista de "días disponibles" por empleado (mock)
  const diasDisponibles = MOCK_EMPLOYEES;

  // --- Lógica modal nueva solicitud ---

  const handleBuscarEmpleadoPorDpi = () => {
    // Aquí más adelante vas a llamar a tu backend para buscar por DPI
    const emp = MOCK_EMPLOYEES.find((e) => e.dpi === dpiBusqueda.trim());
    setEmpleadoSeleccionado(emp || null);

    if (!emp) {
      alert("No se encontró un empleado con ese DPI (datos de prueba).");
    }
  };

  const handleChangeNueva = (e) => {
    const { name, value } = e.target;
    setFormNueva((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCalcularDias = () => {
    if (!formNueva.fechaInicio || !formNueva.fechaFin) return;

    const inicio = new Date(formNueva.fechaInicio);
    const fin = new Date(formNueva.fechaFin);

    if (fin < inicio) {
      alert("La fecha fin no puede ser menor a la fecha inicio.");
      return;
    }

    const diffMs = fin.getTime() - inicio.getTime();
    const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;

    setFormNueva((prev) => ({
      ...prev,
      dias: String(diffDias),
    }));
  };

  const handleSubmitNueva = (e) => {
    e.preventDefault();

    if (!empleadoSeleccionado) {
      alert("Primero debes seleccionar un empleado por DPI.");
      return;
    }

    const nueva = {
      id: Date.now(),
      empleadoDpi: empleadoSeleccionado.dpi,
      empleadoNombre: empleadoSeleccionado.nombre,
      fechaInicio: formNueva.fechaInicio,
      fechaFin: formNueva.fechaFin,
      dias: Number(formNueva.dias) || 0,
      fechaSolicitud: new Date().toISOString().slice(0, 10),
      estado: "Pendiente",
    };

    // Aquí luego se enviará al backend
    setVacaciones((prev) => [...prev, nueva]);

    // Reset
    setIsModalOpen(false);
    setDpiBusqueda("");
    setEmpleadoSeleccionado(null);
    setFormNueva({
      fechaInicio: "",
      fechaFin: "",
      dias: "",
      motivo: "",
    });
  };

  return (
    <div className="page">
      {/* Encabezado */}
      <div className="page-header">
        <div>
          <h2 className="page__title">Vacaciones</h2>
          <p className="page__subtitle">
            Gestión de solicitudes de vacaciones.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          + Nueva Solicitud
        </button>
      </div>

      {/* Cards de resumen */}
      <div className="vacaciones-summary">
        <div className="vacaciones-summary__card">
          <div className="vacaciones-summary__icon vacaciones-summary__icon--blue">
            <RiCalendarLine />
          </div>
          <p className="vacaciones-summary__label">Solicitudes Totales</p>
          <p className="vacaciones-summary__value">{resumen.total}</p>
        </div>

        <div className="vacaciones-summary__card">
          <div className="vacaciones-summary__icon vacaciones-summary__icon--yellow">
            <RiTimeLine />
          </div>
          <p className="vacaciones-summary__label">Pendientes</p>
          <p className="vacaciones-summary__value">{resumen.pendientes}</p>
        </div>

        <div className="vacaciones-summary__card">
          <div className="vacaciones-summary__icon vacaciones-summary__icon--green">
            <RiCheckLine />
          </div>
          <p className="vacaciones-summary__label">Aprobadas</p>
          <p className="vacaciones-summary__value">{resumen.aprobadas}</p>
        </div>

        <div className="vacaciones-summary__card">
          <div className="vacaciones-summary__icon vacaciones-summary__icon--purple">
            <RiSuitcaseLine />
          </div>
          <p className="vacaciones-summary__label">Días Totales</p>
          <p className="vacaciones-summary__value">{resumen.diasTotales}</p>
        </div>
      </div>

      {/* Filtros lista */}
      <div className="vacaciones-filters">
        <div className="vacaciones-search">
          <RiSearchLine className="vacaciones-search__icon" />
          <input
            type="text"
            className="vacaciones-search__input"
            placeholder="Buscar por nombre o DPI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="vacaciones-filter-select"
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
        >
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Pendientes</option>
          <option value="aprobado">Aprobadas</option>
          <option value="rechazado">Rechazadas</option>
        </select>
      </div>

      {/* Tabla de solicitudes */}
      <div className="vacaciones-table-card">
        <h3 className="section-card__title">Solicitudes de Vacaciones</h3>

        <table className="vacaciones-table">
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Días</th>
              <th>Fecha Solicitud</th>
              <th>Estado</th>
              <th style={{ textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vacacionesFiltradas.map((v) => (
              <tr key={v.id}>
                <td>
                  <div className="vacaciones-table__employee">
                    <span className="vacaciones-table__employee-name">
                      {v.empleadoNombre}
                    </span>
                    <span className="vacaciones-table__employee-dpi">
                      {v.empleadoDpi}
                    </span>
                  </div>
                </td>
                <td>{v.fechaInicio}</td>
                <td>{v.fechaFin}</td>
                <td>{v.dias}</td>
                <td>{v.fechaSolicitud}</td>
                <td>
                  {v.estado === "Aprobado" && (
                    <span className="status-pill status-pill--success">
                      Aprobado
                    </span>
                  )}
                  {v.estado === "Pendiente" && (
                    <span className="status-pill status-pill--warning">
                      Pendiente
                    </span>
                  )}
                  {v.estado === "Rechazado" && (
                    <span className="status-pill status-pill--danger">
                      Rechazado
                    </span>
                  )}
                </td>
                <td style={{ textAlign: "right" }}>
                  <button type="button" className="btn-ghost btn-ghost--sm">
                    Ver Detalle
                  </button>
                </td>
              </tr>
            ))}

            {vacacionesFiltradas.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "1rem" }}>
                  No se encontraron solicitudes con los filtros actuales.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Días disponibles por empleado */}
      <div className="vacaciones-days-card">
        <h3 className="section-card__title">
          Días de Vacación Disponibles por Empleado
        </h3>

        <div className="vacaciones-days-grid">
          {diasDisponibles.map((emp) => (
            <div key={emp.codigo} className="vacaciones-days-card__item">
              <p className="vacaciones-days-card__name">{emp.nombre}</p>
              <p className="vacaciones-days-card__code">{emp.codigo}</p>
              <span className="vacaciones-days-card__badge">
                {emp.diasDisponibles} días
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Nueva Solicitud */}
      {isModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setIsModalOpen(false);
          }}
        >
          <div
            className="modal modal--large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <h3>Nueva Solicitud de Vacaciones</h3>
              <button
                type="button"
                className="icon-button icon-button--ghost"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form className="modal__body vacaciones-form" onSubmit={handleSubmitNueva}>
              {/* Búsqueda de empleado por DPI */}
              <div className="section-card section-card--borderless">
                <h4 className="section-card__title">Datos del empleado</h4>

                <div className="vacaciones-form__employee-search">
                  <div className="form-group">
                    <label className="form-label">DPI del empleado</label>
                    <div className="vacaciones-form__dpi-search">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Ej. 3012345670202"
                        value={dpiBusqueda}
                        onChange={(e) => setDpiBusqueda(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleBuscarEmpleadoPorDpi}
                      >
                        Buscar
                      </button>
                    </div>
                    <p className="form-help">
                      El sistema buscará al empleado en la base de datos usando
                      el DPI.
                    </p>
                  </div>

                  {empleadoSeleccionado && (
                    <div className="vacaciones-form__employee-info">
                      <p className="vacaciones-form__employee-name">
                        {empleadoSeleccionado.nombre}
                      </p>
                      <p className="vacaciones-form__employee-detail">
                        Código: {empleadoSeleccionado.codigo}
                      </p>
                      <p className="vacaciones-form__employee-detail">
                        DPI: {empleadoSeleccionado.dpi}
                      </p>
                      <p className="vacaciones-form__employee-detail">
                        Días disponibles:{" "}
                        {empleadoSeleccionado.diasDisponibles} días
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Datos de la solicitud */}
              <div className="section-card section-card--borderless">
                <h4 className="section-card__title">Detalle de la solicitud</h4>

                <div className="form-grid-two">
                  <div className="form-group">
                    <label className="form-label">Fecha inicio</label>
                    <input
                      type="date"
                      className="form-input"
                      name="fechaInicio"
                      value={formNueva.fechaInicio}
                      onChange={handleChangeNueva}
                      onBlur={handleCalcularDias}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fecha fin</label>
                    <input
                      type="date"
                      className="form-input"
                      name="fechaFin"
                      value={formNueva.fechaFin}
                      onChange={handleChangeNueva}
                      onBlur={handleCalcularDias}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Días</label>
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      name="dias"
                      value={formNueva.dias}
                      onChange={handleChangeNueva}
                      required
                    />
                  </div>

                  <div className="form-group form-group--full">
                    <label className="form-label">Motivo</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      name="motivo"
                      value={formNueva.motivo}
                      onChange={handleChangeNueva}
                      placeholder="Descríbe brevemente el motivo de las vacaciones..."
                    />
                  </div>
                </div>
              </div>

              <div className="modal__footer">
                <button
                  type="button"
                  className="btn-ghost btn-ghost--sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary btn-primary--sm">
                  Guardar solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Vacaciones;
