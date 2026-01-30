// src/pages/Permisos.jsx
import { useState } from "react";
import {
  RiCalendarLine,
  RiTimeLine,
  RiCheckLine,
  RiCloseLine,
  RiPrinterLine,
  RiUpload2Line,
} from "react-icons/ri";

/**
 * Empleados de ejemplo.
 * Más adelante esto vendrá del backend (tabla empleados).
 */
const MOCK_EMPLEADOS = [
  {
    dpi: "3012345670202",
    nombreCompleto: "Yeferson Alexander Castillo Hernández",
    dependencia: "Recursos Humanos",
  },
  {
    dpi: "3012345670303",
    nombreCompleto: "María Elena López Ramírez",
    dependencia: "Tesorería",
  },
  {
    dpi: "3012345670404",
    nombreCompleto: "Luis Fernando Morales",
    dependencia: "Servicios Públicos",
  },
];

const MOCK_PERMISOS = [
  {
    id: 1,
    dpi: "3012345670303",
    empleado: "María Elena López Ramírez",
    dependencia: "Tesorería",
    tipo: "Personal",
    fechaInicio: "2026-01-22",
    fechaFin: "2026-01-22",
    motivo: "Cita médica",
    fechaSolicitud: "2026-01-18",
    estado: "Pendiente",
    archivoFirmadoNombre: null,
  },
  {
    id: 2,
    dpi: "3012345670404",
    empleado: "Luis Fernando Morales",
    dependencia: "Servicios Públicos",
    tipo: "Enfermedad",
    fechaInicio: "2026-01-15",
    fechaFin: "2026-01-17",
    motivo: "Incapacidad médica por gripe",
    fechaSolicitud: "2026-01-14",
    estado: "Aprobado",
    archivoFirmadoNombre: "permiso_luis_20260115.pdf",
  },
  {
    id: 3,
    dpi: "3012345670303",
    empleado: "María Elena López Ramírez",
    dependencia: "Tesorería",
    tipo: "Personal",
    fechaInicio: "2026-01-20",
    fechaFin: "2026-01-20",
    motivo: "Trámite personal",
    fechaSolicitud: "2026-01-17",
    estado: "Rechazado",
    archivoFirmadoNombre: null,
  },
];

