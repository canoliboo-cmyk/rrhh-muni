import React, { useEffect, useState } from "react";
import {
  RiFileList2Line,
  RiEditLine,
  RiUser3Line,
  RiAddLine,
  RiDeleteBinLine,
} from "react-icons/ri";

const API_URL = "http://localhost:4000/api/renglones";

function Renglones() {
  const [renglones, setRenglones] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRenglon, setEditingRenglon] = useState(null);
  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Estado para modal de empleados
  const [empleadosModalOpen, setEmpleadosModalOpen] = useState(false);
  const [empleadosRenglon, setEmpleadosRenglon] = useState([]);
  const [empleadosLoading, setEmpleadosLoading] = useState(false);
  const [renglonSeleccionado, setRenglonSeleccionado] = useState(null);

  // ============ CARGAR RENGLONES ============
  const fetchRenglones = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al cargar renglones");
      const data = await res.json();
      setRenglones(
        data.map((r) => ({
          id_renglon: r.id_renglon,
          codigo: r.codigo,
          nombre: r.nombre,
          descripcion: r.descripcion,
          empleadosAsignados: r.empleadosAsignados ?? 0,
        }))
      );
    } catch (error) {
      console.error(error);
      alert("No se pudieron cargar los renglones desde el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRenglones();
  }, []);

  // ============ MODAL NUEVO / EDITAR ============
  const handleOpenNewModal = () => {
    setEditingRenglon(null);
    setForm({ codigo: "", nombre: "", descripcion: "" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (renglon) => {
    setEditingRenglon(renglon);
    setForm({
      codigo: renglon.codigo,
      nombre: renglon.nombre,
      descripcion: renglon.descripcion || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    setEditingRenglon(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ============ GUARDAR (CREAR / EDITAR) ============
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.codigo.trim() || !form.nombre.trim()) {
      alert("El código y el nombre del renglón son obligatorios.");
      return;
    }

    const payload = {
      codigo: form.codigo.trim(),
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      activo: 1,
    };

    try {
      setSaving(true);

      if (editingRenglon) {
        // EDITAR
        const res = await fetch(`${API_URL}/${editingRenglon.id_renglon}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Error al actualizar renglón");

        setRenglones((prev) =>
          prev.map((r) =>
            r.id_renglon === editingRenglon.id_renglon
              ? { ...r, ...payload }
              : r
          )
        );
        alert("Renglón actualizado correctamente.");
      } else {
        // CREAR
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Error al crear renglón");
        const nuevo = await res.json();

        setRenglones((prev) => [
          ...prev,
          {
            id_renglon: nuevo.id_renglon,
            codigo: nuevo.codigo,
            nombre: nuevo.nombre,
            descripcion: nuevo.descripcion,
            empleadosAsignados: nuevo.empleadosAsignados ?? 0,
          },
        ]);
        alert("Renglón creado correctamente.");
      }

      setIsModalOpen(false);
      setEditingRenglon(null);
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al guardar el renglón.");
    } finally {
      setSaving(false);
    }
  };

  // ============ DESACTIVAR ============
  const handleDesactivar = async (renglon) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas desactivar el renglón ${renglon.codigo}?`
    );
    if (!confirmar) return;

    try {
      const res = await fetch(`${API_URL}/${renglon.id_renglon}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al desactivar renglón");

      setRenglones((prev) =>
        prev.filter((r) => r.id_renglon !== renglon.id_renglon)
      );
      alert("Renglón desactivado correctamente.");
    } catch (error) {
      console.error(error);
      alert("No se pudo desactivar el renglón.");
    }
  };

  // ============ VER EMPLEADOS DEL RENGLÓN ============
  const handleVerEmpleados = async (renglon) => {
    setRenglonSeleccionado(renglon);
    setEmpleadosModalOpen(true);
    setEmpleadosLoading(true);
    setEmpleadosRenglon([]);

    try {
      const res = await fetch(
        `${API_URL}/${renglon.id_renglon}/empleados`
      );
      if (!res.ok) throw new Error("Error al obtener empleados");
      const data = await res.json();
      setEmpleadosRenglon(data);
    } catch (error) {
      console.error(error);
      alert(
        "No se pudieron obtener los empleados de este renglón."
      );
    } finally {
      setEmpleadosLoading(false);
    }
  };

  const handleCloseEmpleadosModal = () => {
    setEmpleadosModalOpen(false);
    setRenglonSeleccionado(null);
    setEmpleadosRenglon([]);
  };

  // ============ RENDER ============
  return (
    <div className="page">
      <div className="empleados-header">
        <div>
          <h2 className="page__title">Renglones</h2>
          <p className="page__subtitle">
            Gestión de renglones presupuestarios.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={handleOpenNewModal}
        >
          <RiAddLine />
          Nuevo Renglón
        </button>
      </div>

      {loading ? (
        <p>Cargando renglones...</p>
      ) : (
        <div className="renglones-grid">
          {renglones.map((renglon) => (
            <article
              key={renglon.id_renglon ?? renglon.codigo}
              className="renglon-card"
            >
              <header className="renglon-card__header">
                <div className="renglon-card__icon-wrapper">
                  <div className="renglon-card__icon">
                    <RiFileList2Line />
                  </div>
                  <div>
                    <p className="renglon-card__codigo">
                      {renglon.codigo}
                    </p>
                    <p className="renglon-card__nombre">
                      {renglon.nombre}
                    </p>
                  </div>
                </div>

                <div className="renglon-card__header-actions">
                  <button
                    type="button"
                    className="icon-button"
                    title="Editar renglón"
                    onClick={() => handleOpenEditModal(renglon)}
                  >
                    <RiEditLine />
                  </button>
                  <button
                    type="button"
                    className="icon-button icon-button--danger"
                    title="Desactivar renglón"
                    onClick={() => handleDesactivar(renglon)}
                  >
                    <RiDeleteBinLine />
                  </button>
                </div>
              </header>

              <p className="renglon-card__descripcion">
                {renglon.descripcion || "Sin descripción."}
              </p>

              <div className="renglon-card__footer">
                <div className="renglon-card__empleados">
                  <div className="renglon-card__empleados-label">
                    <RiUser3Line />
                    <span>Empleados asignados</span>
                  </div>
                  <span className="renglon-card__empleados-count">
                    {renglon.empleadosAsignados}
                  </span>
                </div>

                <button
                  type="button"
                  className="renglon-card__action"
                  onClick={() => handleVerEmpleados(renglon)}
                >
                  Ver Empleados
                </button>
              </div>
            </article>
          ))}

          {renglones.length === 0 && !loading && (
            <p>No hay renglones registrados.</p>
          )}
        </div>
      )}

      {/* Modal Nuevo / Editar Renglón */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div
            className="modal"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="modal__header">
              <h3>
                {editingRenglon ? "Editar Renglón" : "Nuevo Renglón"}
              </h3>
              <button
                type="button"
                className="icon-button icon-button--ghost"
                onClick={handleCloseModal}
                disabled={saving}
              >
                ✕
              </button>
            </div>

            <form className="renglones-modal-form" onSubmit={handleSubmit}>
              <div className="modal__body">
                <div className="form-group">
                  <label className="form-label" htmlFor="codigo">
                    Código
                  </label>
                  <input
                    id="codigo"
                    name="codigo"
                    type="text"
                    className="form-input"
                    placeholder="Ej. 011"
                    value={form.codigo}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="nombre">
                    Nombre
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    className="form-input"
                    placeholder="Personal Permanente"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="descripcion">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    className="form-input renglones-modal-form__textarea"
                    placeholder="Descripción del renglón..."
                    rows={3}
                    value={form.descripcion}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="modal__footer modal-actions">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Empleados por renglón */}
      {empleadosModalOpen && (
        <div
          className="modal-backdrop"
          onClick={handleCloseEmpleadosModal}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <h3>
                Empleados del renglón{" "}
                {renglonSeleccionado?.codigo} -{" "}
                {renglonSeleccionado?.nombre}
              </h3>
              <button
                type="button"
                className="icon-button icon-button--ghost"
                onClick={handleCloseEmpleadosModal}
              >
                ✕
              </button>
            </div>

            <div className="modal__body">
              {empleadosLoading ? (
                <p>Cargando empleados...</p>
              ) : empleadosRenglon.length === 0 ? (
                <p>No hay empleados activos en este renglón.</p>
              ) : (
                <table className="empleados-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Nombre</th>
                      <th>DPI</th>
                      <th>Puesto</th>
                      <th>Departamento</th>
                      <th>Salario base</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empleadosRenglon.map((emp) => (
                      <tr key={emp.id_empleado}>
                        <td>{emp.codigo}</td>
                        <td>{emp.nombre}</td>
                        <td>{emp.dpi}</td>
                        <td>{emp.puesto}</td>
                        <td>{emp.departamento}</td>
                        <td>
                          Q
                          {Number(
                            emp.salarioBase
                          ).toLocaleString("es-GT", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="modal__footer">
              <button
                type="button"
                className="btn-primary btn-primary--sm"
                onClick={handleCloseEmpleadosModal}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Renglones;
