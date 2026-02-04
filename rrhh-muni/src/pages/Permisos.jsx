// src/pages/Permisos.jsx
import { useEffect, useState, useCallback } from "react";
import {
  RiCalendarLine,
  RiTimeLine,
  RiCheckLine,
  RiCloseLine,
  RiPrinterLine,
  RiUpload2Line,
} from "react-icons/ri";

const API_URL = "http://localhost:4000/api";
const PERMISOS_FILES_URL = "http://localhost:4000/permisos";
const LOGO_URL = "http://localhost:4000/logos/logoprincipal.png";

function Permisos() {
  const [permisos, setPermisos] = useState([]);

  // Vista modal nuevo
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Modal detalle
  const [selectedPermiso, setSelectedPermiso] = useState(null);

  // Formulario nuevo permiso
  const [formNuevo, setFormNuevo] = useState({
    id_empleado: null,
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

  // =============================
  // Carga inicial de permisos
  // =============================
const loadPermisos = useCallback(async () => {
  try {
    const resp = await fetch(`${API_URL}/permisos`);
    if (!resp.ok) throw new Error("Error al cargar permisos");

    const data = await resp.json();

    const toDate = (value) =>
      value ? String(value).slice(0, 10) : "";

    const adaptados = (Array.isArray(data) ? data : []).map((p) => {
      const nombreEmpleado =
        p.nombre_empleado || p.empleado || p.nombreCompleto || "";

      return {
        id: p.id_permiso || p.id,
        dpi: p.dpi,
        empleado: nombreEmpleado,
        dependencia: p.dependencia,
        tipo: p.tipo,
        fechaInicio: toDate(p.fecha_inicio || p.fechaInicio),
        fechaFin: toDate(p.fecha_fin || p.fechaFin),
        motivo: p.motivo,
        fechaSolicitud: toDate(
          p.fecha_solicitud || p.fechaSolicitud
        ),
        estado: p.estado || "Pendiente",
        archivoFirmadoNombre: p.archivo_firmado || p.archivoFirmadoNombre || null,
      };
    });

    setPermisos(adaptados);
  } catch (error) {
    console.error(error);
    alert("Error al cargar permisos");
  }
}, []);

  useEffect(() => {
    loadPermisos();
  }, [loadPermisos]);

  // Resumen (sobre todos los permisos)
  const total = permisos.length;
  const pendientes = permisos.filter((p) => p.estado === "Pendiente").length;
  const aprobadas = permisos.filter((p) => p.estado === "Aprobado").length;
  const rechazadas = permisos.filter((p) => p.estado === "Rechazado").length;

  /* =====================================
   * Filtros por DPI y rango de fechas
   * ===================================== */

  const permisosFiltrados = permisos.filter((p) => {
    const termDpi = filterDpi.trim();
    const matchDpi = !termDpi || (p.dpi && p.dpi.includes(termDpi));

    const baseDate = p.fechaInicio; // usamos fechaInicio para filtrar

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
      id_empleado: null,
      dpi: "",
      empleado: "",
      dependencia: "",
      tipo: "",
      fechaInicio: "",
      fechaFin: "",
      motivo: "",
    });
  };

  const handleChangeNuevo = (e) => {
    const { name, value } = e.target;
    setFormNuevo((prev) => ({ ...prev, [name]: value }));
  };

  const handleBuscarEmpleadoPorDpi = async () => {
    const dpiBuscado = formNuevo.dpi.trim();
    if (!dpiBuscado) {
      alert("Ingrese un DPI para buscar.");
      return;
    }

    try {
      const resp = await fetch(
        `${API_URL}/empleados/buscar-por-dpi/${dpiBuscado}`
      );
      if (!resp.ok) {
        if (resp.status === 404) {
          alert("No se encontró ningún empleado con ese DPI.");
        } else {
          alert("Error al buscar empleado por DPI.");
        }
        setFormNuevo((prev) => ({
          ...prev,
          id_empleado: null,
          empleado: "",
          dependencia: "",
        }));
        return;
      }

      const empleado = await resp.json();

      setFormNuevo((prev) => ({
        ...prev,
        id_empleado: empleado.id_empleado,
        dpi: empleado.dpi,
        empleado: empleado.nombreCompleto,
        dependencia: empleado.dependencia || "",
      }));
    } catch (error) {
      console.error(error);
      alert("Error de conexión al buscar el empleado.");
    }
  };

  const handleSubmitNuevo = async (e) => {
    e.preventDefault();

    if (
      !formNuevo.dpi.trim() ||
      !formNuevo.tipo.trim() ||
      !formNuevo.fechaInicio ||
      !formNuevo.motivo.trim()
    ) {
      alert("Faltan datos obligatorios (dpi, tipo, fechaInicio, motivo).");
      return;
    }

    try {
      const resp = await fetch(`${API_URL}/permisos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dpi: formNuevo.dpi,
          tipo: formNuevo.tipo,
          fechaInicio: formNuevo.fechaInicio,
          fechaFin: formNuevo.fechaFin || formNuevo.fechaInicio,
          motivo: formNuevo.motivo,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || "Error al crear permiso");
      }

      await loadPermisos(); // 🔄 refresca lista desde BD
      handleCloseCreate();
      alert("Permiso registrado correctamente.");
    } catch (error) {
      console.error(error);
      alert(error.message || "Error al crear permiso.");
    }
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

  const handleGuardarDetalle = async () => {
    if (!selectedPermiso) return;

    try {
      const resp = await fetch(
        `${API_URL}/permisos/${selectedPermiso.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            estado: selectedPermiso.estado,
          }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || "Error al actualizar permiso");
      }

      setPermisos((prev) =>
        prev.map((p) =>
          p.id === selectedPermiso.id
            ? {
                ...p,
                estado: selectedPermiso.estado,
                archivoFirmadoNombre:
                  selectedPermiso.archivoFirmadoNombre ?? p.archivoFirmadoNombre,
              }
            : p
        )
      );

      alert("Cambios guardados correctamente.");
      handleCloseDetalle();
    } catch (error) {
      console.error("Error al actualizar permiso:", error);
      alert(error.message || "Error al actualizar permiso.");
    }
  };

  const handleUploadFirmado = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPermiso) return;

    try {
      const formData = new FormData();
      formData.append("archivo", file);
      formData.append("dpi", selectedPermiso.dpi);

      const resp = await fetch(
        `${API_URL}/permisos/${selectedPermiso.id}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || "Error al subir archivo.");
      }

     const data = await resp.json();
console.log("DEBUG upload respuesta backend:", data);

// Intentamos varias posibles propiedades que pueda devolver el backend
const nombreArchivo =
  data.archivoFirmadoNombre ??
  data.archivo_firmado ??
  data.filename ??
  data.fileName ??
  data.archivo ??
  data.file;

// Si AÚN así no viene nada, no rompemos la UI, solo avisamos
if (!nombreArchivo) {
  console.warn(
    "La respuesta del servidor no trae nombre de archivo. Respuesta:",
    data
  );
  alert(
    "El archivo se subió, pero el servidor no devolvió el nombre. Revisa la ruta POST /permisos/:id/upload."
  );
  return;
}

// ✅ Actualizamos el permiso en el modal
setSelectedPermiso((prev) =>
  prev
    ? {
        ...prev,
        archivoFirmadoNombre: nombreArchivo,
      }
    : prev
);

// ✅ Y en la tabla
setPermisos((prev) =>
  prev.map((p) =>
    p.id === selectedPermiso.id
      ? { ...p, archivoFirmadoNombre: nombreArchivo }
      : p
  )
);

alert("Archivo firmado subido correctamente.");

    } catch (error) {
      console.error(error);
      alert(error.message || "Error al subir el archivo firmado.");
    }
  };

  /* =====================
     Imprimir constancia
     ===================== */

  const handleImprimirConstancia = () => {
    if (!selectedPermiso) return;

    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) {
      alert("El navegador bloqueó la ventana de impresión.");
      return;
    }

    const p = selectedPermiso;

    w.document.write(`
      <html>
        <head>
          <title>Constancia de permiso</title>
          <style>
            @page {
              size: letter;
              margin: 2.5cm;
            }
            body {
              font-family: Arial, sans-serif;
              color: #111827;
              font-size: 13px;
              line-height: 1.6;
            }
            .header {
              display: flex;
              align-items: center;
              margin-bottom: 24px;
            }
            .logo {
              margin-right: 16px;
            }
            .logo img {
              height: 80px;
            }
            .title h1 {
              margin: 0;
              font-size: 18px;
              text-transform: uppercase;
            }
            .title h2 {
              margin: 4px 0 0;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .content p {
              text-align: justify;
            }
            .meta {
              margin-top: 12px;
              font-size: 12px;
              color: #4b5563;
            }
            .firmas {
              margin-top: 60px;
              display: flex;
              justify-content: space-between;
            }
            .firmas .col {
              width: 45%;
              text-align: center;
            }
            .line {
              border-top: 1px solid #111827;
              margin-bottom: 4px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">
              <img src="${LOGO_URL}" alt="Logo Municipalidad" />
            </div>
            <div class="title">
              <h1>Municipalidad de San José Acatempa</h1>
              <h1>¡No Paramos de Trabajar!</h1>
              <h2>Constancia de Permiso</h2>
            </div>
          </div>

          <div class="content">
            <p>
              Se hace constar que el/la colaborador(a) <strong>${p.empleado}</strong>,
              con DPI <strong>${p.dpi}</strong>, adscrito(a) a la dependencia de
              <strong> ${p.dependencia}</strong>, solicitó un permiso de tipo
              <strong> ${p.tipo}</strong> del día <strong>${p.fechaInicio}</strong>
              al <strong>${p.fechaFin}</strong>, por el motivo:
              <strong> ${p.motivo}</strong>.
            </p>
            <p>
              Para los efectos legales y administrativos que al interesado convengan,
              se extiende la presente en la fecha de su emisión.
            </p>
            <p class="meta">
              Fecha de solicitud: ${p.fechaSolicitud}
            </p>
          </div>

          <div class="firmas">
            <div class="col">
              <div class="line"></div>
              <div>Firma del Empleado</div>
            </div>
            <div class="col">
              <div class="line"></div>
              <div>Vo. Bo. Jefe Inmediato</div>
            </div>
          </div>
        </body>
      </html>
    `);

    w.document.close();
    w.focus();
    w.print();
  };

  /* =====================
     Render
     ===================== */

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

                {/* Vista previa de constancia simple */}
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
                          <a
                            href={`${PERMISOS_FILES_URL}/${selectedPermiso.archivoFirmadoNombre}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {selectedPermiso.archivoFirmadoNombre}
                          </a>
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