function Permisos() {
  const [permisos, setPermisos] = useState(MOCK_PERMISOS);

  // Vista modal nuevo
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Modal detalle
  const [selectedPermiso, setSelectedPermiso] = useState(null);

  // Formulario nuevo permiso
  const [formNuevo, setFormNuevo] = useState({
    dpi: "",
    empleado: "",
    dependencia: "",
    tipo: "Personal",
    fechaInicio: "",
    fechaFin: "",
    motivo: "",
  });

  // Filtros pantalla principal
  const [filterDpi, setFilterDpi] = useState("");
  const [filterFechaDesde, setFilterFechaDesde] = useState("");
  const [filterFechaHasta, setFilterFechaHasta] = useState("");

  // Resumen (sobre todos los permisos, no filtrados)
  const total = permisos.length;
  const pendientes = permisos.filter((p) => p.estado === "Pendiente").length;
  const aprobadas = permisos.filter((p) => p.estado === "Aprobado").length;
  const rechazadas = permisos.filter((p) => p.estado === "Rechazado").length;

  /* =====================================
   * Filtros por DPI y rango de fechas
   * ===================================== */

  const permisosFiltrados = permisos.filter((p) => {
    const termDpi = filterDpi.trim();
    const matchDpi =
      !termDpi || (p.dpi && p.dpi.includes(termDpi));

    // Usamos fechaInicio para el filtro por fechas
    const baseDate = p.fechaInicio;

    const matchDesde =
      !filterFechaDesde || baseDate >= filterFechaDesde;

    const matchHasta =
      !filterFechaHasta || baseDate <= filterFechaHasta;

    return matchDpi && matchDesde && matchHasta;
  });

  const handleLimpiarFiltros = () => {
    setFilterDpi("");
    setFilterFechaDesde("");
    setFilterFechaHasta("");
  };

  /* =====================
     Alta de nuevo permiso
     ===================== */

  const handleOpenCreate = () => setIsCreateOpen(true);
  const handleCloseCreate = () => {
    setIsCreateOpen(false);
    setFormNuevo({
      dpi: "",
      empleado: "",
      dependencia: "",
      tipo: "Personal",
      fechaInicio: "",
      fechaFin: "",
      motivo: "",
    });
  };

  const handleChangeNuevo = (e) => {
    const { name, value } = e.target;
    setFormNuevo((prev) => ({ ...prev, [name]: value }));
  };

  const handleBuscarEmpleadoPorDpi = () => {
    const dpiBuscado = formNuevo.dpi.trim();
    if (!dpiBuscado) {
      alert("Ingrese un DPI para buscar.");
      return;
    }

    // Más adelante esto será una llamada al backend.
    const empleado = MOCK_EMPLEADOS.find(
      (emp) => emp.dpi === dpiBuscado
    );

    if (!empleado) {
      alert(
        "No se encontró ningún empleado con ese DPI en la base de datos."
      );
      setFormNuevo((prev) => ({
        ...prev,
        empleado: "",
        dependencia: "",
      }));
      return;
    }

    setFormNuevo((prev) => ({
      ...prev,
      empleado: empleado.nombreCompleto,
      dependencia: empleado.dependencia,
    }));
  };

  const handleSubmitNuevo = (e) => {
    e.preventDefault();

    if (!formNuevo.dpi || !formNuevo.empleado) {
      alert(
        "Debe seleccionar un empleado válido (buscar por DPI) antes de guardar el permiso."
      );
      return;
    }

    const hoy = new Date();
    const fechaSolicitud = hoy.toISOString().slice(0, 10);

    const nuevoPermiso = {
      id: Date.now(),
      dpi: formNuevo.dpi,
      empleado: formNuevo.empleado,
      dependencia: formNuevo.dependencia,
      tipo: formNuevo.tipo,
      fechaInicio: formNuevo.fechaInicio,
      fechaFin: formNuevo.fechaFin || formNuevo.fechaInicio,
      motivo: formNuevo.motivo,
      fechaSolicitud,
      estado: "Pendiente",
      archivoFirmadoNombre: null,
    };

    setPermisos((prev) => [nuevoPermiso, ...prev]);
    alert(
      "Permiso registrado en estado PENDIENTE (solo UI, la conexión al backend se hará después)."
    );
    handleCloseCreate();
  };

  /* =====================
     Revisión de permiso
     ===================== */

  const handleOpenDetalle = (permiso) => {
    setSelectedPermiso({ ...permiso });
  };

  const handleCloseDetalle = () => setSelectedPermiso(null);

  const handleChangeDetalle = (e) => {
    const { name, value } = e.target;
    setSelectedPermiso((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadFirmado = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedPermiso((prev) => ({
      ...prev,
      archivoFirmadoNombre: file.name,
    }));
  };

  const handleGuardarDetalle = () => {
    if (!selectedPermiso) return;

    setPermisos((prev) =>
      prev.map((p) =>
        p.id === selectedPermiso.id ? { ...selectedPermiso } : p
      )
    );

    alert("Cambios guardados (solo UI, falta conectar al backend).");
    handleCloseDetalle();
  };

  const handleImprimirConstancia = () => {
    window.print();
  };

  return (
    <div className="page">
      {/* Encabezado */}
      <div className="page-header">
        <div>
          <h2 className="page__title">Permisos</h2>
          <p className="page__subtitle">
            Gestión de solicitudes de permisos.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={handleOpenCreate}
        >
          + Nuevo Permiso
        </button>
      </div>

      {/* Resumen superior */}
      <div className="permisos-summary">
        <div className="permisos-summary-card">
          <div>
            <p className="permisos-summary-card__label">
              Total Solicitudes
            </p>
            <p className="permisos-summary-card__value">{total}</p>
          </div>
          <div className="permisos-summary-card__icon permisos-summary-card__icon--blue">
            <RiCalendarLine />
          </div>
        </div>

        <div className="permisos-summary-card">
          <div>
            <p className="permisos-summary-card__label">Pendientes</p>
            <p className="permisos-summary-card__value">{pendientes}</p>
          </div>
          <div className="permisos-summary-card__icon permisos-summary-card__icon--yellow">
            <RiTimeLine />
          </div>
        </div>

        <div className="permisos-summary-card">
          <div>
            <p className="permisos-summary-card__label">Aprobadas</p>
            <p className="permisos-summary-card__value">{aprobadas}</p>
          </div>
          <div className="permisos-summary-card__icon permisos-summary-card__icon--green">
            <RiCheckLine />
          </div>
        </div>

        <div className="permisos-summary-card">
          <div>
            <p className="permisos-summary-card__label">Rechazadas</p>
            <p className="permisos-summary-card__value">
              {rechazadas}
            </p>
          </div>
          <div className="permisos-summary-card__icon permisos-summary-card__icon--red">
            <RiCloseLine />
          </div>
        </div>
      </div>

      {/* Filtros por DPI y fechas */}
      <div className="permisos-filters">
        <div className="permisos-filters__group">
          <label className="permisos-filters__label">DPI</label>
          <input
            type="text"
            className="form-input"
            placeholder="Buscar por DPI..."
            value={filterDpi}
            onChange={(e) => setFilterDpi(e.target.value)}
          />
        </div>

        <div className="permisos-filters__group">
          <label className="permisos-filters__label">
            Fecha desde
          </label>
          <input
            type="date"
            className="form-input"
            value={filterFechaDesde}
            onChange={(e) => setFilterFechaDesde(e.target.value)}
          />
        </div>

        <div className="permisos-filters__group">
          <label className="permisos-filters__label">Fecha hasta</label>
          <input
            type="date"
            className="form-input"
            value={filterFechaHasta}
            onChange={(e) => setFilterFechaHasta(e.target.value)}
          />
        </div>

        <div className="permisos-filters__group permisos-filters__group--button">
          <button
            type="button"
            className="btn-ghost"
            onClick={handleLimpiarFiltros}
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Tabla de solicitudes */}
      <div className="permisos-table-card">
        <div className="permisos-table-card__header">
          <h3 className="permisos-table-card__title">
            Solicitudes de Permisos
          </h3>
        </div>

        <div className="permisos-table__wrapper">
          <table className="permisos-table">
            <thead>
              <tr>
                <th>DPI</th>
                <th>Empleado</th>
                <th>Dependencia</th>
                <th>Tipo</th>
                <th>Fecha inicio</th>
                <th>Fecha fin</th>
                <th>Motivo</th>
                <th>Fecha solicitud</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {permisosFiltrados.map((p) => (
                <tr key={p.id}>
                  <td>{p.dpi}</td>
                  <td>{p.empleado}</td>
                  <td>{p.dependencia}</td>
                  <td>{p.tipo}</td>
                  <td>{p.fechaInicio}</td>
                  <td>{p.fechaFin}</td>
                  <td>{p.motivo}</td>
                  <td>{p.fechaSolicitud}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        p.estado === "Pendiente"
                          ? "status-badge--pending"
                          : p.estado === "Aprobado"
                          ? "status-badge--approved"
                          : "status-badge--rejected"
                      }`}
                    >
                      {p.estado}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-small"
                      onClick={() => handleOpenDetalle(p)}
                    >
                      Revisar
                    </button>
                  </td>
                </tr>
              ))}

              {permisosFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    style={{ textAlign: "center", padding: "1rem" }}
                  >
                    No se encontraron solicitudes con los filtros
                    actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal NUEVO permiso */}
      {isCreateOpen && (
        <div
          className="modal-backdrop"
          onClick={handleCloseCreate}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <h3>Nuevo Permiso</h3>
              <button
                type="button"
                className="icon-button icon-button--ghost"
                onClick={handleCloseCreate}
              >
                ✕
              </button>
            </div>

            <div className="modal__body">
              {/* Datos del empleado (vinculado a empleados) */}
              <h4 className="modal-permiso__section-title">
                Datos del empleado
              </h4>
              <div className="form-grid-two">
                <div className="form-group">
                  <label className="form-label">DPI</label>
                  <div className="form-inline">
                    <input
                      type="text"
                      name="dpi"
                      className="form-input"
                      placeholder="Ej. 3012345670202"
                      value={formNuevo.dpi}
                      onChange={handleChangeNuevo}
                    />
                    <button
                      type="button"
                      className="btn-ghost form-inline__btn"
                      onClick={handleBuscarEmpleadoPorDpi}
                    >
                      Buscar
                    </button>
                  </div>
                  <p className="form-help">
                    El sistema buscará al empleado en la base de datos
                    de RRHH.
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Dependencia / Departamento
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formNuevo.dependencia}
                    readOnly
                    placeholder="Se completa automáticamente"
                  />
                </div>

                <div className="form-group form-group--full">
                  <label className="form-label">Nombre completo</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formNuevo.empleado}
                    readOnly
                    placeholder="Se completa automáticamente"
                  />
                </div>
              </div>

              <hr className="modal-divider" />

              {/* Datos del permiso */}
              <h4 className="modal-permiso__section-title">
                Detalle del permiso
              </h4>
              <form
                className="form-grid-two"
                onSubmit={handleSubmitNuevo}
              >
                <div className="form-group">
                  <label className="form-label">Tipo</label>
                  <select
                    name="tipo"
                    className="form-input"
                    value={formNuevo.tipo}
                    onChange={handleChangeNuevo}
                  >
                    <option value="Personal">Personal</option>
                    <option value="Enfermedad">Enfermedad</option>
                    <option value="Duelo">Duelo</option>
                    <option value="Maternidad/Paternidad">
                      Maternidad/Paternidad
                    </option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Fecha inicio
                  </label>
                  <input
                    type="date"
                    name="fechaInicio"
                    className="form-input"
                    value={formNuevo.fechaInicio}
                    onChange={handleChangeNuevo}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Fecha fin</label>
                  <input
                    type="date"
                    name="fechaFin"
                    className="form-input"
                    value={formNuevo.fechaFin}
                    onChange={handleChangeNuevo}
                  />
                </div>

                <div className="form-group form-group--full">
                  <label className="form-label">Motivo</label>
                  <textarea
                    name="motivo"
                    className="form-input"
                    rows={3}
                    placeholder="Describe brevemente el motivo del permiso"
                    value={formNuevo.motivo}
                    onChange={handleChangeNuevo}
                    required
                  />
                </div>
              </form>
            </div>

            <div className="modal__footer">
              <button
                type="button"
                className="btn-ghost"
                onClick={handleCloseCreate}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSubmitNuevo}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal DETALLE / revisión */}
      {selectedPermiso && (
        <div
          className="modal-backdrop"
          onClick={handleCloseDetalle}
        >
          <div
            className="modal modal--large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <h3>Revisión de Permiso</h3>
              <button
                type="button"
                className="icon-button icon-button--ghost"
                onClick={handleCloseDetalle}
              >
                ✕
              </button>
            </div>

            <div className="modal__body modal-permiso">
              {/* Bloque izquierda: datos */}
              <div className="modal-permiso__info">
                <h4 className="modal-permiso__section-title">
                  Datos de la solicitud
                </h4>

                <div className="modal-employee__row">
                  <div>
                    <p className="modal-label">DPI</p>
                    <p className="modal-value">
                      {selectedPermiso.dpi}
                    </p>
                  </div>
                  <div>
                    <p className="modal-label">Dependencia</p>
                    <p className="modal-value">
                      {selectedPermiso.dependencia}
                    </p>
                  </div>
                </div>

                <div className="modal-employee__row">
                  <div className="modal-employee__row--full">
                    <p className="modal-label">Empleado</p>
                    <p className="modal-value">
                      {selectedPermiso.empleado}
                    </p>
                  </div>
                </div>

                <div className="modal-employee__row">
                  <div>
                    <p className="modal-label">Tipo</p>
                    <p className="modal-value">
                      {selectedPermiso.tipo}
                    </p>
                  </div>
                  <div>
                    <p className="modal-label">Fecha solicitud</p>
                    <p className="modal-value">
                      {selectedPermiso.fechaSolicitud}
                    </p>
                  </div>
                </div>

                <div className="modal-employee__row">
                  <div>
                    <p className="modal-label">Fecha inicio</p>
                    <p className="modal-value">
                      {selectedPermiso.fechaInicio}
                    </p>
                  </div>
                  <div>
                    <p className="modal-label">Fecha fin</p>
                    <p className="modal-value">
                      {selectedPermiso.fechaFin}
                    </p>
                  </div>
                </div>

                <div className="modal-employee__row modal-employee__row--full">
                  <div>
                    <p className="modal-label">Motivo</p>
                    <p className="modal-value">
                      {selectedPermiso.motivo}
                    </p>
                  </div>
                </div>

                <div className="modal-employee__row">
                  <div>
                    <p className="modal-label">Estado actual</p>
                    <select
                      name="estado"
                      className="form-input"
                      value={selectedPermiso.estado}
                      onChange={handleChangeDetalle}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Aprobado">Aprobado</option>
                      <option value="Rechazado">Rechazado</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bloque derecha: constancia y archivo */}
              <div className="modal-permiso__doc">
                <h4 className="modal-permiso__section-title">
                  Constancia y respaldo
                </h4>

                {/* Vista previa de constancia */}
                <div className="constancia-preview">
                  <div className="constancia-preview__header">
                    <div className="constancia-preview__logo">
                      LOGO
                    </div>
                    <div>
                      <p className="constancia-preview__muni">
                        Municipalidad de Ejemplo
                      </p>
                      <p className="constancia-preview__title">
                        CONSTANCIA DE PERMISO
                      </p>
                    </div>
                  </div>

                  <div className="constancia-preview__body">
                    <p>
                      Se hace constar que el/la colaborador(a){" "}
                      <strong>{selectedPermiso.empleado}</strong>, con
                      DPI <strong>{selectedPermiso.dpi}</strong>, adscrito
                      a la dependencia de{" "}
                      <strong>{selectedPermiso.dependencia}</strong>,
                      solicitó permiso de tipo{" "}
                      <strong>{selectedPermiso.tipo}</strong> del{" "}
                      <strong>{selectedPermiso.fechaInicio}</strong> al{" "}
                      <strong>{selectedPermiso.fechaFin}</strong>, por
                      el motivo de:{" "}
                      <strong>{selectedPermiso.motivo}</strong>.
                    </p>

                    <p style={{ marginTop: "0.75rem" }}>
                      Para los efectos que al interesado convengan se
                      extiende la presente constancia.
                    </p>

                    <div className="constancia-preview__firmas">
                      <div>
                        <div className="constancia-preview__line" />
                        <p>Firma del Empleado</p>
                      </div>
                      <div>
                        <div className="constancia-preview__line" />
                        <p>Vo. Bo. Jefe Inmediato</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-permiso__actions">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={handleImprimirConstancia}
                  >
                    <RiPrinterLine />
                    Imprimir constancia
                  </button>
                </div>

                <div className="form-group" style={{ marginTop: "1rem" }}>
                  <label className="form-label">
                    Permiso firmado (escaneado)
                  </label>
                  <div className="file-input-wrapper">
                    <label className="file-input-label">
                      <RiUpload2Line />
                      <span>Subir archivo</span>
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={handleUploadFirmado}
                      />
                    </label>
                    <p className="file-input-help">
                      Formato PDF o imagen (JPG, PNG). Tamaño recomendado
                      &lt; 5 MB.
                    </p>
                    {selectedPermiso.archivoFirmadoNombre && (
                      <p className="file-input-current">
                        Archivo cargado:{" "}
                        <strong>
                          {selectedPermiso.archivoFirmadoNombre}
                        </strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal__footer">
              <button
                type="button"
                className="btn-ghost"
                onClick={handleCloseDetalle}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleGuardarDetalle}
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Permisos;
