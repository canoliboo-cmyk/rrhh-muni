// src/pages/Bonificaciones.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  RiLineChartLine,
  RiEditLine,
  RiDeleteBinLine,
  RiAddLine,
  RiSearchLine,
} from "react-icons/ri";

const API_URL = "http://localhost:4000/api";

const initialForm = {
  id: null,
  nombre: "",
  tipo: "MONTO",
  valor: "",
  descripcion: "",
  destino: "todos",
  activo: true,
};

function Bonificaciones() {
  const [bonos, setBonos] = useState([]);
  const [renglones, setRenglones] = useState([]);

  // Modal crear/editar
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  // Modal asignar
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignMode, setAssignMode] = useState(null); // 'renglon' | 'individual'
  const [bonoSeleccionado, setBonoSeleccionado] = useState(null);
  const [selectedRenglonesIds, setSelectedRenglonesIds] = useState([]);
  const [buscarEmpleadoTexto, setBuscarEmpleadoTexto] = useState("");
  const [empleadosBusqueda, setEmpleadosBusqueda] = useState([]);
  const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState([]);
  const [loadingAsignar, setLoadingAsignar] = useState(false);

  // ============================
  // CARGA INICIAL
  // ============================
  useEffect(() => {
    const load = async () => {
      try {
        const [bonosRes, rengRes] = await Promise.all([
          fetch(`${API_URL}/bonificaciones`),
          fetch(`${API_URL}/renglones`),
        ]);
        const bonosData = await bonosRes.json();
        const rengData = await rengRes.json();
        setBonos(bonosData);
        setRenglones(rengData);
      } catch (error) {
        console.error("Error al cargar bonificaciones o renglones:", error);
        alert("Error al cargar bonificaciones o renglones.");
      }
    };

    load();
  }, []);

  // ============================
  // RESUMEN
  // ============================
  const resumen = useMemo(() => {
    const total = bonos.length;
    const activas = bonos.filter((b) => b.activo).length;
    const inactivas = total - activas;
    return { total, activas, inactivas };
  }, [bonos]);

  // ============================
  // MODAL NUEVO / EDITAR
  // ============================
  const openNewModal = () => {
    setForm(initialForm);
    setShowModal(true);
  };

  const openEditModal = (bono) => {
    let destino = bono.destino || "todos";
    if (!destino || destino === "otros") {
      if (bono.aplica_a_todos) destino = "todos";
      else if (bono.aplica_por_renglon) destino = "renglon";
      else if (bono.aplica_individual) destino = "individual";
    }

    setForm({
      id: bono.id,
      nombre: bono.nombre,
      tipo: bono.tipo,
      valor: bono.valor.toString(),
      descripcion: bono.descripcion || "",
      destino,
      activo: bono.activo,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    if (loading) return;
    setShowModal(false);
  };

  const handleChangeForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ============================
  // TOGGLE ACTIVO
  // ============================
  const handleToggleActivo = async (id) => {
    try {
      const bono = bonos.find((b) => b.id === id);
      if (!bono) return;
      const nuevoActivo = !bono.activo;

      const resp = await fetch(`${API_URL}/bonificaciones/${id}/activo`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: nuevoActivo }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || "Error al cambiar estado");
      }

      setBonos((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, activo: nuevoActivo } : b
        )
      );
    } catch (error) {
      console.error("Error al cambiar estado de bonificación:", error);
      alert(error.message || "Error al cambiar estado de la bonificación.");
    }
  };

  // ============================
  // ELIMINAR
  // ============================
  const handleDelete = async (id) => {
    const confirmar = window.confirm(
      "¿Deseas eliminar esta bonificación? Esta acción no se puede deshacer."
    );
    if (!confirmar) return;

    try {
      const resp = await fetch(`${API_URL}/bonificaciones/${id}`, {
        method: "DELETE",
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || "Error al eliminar bonificación");
      }

      setBonos((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      console.error("Error al eliminar bonificación:", error);
      alert(error.message || "Error al eliminar bonificación.");
    }
  };

  // ============================
  // SUBMIT CREAR / EDITAR
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!form.nombre.trim()) {
        throw new Error("Ingresa un nombre para la bonificación.");
      }
      if (!form.valor || Number(form.valor) <= 0) {
        throw new Error("Ingresa un monto o porcentaje válido.");
      }

      const isEdit = !!form.id;
      const url = isEdit
        ? `${API_URL}/bonificaciones/${form.id}`
        : `${API_URL}/bonificaciones`;
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        nombre: form.nombre.trim(),
        tipo: form.tipo,
        valor: form.valor,
        descripcion: form.descripcion || null,
        destino: form.destino,
        activo: form.activo,
      };

      const resp = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || "Error al guardar bonificación");
      }

      if (!isEdit) {
        const nueva = await resp.json();
        setBonos((prev) => [...prev, nueva]);
      } else {
        setBonos((prev) =>
          prev.map((b) =>
            b.id === form.id
              ? {
                  ...b,
                  nombre: payload.nombre,
                  tipo: payload.tipo,
                  valor: Number(payload.valor),
                  descripcion: payload.descripcion,
                  destino: payload.destino,
                  activo: payload.activo,
                }
              : b
          )
        );
      }

      alert(
        isEdit
          ? "Bonificación actualizada correctamente."
          : "Bonificación creada correctamente."
      );
      setShowModal(false);
      setForm(initialForm);
    } catch (error) {
      console.error("Error al guardar bonificación:", error);
      alert(error.message || "Error al guardar la bonificación.");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // MODAL ASIGNAR (por renglón / individual)
  // ============================
  const openAssignModal = async (bono) => {
    if (bono.destino === "todos") {
      alert("Esta bonificación aplica a todo el personal, no requiere asignación.");
      return;
    }

    setBonoSeleccionado(bono);
    setAssignMode(bono.destino);
    setSelectedRenglonesIds([]);
    setEmpleadosBusqueda([]);
    setEmpleadosSeleccionados([]);
    setBuscarEmpleadoTexto("");
    setShowAssignModal(true);

    try {
      if (bono.destino === "renglon") {
        const resp = await fetch(
          `${API_URL}/bonificaciones/${bono.id}/renglones`
        );
        const data = await resp.json();
        setSelectedRenglonesIds(data || []);
      } else if (bono.destino === "individual") {
        const resp = await fetch(
          `${API_URL}/bonificaciones/${bono.id}/empleados`
        );
        const data = await resp.json();
        setEmpleadosSeleccionados(data || []);
      }
    } catch (error) {
      console.error("Error cargando asignaciones:", error);
      alert("Error al cargar asignaciones del bono.");
    }
  };

  const closeAssignModal = () => {
    if (loadingAsignar) return;
    setShowAssignModal(false);
  };

  // --- Renglones ---
  const toggleRenglonSeleccionado = (idRenglon) => {
    setSelectedRenglonesIds((prev) =>
      prev.includes(idRenglon)
        ? prev.filter((id) => id !== idRenglon)
        : [...prev, idRenglon]
    );
  };

  // --- Empleados: búsqueda y selección ---
  const handleBuscarEmpleados = async () => {
    const term = buscarEmpleadoTexto.trim();
    if (!term) return;

    try {
      const resp = await fetch(
        `${API_URL}/empleados/buscar?q=${encodeURIComponent(term)}`
      );
      const data = await resp.json();
      setEmpleadosBusqueda(data || []);
    } catch (error) {
      console.error("Error buscando empleados:", error);
      alert("Error al buscar empleados por DPI / nombre.");
    }
  };

  const agregarEmpleadoSeleccionado = (emp) => {
    setEmpleadosSeleccionados((prev) => {
      if (prev.some((e) => e.id_empleado === emp.id_empleado)) {
        return prev;
      }
      return [...prev, emp];
    });
  };

  const quitarEmpleadoSeleccionado = (idEmpleado) => {
    setEmpleadosSeleccionados((prev) =>
      prev.filter((e) => e.id_empleado !== idEmpleado)
    );
  };

  const handleGuardarAsignaciones = async () => {
    if (!bonoSeleccionado) return;
    setLoadingAsignar(true);

    try {
      if (assignMode === "renglon") {
        const resp = await fetch(
          `${API_URL}/bonificaciones/${bonoSeleccionado.id}/renglones`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idsRenglones: selectedRenglonesIds,
            }),
          }
        );

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.message || "Error al asignar renglones");
        }
      } else if (assignMode === "individual") {
        const ids = empleadosSeleccionados.map((e) => e.id_empleado);
        const resp = await fetch(
          `${API_URL}/bonificaciones/${bonoSeleccionado.id}/empleados`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idsEmpleados: ids,
            }),
          }
        );

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.message || "Error al asignar empleados");
        }
      }

      alert("Asignaciones guardadas correctamente.");
      setShowAssignModal(false);
    } catch (error) {
      console.error("Error al guardar asignaciones:", error);
      alert(error.message || "Error al guardar asignaciones.");
    } finally {
      setLoadingAsignar(false);
    }
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div className="page">
      <div className="empleados-header">
        <div>
          <h2 className="page__title">Bonificaciones</h2>
          <p className="page__subtitle">
            Gestión de bonos y bonificaciones municipales.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={openNewModal}
        >
          <RiAddLine />
          Nueva Bonificación
        </button>
      </div>

      {/* Tarjetas de bonificaciones */}
      <section className="bonos-grid">
        {bonos.map((bono) => (
          <article key={bono.id} className="bono-card">
            <div className="bono-card__header">
              <div className="bono-card__icon">
                <RiLineChartLine />
              </div>
              <div>
                <p className="bono-card__title">{bono.nombre}</p>
                <span className="bono-card__badge">
                  {bono.tipo === "MONTO" ? "Monto Fijo" : "Porcentaje"}
                </span>
              </div>
            </div>

            <div className="bono-card__body">
              <p className="bono-card__amount">
                {bono.tipo === "MONTO"
                  ? `Q${bono.valor.toLocaleString("es-GT", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : `${bono.valor}%`}
              </p>
              <p className="bono-card__description">
                {bono.descripcion ||
                  (bono.destino === "todos"
                    ? "Aplica a todo el personal activo"
                    : bono.destino === "renglon"
                    ? "Aplica por renglón"
                    : bono.destino === "individual"
                    ? "Aplica a empleados específicos"
                    : "")}
              </p>
            </div>

            <div className="bono-card__footer">
              <div className="toggle-wrapper">
                <button
                  type="button"
                  className={`toggle-switch ${
                    bono.activo ? "toggle-switch--on" : ""
                  }`}
                  onClick={() => handleToggleActivo(bono.id)}
                >
                  <span className="toggle-switch__thumb" />
                </button>
                <span className="toggle-switch__label">
                  {bono.activo ? "Activo" : "Inactivo"}
                </span>
              </div>

              <div className="bono-card__actions">
                {bono.destino !== "todos" && (
                  <button
                    type="button"
                    className="btn-ghost btn-ghost--sm"
                    onClick={() => openAssignModal(bono)}
                  >
                    Asignar
                  </button>
                )}

                <button
                  type="button"
                  className="icon-button"
                  title="Editar bonificación"
                  onClick={() => openEditModal(bono)}
                >
                  <RiEditLine />
                </button>
                <button
                  type="button"
                  className="icon-button icon-button--danger"
                  title="Eliminar bonificación"
                  onClick={() => handleDelete(bono.id)}
                >
                  <RiDeleteBinLine />
                </button>
              </div>
            </div>
          </article>
        ))}

        {bonos.length === 0 && (
          <p style={{ marginTop: "1rem" }}>
            No hay bonificaciones registradas todavía.
          </p>
        )}
      </section>

      {/* Resumen inferior */}
      <section className="section-card bonificaciones-resumen">
        <h3 className="section-card__title">Resumen de Bonificaciones</h3>

        <div className="bonificaciones-resumen__grid">
          <div className="summary-card">
            <p className="summary-card__label">Total Bonificaciones</p>
            <p className="summary-card__value summary-card__value--normal">
              {resumen.total}
            </p>
          </div>
          <div className="summary-card summary-card--green">
            <p className="summary-card__label">Activas</p>
            <p className="summary-card__value summary-card__value--normal">
              {resumen.activas}
            </p>
          </div>
          <div className="summary-card summary-card--red">
            <p className="summary-card__label">Inactivas</p>
            <p className="summary-card__value summary-card__value--normal">
              {resumen.inactivas}
            </p>
          </div>
        </div>
      </section>

      {/* Modal Nueva/Editar Bonificación */}
      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <h3>
                {form.id
                  ? "Editar Bonificación"
                  : "Nueva Bonificación"}
              </h3>
              <button
                type="button"
                className="icon-button icon-button--ghost"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>

            <form className="modal__body" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: Bono municipal general"
                  value={form.nombre}
                  onChange={(e) =>
                    handleChangeForm("nombre", e.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select
                  className="form-input"
                  value={form.tipo}
                  onChange={(e) =>
                    handleChangeForm("tipo", e.target.value)
                  }
                >
                  <option value="MONTO">Monto fijo (Q)</option>
                  <option value="PORCENTAJE">Porcentaje (%)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Monto / Porcentaje</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input"
                  placeholder={
                    form.tipo === "MONTO" ? "250" : "10"
                  }
                  value={form.valor}
                  onChange={(e) =>
                    handleChangeForm("valor", e.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Destino</label>
                <select
                  className="form-input"
                  value={form.destino}
                  onChange={(e) =>
                    handleChangeForm("destino", e.target.value)
                  }
                >
                  <option value="todos">Todo el personal</option>
                  <option value="renglon">Por renglón</option>
                  <option value="individual">
                    Empleados específicos
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Describe brevemente la bonificación..."
                  value={form.descripcion}
                  onChange={(e) =>
                    handleChangeForm("descripcion", e.target.value)
                  }
                />
              </div>
            </form>

            <div className="modal__footer">
              <button
                type="button"
                className="btn-ghost"
                onClick={closeModal}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading
                  ? "Guardando..."
                  : form.id
                  ? "Actualizar"
                  : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Asignar */}
      {showAssignModal && bonoSeleccionado && (
        <div className="modal-backdrop" onClick={closeAssignModal}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <h3>
                Asignar{" "}
                {assignMode === "renglon"
                  ? "por renglón"
                  : "a empleados"}
              </h3>
              <button
                type="button"
                className="icon-button icon-button--ghost"
                onClick={closeAssignModal}
              >
                ✕
              </button>
            </div>

            <div className="modal__body">
              <p style={{ marginBottom: "0.75rem" }}>
                <strong>Bonificación:</strong> {bonoSeleccionado.nombre}
              </p>

              {assignMode === "renglon" && (
                <div>
                  <p className="form-label">
                    Selecciona los renglones a los que aplicará el bono:
                  </p>
                  <div className="checkbox-grid">
                    {renglones.map((r) => (
                      <label
                        key={r.id_renglon}
                        className="checkbox-item"
                      >
                        <input
                          type="checkbox"
                          checked={selectedRenglonesIds.includes(
                            r.id_renglon
                          )}
                          onChange={() =>
                            toggleRenglonSeleccionado(r.id_renglon)
                          }
                        />
                        <span>
                          {r.codigo} - {r.nombre}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {assignMode === "individual" && (
                <div>
                  <p className="form-label">
                    Busca empleados por DPI, código o nombre y agrégalos
                    a la lista de asignados.
                  </p>

                  <div className="empleados-search" style={{ marginBottom: "0.75rem" }}>
                    <RiSearchLine className="empleados-search__icon" />
                    <input
                      type="text"
                      className="empleados-search__input"
                      placeholder="Ej: DPI, nombre o código..."
                      value={buscarEmpleadoTexto}
                      onChange={(e) =>
                        setBuscarEmpleadoTexto(e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleBuscarEmpleados();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn-ghost btn-ghost--sm"
                      onClick={handleBuscarEmpleados}
                    >
                      Buscar
                    </button>
                  </div>

                  {empleadosBusqueda.length > 0 && (
                    <div className="section-card" style={{ marginBottom: "0.75rem" }}>
                      <p className="form-label">Resultados de búsqueda</p>
                      <table className="empleados-table">
                        <thead>
                          <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>DPI</th>
                            <th>Renglón</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {empleadosBusqueda.map((emp) => (
                            <tr key={emp.id_empleado}>
                              <td>{emp.codigo_empleado}</td>
                              <td>{emp.nombre}</td>
                              <td>{emp.dpi}</td>
                              <td>{emp.renglon}</td>
                              <td>
                                <button
                                  type="button"
                                  className="btn-ghost btn-ghost--sm"
                                  onClick={() =>
                                    agregarEmpleadoSeleccionado(emp)
                                  }
                                >
                                  Agregar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="section-card">
                    <p className="form-label">Empleados asignados</p>
                    {empleadosSeleccionados.length === 0 ? (
                      <p>No hay empleados asignados aún.</p>
                    ) : (
                      <table className="empleados-table">
                        <thead>
                          <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>DPI</th>
                            <th>Renglón</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {empleadosSeleccionados.map((emp) => (
                            <tr key={emp.id_empleado}>
                              <td>{emp.codigo_empleado}</td>
                              <td>{emp.nombre}</td>
                              <td>{emp.dpi}</td>
                              <td>{emp.renglon}</td>
                              <td>
                                <button
                                  type="button"
                                  className="icon-button icon-button--danger"
                                  onClick={() =>
                                    quitarEmpleadoSeleccionado(
                                      emp.id_empleado
                                    )
                                  }
                                >
                                  <RiDeleteBinLine />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="modal__footer">
              <button
                type="button"
                className="btn-ghost"
                onClick={closeAssignModal}
                disabled={loadingAsignar}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleGuardarAsignaciones}
                disabled={loadingAsignar}
              >
                {loadingAsignar ? "Guardando..." : "Guardar asignaciones"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bonificaciones;
