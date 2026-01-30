// src/pages/Descuentos.jsx
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

function Descuentos() {
  const [descuentos, setDescuentos] = useState([]);
  const [renglones, setRenglones] = useState([]);

  // Modal crear/editar
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  // Modal asignar
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignMode, setAssignMode] = useState(null); // 'renglon' | 'individual'
  const [descuentoSeleccionado, setDescuentoSeleccionado] = useState(null);
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
        const [descRes, rengRes] = await Promise.all([
          fetch(`${API_URL}/descuentos`),
          fetch(`${API_URL}/renglones`),
        ]);
        const descData = await descRes.json();
        const rengData = await rengRes.json();
        setDescuentos(descData);
        setRenglones(rengData);
      } catch (error) {
        console.error("Error al cargar descuentos o renglones:", error);
        alert("Error al cargar descuentos o renglones.");
      }
    };

    load();
  }, []);

  // ============================
  // RESUMEN
  // ============================
  const resumen = useMemo(() => {
    const total = descuentos.length;
    const activas = descuentos.filter((b) => b.activo).length;
    const inactivas = total - activas;
    return { total, activas, inactivas };
  }, [descuentos]);

  // ============================
  // MODAL NUEVO / EDITAR
  // ============================
  const openNewModal = () => {
    setForm(initialForm);
    setShowModal(true);
  };

  const openEditModal = (desc) => {
    let destino = desc.destino || "todos";
    if (!destino || destino === "otros") {
      if (desc.aplica_a_todos) destino = "todos";
      else if (desc.aplica_por_renglon) destino = "renglon";
      else if (desc.aplica_individual) destino = "individual";
    }

    setForm({
      id: desc.id,
      nombre: desc.nombre,
      tipo: desc.tipo,
      valor: desc.valor.toString(),
      descripcion: desc.descripcion || "",
      destino,
      activo: desc.activo,
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
      const desc = descuentos.find((b) => b.id === id);
      if (!desc) return;
      const nuevoActivo = !desc.activo;

      const resp = await fetch(`${API_URL}/descuentos/${id}/activo`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: nuevoActivo }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || "Error al cambiar estado");
      }

      setDescuentos((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, activo: nuevoActivo } : b
        )
      );
    } catch (error) {
      console.error("Error al cambiar estado de descuento:", error);
      alert(error.message || "Error al cambiar estado del descuento.");
    }
  };

  // ============================
  // ELIMINAR
  // ============================
  const handleDelete = async (id) => {
    const confirmar = window.confirm(
      "¿Deseas eliminar este descuento? Esta acción no se puede deshacer."
    );
    if (!confirmar) return;

    try {
      const resp = await fetch(`${API_URL}/descuentos/${id}`, {
        method: "DELETE",
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || "Error al eliminar descuento");
      }

      setDescuentos((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      console.error("Error al eliminar descuento:", error);
      alert(error.message || "Error al eliminar descuento.");
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
        throw new Error("Ingresa un nombre para el descuento.");
      }
      if (!form.valor || Number(form.valor) <= 0) {
        throw new Error("Ingresa un monto o porcentaje válido.");
      }

      const isEdit = !!form.id;
      const url = isEdit
        ? `${API_URL}/descuentos/${form.id}`
        : `${API_URL}/descuentos`;
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
        throw new Error(err.message || "Error al guardar descuento");
      }

      if (!isEdit) {
        const nuevo = await resp.json();
        setDescuentos((prev) => [...prev, nuevo]);
      } else {
        setDescuentos((prev) =>
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
          ? "Descuento actualizado correctamente."
          : "Descuento creado correctamente."
      );
      setShowModal(false);
      setForm(initialForm);
    } catch (error) {
      console.error("Error al guardar descuento:", error);
      alert(error.message || "Error al guardar el descuento.");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // MODAL ASIGNAR
  // ============================
  const openAssignModal = async (desc) => {
    if (desc.destino === "todos") {
      alert("Este descuento aplica a todo el personal, no requiere asignación.");
      return;
    }

    setDescuentoSeleccionado(desc);
    setAssignMode(desc.destino);
    setSelectedRenglonesIds([]);
    setEmpleadosBusqueda([]);
    setEmpleadosSeleccionados([]);
    setBuscarEmpleadoTexto("");
    setShowAssignModal(true);

    try {
      if (desc.destino === "renglon") {
        const resp = await fetch(
          `${API_URL}/descuentos/${desc.id}/renglones`
        );
        const data = await resp.json();
        setSelectedRenglonesIds(data || []);
      } else if (desc.destino === "individual") {
        const resp = await fetch(
          `${API_URL}/descuentos/${desc.id}/empleados`
        );
        const data = await resp.json();
        setEmpleadosSeleccionados(data || []);
      }
    } catch (error) {
      console.error("Error cargando asignaciones de descuento:", error);
      alert("Error al cargar asignaciones del descuento.");
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
    if (!descuentoSeleccionado) return;
    setLoadingAsignar(true);

    try {
      if (assignMode === "renglon") {
        const resp = await fetch(
          `${API_URL}/descuentos/${descuentoSeleccionado.id}/renglones`,
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
          `${API_URL}/descuentos/${descuentoSeleccionado.id}/empleados`,
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

      alert("Asignaciones de descuento guardadas correctamente.");
      setShowAssignModal(false);
    } catch (error) {
      console.error("Error al guardar asignaciones de descuento:", error);
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
          <h2 className="page__title">Descuentos</h2>
          <p className="page__subtitle">
            Gestión de descuentos aplicados al personal.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={openNewModal}
        >
          <RiAddLine />
          Nuevo Descuento
        </button>
      </div>

      {/* Tarjetas de descuentos */}
      <section className="bonos-grid">
        {descuentos.map((desc) => (
          <article key={desc.id} className="bono-card">
            <div className="bono-card__header">
              <div className="bono-card__icon">
                <RiLineChartLine />
              </div>
              <div>
                <p className="bono-card__title">{desc.nombre}</p>
                <span className="bono-card__badge">
                  {desc.tipo === "MONTO" ? "Monto Fijo" : "Porcentaje"}
                </span>
              </div>
            </div>

            <div className="bono-card__body">
              <p className="bono-card__amount">
                {desc.tipo === "MONTO"
                  ? `Q${desc.valor.toLocaleString("es-GT", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : `${desc.valor}%`}
              </p>
              <p className="bono-card__description">
                {desc.descripcion ||
                  (desc.destino === "todos"
                    ? "Aplica a todo el personal activo"
                    : desc.destino === "renglon"
                    ? "Aplica por renglón"
                    : desc.destino === "individual"
                    ? "Aplica a empleados específicos"
                    : "")}
              </p>
            </div>

            <div className="bono-card__footer">
              <div className="toggle-wrapper">
                <button
                  type="button"
                  className={`toggle-switch ${
                    desc.activo ? "toggle-switch--on" : ""
                  }`}
                  onClick={() => handleToggleActivo(desc.id)}
                >
                  <span className="toggle-switch__thumb" />
                </button>
                <span className="toggle-switch__label">
                  {desc.activo ? "Activo" : "Inactivo"}
                </span>
              </div>

              <div className="bono-card__actions">
                {desc.destino !== "todos" && (
                  <button
                    type="button"
                    className="btn-ghost btn-ghost--sm"
                    onClick={() => openAssignModal(desc)}
                  >
                    Asignar
                  </button>
                )}

                <button
                  type="button"
                  className="icon-button"
                  title="Editar descuento"
                  onClick={() => openEditModal(desc)}
                >
                  <RiEditLine />
                </button>
                <button
                  type="button"
                  className="icon-button icon-button--danger"
                  title="Eliminar descuento"
                  onClick={() => handleDelete(desc.id)}
                >
                  <RiDeleteBinLine />
                </button>
              </div>
            </div>
          </article>
        ))}

        {descuentos.length === 0 && (
          <p style={{ marginTop: "1rem" }}>
            No hay descuentos registrados todavía.
          </p>
        )}
      </section>

      {/* Resumen inferior */}
      <section className="section-card bonificaciones-resumen">
        <h3 className="section-card__title">Resumen de Descuentos</h3>

        <div className="bonificaciones-resumen__grid">
          <div className="summary-card">
            <p className="summary-card__label">Total Descuentos</p>
            <p className="summary-card__value summary-card__value--normal">
              {resumen.total}
            </p>
          </div>
          <div className="summary-card summary-card--green">
            <p className="summary-card__label">Activos</p>
            <p className="summary-card__value summary-card__value--normal">
              {resumen.activas}
            </p>
          </div>
          <div className="summary-card summary-card--red">
            <p className="summary-card__label">Inactivos</p>
            <p className="summary-card__value summary-card__value--normal">
              {resumen.inactivas}
            </p>
          </div>
        </div>
      </section>

      {/* Modal Nuevo/Editar Descuento */}
      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <h3>
                {form.id ? "Editar Descuento" : "Nuevo Descuento"}
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
                  placeholder="Ej: IGSS, préstamo, etc."
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
                    form.tipo === "MONTO" ? "300" : "4.83"
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
                  placeholder="Describe brevemente el descuento..."
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
      {showAssignModal && descuentoSeleccionado && (
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
                <strong>Descuento:</strong> {descuentoSeleccionado.nombre}
              </p>

              {assignMode === "renglon" && (
                <div>
                  <p className="form-label">
                    Selecciona los renglones a los que aplicará el
                    descuento:
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

                  <div
                    className="empleados-search"
                    style={{ marginBottom: "0.75rem" }}
                  >
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
                    <div
                      className="section-card"
                      style={{ marginBottom: "0.75rem" }}
                    >
                      <p className="form-label">
                        Resultados de búsqueda
                      </p>
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
                    <p className="form-label">
                      Empleados con este descuento
                    </p>
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
                {loadingAsignar
                  ? "Guardando..."
                  : "Guardar asignaciones"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Descuentos;
