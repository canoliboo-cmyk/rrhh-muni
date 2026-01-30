// src/pages/Empleados.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  RiSearchLine,
  RiEyeLine,
  RiEditLine,
  RiDownloadLine,
  RiArrowLeftLine,
  RiFilePdfLine,
  RiUser3Line,
} from "react-icons/ri";

const API_URL = "http://localhost:4000/api";

const initialForm = {
  id_empleado: null,
  codigo_empleado: "",
  nombres: "",
  apellidos: "",
  dpi: "",
  fecha_nacimiento: "",
  telefono: "",
  direccion: "",
  id_renglon: "",
  id_departamento: "",
  id_puesto: "",
  estado: "ACTIVO",
  fecha_ingreso: "",
  salario_base: "",
  fotoFile: null,
  dpiFile: null,
  // para mostrar info en edición
  foto_perfil_ruta: null,
  dpi_pdf_ruta: null,
};

function Empleados() {
  const [modo, setModo] = useState("list"); // list | create | edit
  const [empleados, setEmpleados] = useState([]);
  const [renglones, setRenglones] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filterRenglon, setFilterRenglon] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todos");

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  /* ============================
     CARGA INICIAL
  ============================ */
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [empRes, renRes, depRes, pueRes] = await Promise.all([
          fetch(`${API_URL}/empleados`),
          fetch(`${API_URL}/renglones`),
          fetch(`${API_URL}/departamentos`),
          fetch(`${API_URL}/puestos`),
        ]);

        const empleadosData = await empRes.json();
        const renglonesData = await renRes.json();
        const departamentosData = await depRes.json();
        const puestosData = await pueRes.json();

        setEmpleados(empleadosData);
        setRenglones(renglonesData);
        setDepartamentos(departamentosData);
        setPuestos(puestosData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        alert("Error al cargar empleados o catálogos.");
      }
    };

    loadAll();
  }, []);

  /* ============================
     FILTROS
  ============================ */
  const empleadosFiltrados = useMemo(() => {
    const term = search.toLowerCase();

    return empleados.filter((emp) => {
      const matchSearch =
        !term ||
        emp.nombre.toLowerCase().includes(term) ||
        emp.codigo.toLowerCase().includes(term) ||
        emp.dpi.includes(term);

      const matchRenglon =
        filterRenglon === "todos" || emp.renglon === filterRenglon;

      const matchEstado =
        filterEstado === "todos" ||
        (emp.estado || "").toLowerCase() === filterEstado.toLowerCase();

      return matchSearch && matchRenglon && matchEstado;
    });
  }, [empleados, search, filterRenglon, filterEstado]);

  /* ============================
     HANDLERS GENERALES
  ============================ */
  const resetForm = () => {
    setForm(initialForm);
  };

  const handleMostrarFormularioNuevo = () => {
    resetForm();
    setModo("create");
  };

  const handleVolverListado = () => {
    setModo("list");
    resetForm();
  };

  const handleVerDetalle = (emp) => {
    setSelectedEmployee(emp);
  };

  const handleCerrarDetalle = () => {
    setSelectedEmployee(null);
  };

  /* ============================
     CREAR DEPARTAMENTO / PUESTO
  ============================ */
  const handleCrearDepartamento = async () => {
    const nombre = window.prompt("Nombre del nuevo departamento:");
    if (!nombre || !nombre.trim()) return;

    try {
      const resp = await fetch(`${API_URL}/departamentos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || "Error al crear departamento");
      }

      const data = await resp.json();

      setDepartamentos((prev) => [...prev, data]);
      setForm((prev) => ({
        ...prev,
        id_departamento: String(data.id_departamento),
      }));
    } catch (error) {
      console.error(error);
      alert(error.message || "Error al crear departamento");
    }
  };

  const handleCrearPuesto = async () => {
    const nombre = window.prompt("Nombre del nuevo puesto:");
    if (!nombre || !nombre.trim()) return;

    try {
      const resp = await fetch(`${API_URL}/puestos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || "Error al crear puesto");
      }

      const data = await resp.json();

      setPuestos((prev) => [...prev, data]);
      setForm((prev) => ({
        ...prev,
        id_puesto: String(data.id_puesto),
      }));
    } catch (error) {
      console.error(error);
      alert(error.message || "Error al crear puesto");
    }
  };

  /* ============================
     EDITAR EMPLEADO (LAPICITO)
  ============================ */
  const handleEditarEmpleado = async (emp) => {
    try {
      const resp = await fetch(`${API_URL}/empleados/${emp.id_empleado}`);
      if (!resp.ok) {
        throw new Error("No se pudo obtener el empleado");
      }
      const data = await resp.json();

      setForm({
        id_empleado: data.id_empleado,
        codigo_empleado: data.codigo_empleado || "",
        nombres: data.nombres || "",
        apellidos: data.apellidos || "",
        dpi: data.dpi || "",
        fecha_nacimiento: data.fecha_nacimiento || "",
        telefono: data.telefono || "",
        direccion: data.direccion || "",
        id_renglon: String(data.id_renglon || ""),
        id_departamento: String(data.id_departamento || ""),
        id_puesto: String(data.id_puesto || ""),
        estado: data.estado || "ACTIVO",
        fecha_ingreso: data.fecha_ingreso || "",
        salario_base:
          data.salario_base != null ? String(data.salario_base) : "",
        fotoFile: null,
        dpiFile: null,
        foto_perfil_ruta: data.foto_perfil_ruta || null,
        dpi_pdf_ruta: data.dpi_pdf_ruta || null,
      });

      setModo("edit");
    } catch (error) {
      console.error(error);
      alert("Error al cargar datos del empleado para editar.");
    }
  };

  /* ============================
     CAMBIOS EN FORM
  ============================ */
  const handleChangeForm = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangeFile = (e) => {
    const { name, files } = e.target;
    const file = files && files[0] ? files[0] : null;

    setForm((prev) => ({
      ...prev,
      [`${name}File`]: file,
    }));
  };

  /* ============================
     SUBMIT (CREAR / EDITAR)
  ============================ */
  const handleSubmitNuevoEmpleado = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isEdit = modo === "edit";
      const url = isEdit
        ? `${API_URL}/empleados/${form.id_empleado}`
        : `${API_URL}/empleados`;
      const method = isEdit ? "PUT" : "POST";

      const formData = new FormData();
      formData.append("codigo_empleado", form.codigo_empleado);
      formData.append("nombres", form.nombres);
      formData.append("apellidos", form.apellidos);
      formData.append("dpi", form.dpi);
      formData.append("fecha_nacimiento", form.fecha_nacimiento);
      formData.append("telefono", form.telefono || "");
      formData.append("direccion", form.direccion || "");
      formData.append("id_renglon", form.id_renglon);
      formData.append("id_departamento", form.id_departamento);
      formData.append("id_puesto", form.id_puesto);
      formData.append("estado", form.estado);
      formData.append("fecha_ingreso", form.fecha_ingreso);
      formData.append("salario_base", form.salario_base || "0");

      if (form.fotoFile) {
        formData.append("foto", form.fotoFile);
      }
      if (form.dpiFile) {
        formData.append("dpi", form.dpiFile);
      }

      const resp = await fetch(url, {
        method,
        body: formData,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || "Error al guardar empleado");
      }

      // Volvemos a cargar la lista de empleados
      const listaResp = await fetch(`${API_URL}/empleados`);
      const lista = await listaResp.json();
      setEmpleados(lista);

      alert(
        isEdit
          ? "Empleado actualizado correctamente."
          : "Empleado creado correctamente."
      );
      setModo("list");
      resetForm();
    } catch (error) {
      console.error("Error al crear/editar empleado:", error);
      alert(error.message || "Error al crear/editar empleado");
    } finally {
      setLoading(false);
    }
  };

  /* ============================
     VISTA FORM (NUEVO / EDITAR)
  ============================ */
  if (modo === "create" || modo === "edit") {
    const tituloForm =
      modo === "create" ? "Nuevo Empleado" : "Editar Empleado";

    return (
      <div className="page">
        <div className="empleados-header">
          <div>
            <button
              type="button"
              className="btn-ghost"
              onClick={handleVolverListado}
            >
              <RiArrowLeftLine /> Volver al listado
            </button>
            <h2 className="page__title" style={{ marginTop: "0.5rem" }}>
              {tituloForm}
            </h2>
            <p className="page__subtitle">
              {modo === "create"
                ? "Registra un nuevo miembro del personal municipal."
                : "Actualiza los datos del empleado seleccionado."}
            </p>
          </div>
        </div>

        <form className="empleado-form" onSubmit={handleSubmitNuevoEmpleado}>
          {/* Datos personales */}
          <div className="section-card">
            <h3 className="section-card__title">Datos personales</h3>
            <div className="form-grid-two">
              <div className="form-group">
                <label className="form-label">Código empleado</label>
                <input
                  type="text"
                  className="form-input"
                  name="codigo_empleado"
                  placeholder="Ej. EMP-001"
                  value={form.codigo_empleado}
                  onChange={handleChangeForm}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nombres</label>
                <input
                  type="text"
                  className="form-input"
                  name="nombres"
                  placeholder="Nombres del empleado"
                  value={form.nombres}
                  onChange={handleChangeForm}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Apellidos </label>
                <input
                  type="text"
                  className="form-input"
                  name="apellidos"
                  placeholder="Apellidos del empleado"
                  value={form.apellidos}
                  onChange={handleChangeForm}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">DPI (número)</label>
                <input
                  type="text"
                  className="form-input"
                  name="dpi"
                  placeholder="Ej. 3012345670101"
                  value={form.dpi}
                  onChange={handleChangeForm}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Fecha de nacimiento</label>
                <input
                  type="date"
                  className="form-input"
                  name="fecha_nacimiento"
                  value={form.fecha_nacimiento || ""}
                  onChange={handleChangeForm}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input
                  type="text"
                  className="form-input"
                  name="telefono"
                  placeholder="Ej. 5555-0000"
                  value={form.telefono}
                  onChange={handleChangeForm}
                />
              </div>
              <div className="form-group form-group--full">
                <label className="form-label">Dirección</label>
                <input
                  type="text"
                  className="form-input"
                  name="direccion"
                  placeholder="Dirección completa"
                  value={form.direccion}
                  onChange={handleChangeForm}
                />
              </div>
            </div>
          </div>

          {/* Datos laborales */}
          <div className="section-card">
            <h3 className="section-card__title">Datos laborales</h3>
            <div className="form-grid-two">
              <div className="form-group">
                <label className="form-label">Renglón</label>
                <select
                  className="form-input"
                  name="id_renglon"
                  value={form.id_renglon}
                  onChange={handleChangeForm}
                  required
                >
                  <option value="">Seleccione un renglón</option>
                  {renglones.map((r) => (
                    <option key={r.id_renglon} value={r.id_renglon}>
                      {r.codigo} - {r.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Departamento{" "}
                  <button
                    type="button"
                    className="btn-ghost btn-ghost--sm"
                    onClick={handleCrearDepartamento}
                  >
                    + Nuevo
                  </button>
                </label>
                <select
                  className="form-input"
                  name="id_departamento"
                  value={form.id_departamento}
                  onChange={handleChangeForm}
                  required
                >
                  <option value="">Seleccione un departamento</option>
                  {departamentos.map((d) => (
                    <option key={d.id_departamento} value={d.id_departamento}>
                      {d.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Puesto{" "}
                  <button
                    type="button"
                    className="btn-ghost btn-ghost--sm"
                    onClick={handleCrearPuesto}
                  >
                    + Nuevo
                  </button>
                </label>
                <select
                  className="form-input"
                  name="id_puesto"
                  value={form.id_puesto}
                  onChange={handleChangeForm}
                  required
                >
                  <option value="">Seleccione un puesto</option>
                  {puestos.map((p) => (
                    <option key={p.id_puesto} value={p.id_puesto}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Estado</label>
                <select
                  className="form-input"
                  name="estado"
                  value={form.estado}
                  onChange={handleChangeForm}
                >
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Fecha de ingreso</label>
                <input
                  type="date"
                  className="form-input"
                  name="fecha_ingreso"
                  value={form.fecha_ingreso || ""}
                  onChange={handleChangeForm}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Salario base (Q)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input"
                  name="salario_base"
                  placeholder="Ej. 4500"
                  value={form.salario_base}
                  onChange={handleChangeForm}
                  required
                />
              </div>
            </div>
          </div>

          {/* Documentos adjuntos */}
          <div className="section-card">
            <h3 className="section-card__title">Documentos y foto</h3>
            <div className="form-grid-two">
              <div className="form-group">
                <label className="form-label">Foto de perfil</label>
                <div className="file-input-wrapper">
                  <label className="file-input-label">
                    <RiUser3Line />
                    <span>
                      {form.fotoFile ? form.fotoFile.name : "Seleccionar foto"}
                    </span>
                    <input
                      type="file"
                      name="foto"
                      accept="image/*"
                      onChange={handleChangeFile}
                    />
                  </label>
                  <p className="file-input-help">
                    Formato JPG o PNG. Tamaño máximo recomendado 2 MB.
                  </p>
                  {modo === "edit" && form.foto_perfil_ruta && (
                    <p className="file-input-help">
                      Foto actual: {form.foto_perfil_ruta}
                    </p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">DPI en PDF</label>
                <div className="file-input-wrapper">
                  <label className="file-input-label">
                    <RiFilePdfLine />
                    <span>
                      {form.dpiFile ? form.dpiFile.name : "Subir DPI (PDF)"}
                    </span>
                    <input
                      type="file"
                      name="dpi"
                      accept="application/pdf"
                      onChange={handleChangeFile}
                    />
                  </label>
                  <p className="file-input-help">
                    Solo se permite un archivo en formato PDF.
                  </p>
                  {modo === "edit" && form.dpi_pdf_ruta && (
                    <p className="file-input-help">
                      DPI actual: {form.dpi_pdf_ruta}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="empleado-form__footer">
            <button
              type="button"
              className="btn-ghost"
              onClick={handleVolverListado}
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading
                ? "Guardando..."
                : modo === "create"
                ? "Guardar empleado"
                : "Actualizar empleado"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  /* ============================
     VISTA LISTADO
  ============================ */
  return (
    <div className="page">
      <div className="empleados-header">
        <div>
          <h2 className="page__title">Empleados</h2>
          <p className="page__subtitle">Gestión de personal municipal.</p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={handleMostrarFormularioNuevo}
        >
          + Agregar Empleado
        </button>
      </div>

      {/* Filtros */}
      <div className="empleados-filters">
        <div className="empleados-search">
          <RiSearchLine className="empleados-search__icon" />
          <input
            type="text"
            className="empleados-search__input"
            placeholder="Buscar por nombre, código o DPI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="empleados-filter-select"
          value={filterRenglon}
          onChange={(e) => setFilterRenglon(e.target.value)}
        >
          <option value="todos">Todos los renglones</option>
          {renglones.map((r) => (
            <option key={r.id_renglon} value={r.codigo}>
              {r.codigo}
            </option>
          ))}
        </select>

        <select
          className="empleados-filter-select"
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
        >
          <option value="todos">Todos los estados</option>
          <option value="ACTIVO">Activos</option>
          <option value="INACTIVO">Inactivos</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="empleados-table-card">
        <table className="empleados-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>DPI</th>
              <th>Puesto</th>
              <th>Departamento</th>
              <th>Renglón</th>
              <th>Estado</th>
              <th style={{ textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleadosFiltrados.map((emp) => (
              <tr key={emp.id_empleado}>
                <td className="empleados-table__code">{emp.codigo}</td>
                <td>{emp.nombre}</td>
                <td>{emp.dpi}</td>
                <td>{emp.puesto}</td>
                <td>{emp.departamento}</td>
                <td>{emp.renglon}</td>
                <td>
                  <span className="status-pill status-pill--active">
                    {emp.estado}
                  </span>
                </td>
                <td>
                  <div className="empleados-table__actions">
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => handleVerDetalle(emp)}
                      title="Ver detalle"
                    >
                      <RiEyeLine />
                    </button>
                    <button
                      type="button"
                      className="icon-button"
                      title="Editar empleado"
                      onClick={() => handleEditarEmpleado(emp)}
                    >
                      <RiEditLine />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {empleadosFiltrados.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  style={{ textAlign: "center", padding: "1rem" }}
                >
                  No se encontraron empleados con los filtros actuales.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="empleados-table__footer">
          Mostrando {empleadosFiltrados.length} de {empleados.length} empleados
        </div>
      </div>

      {/* Modal detalle empleado */}
      {selectedEmployee && (
        <div className="modal-backdrop" onClick={handleCerrarDetalle}>
          <div
            className="modal"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="modal__header">
              <h3>Detalle del Empleado</h3>
              <button
                type="button"
                className="icon-button icon-button--ghost"
                onClick={handleCerrarDetalle}
              >
                ✕
              </button>
            </div>

            <div className="modal__body">
              <div className="modal-employee">
                <div className="modal-employee__photo-block">
                  <div className="modal-employee__photo">
                    {selectedEmployee.fotoUrl ||
                    selectedEmployee.foto_perfil_ruta ? (
                      <img
                        src={
                          selectedEmployee.fotoUrl ||
                          `http://localhost:4000/uploads/fotos-empleados/${selectedEmployee.foto_perfil_ruta}`
                        }
                        alt="Foto empleado"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <RiUser3Line />
                    )}
                  </div>
                  <p className="modal-employee__photo-label">
                    Foto del empleado
                  </p>
                  {(selectedEmployee.fotoUrl ||
                    selectedEmployee.foto_perfil_ruta) && (
                    <button
                      type="button"
                      className="btn-ghost btn-ghost--sm"
                      onClick={() => {
                        const url =
                          selectedEmployee.fotoUrl ||
                          `http://localhost:4000/uploads/fotos-empleados/${selectedEmployee.foto_perfil_ruta}`;
                        window.open(url, "_blank");
                      }}
                    >
                      <RiDownloadLine />
                      Descargar foto
                    </button>
                  )}
                </div>

                <div className="modal-employee__info">
                  <div className="modal-employee__row">
                    <div>
                      <p className="modal-label">Código</p>
                      <p className="modal-value">{selectedEmployee.codigo}</p>
                    </div>
                    <div>
                      <p className="modal-label">DPI</p>
                      <p className="modal-value">{selectedEmployee.dpi}</p>
                    </div>
                  </div>

                  <div className="modal-employee__row">
                    <div className="modal-employee__row--full">
                      <p className="modal-label">Nombre completo</p>
                      <p className="modal-value">{selectedEmployee.nombre}</p>
                    </div>
                  </div>

                  <div className="modal-employee__row">
                    <div>
                      <p className="modal-label">Puesto</p>
                      <p className="modal-value">{selectedEmployee.puesto}</p>
                    </div>
                    <div>
                      <p className="modal-label">Departamento</p>
                      <p className="modal-value">
                        {selectedEmployee.departamento}
                      </p>
                    </div>
                  </div>

                  <div className="modal-employee__row">
                    <div>
                      <p className="modal-label">Renglón</p>
                      <p className="modal-value">{selectedEmployee.renglon}</p>
                    </div>
                    <div>
                      <p className="modal-label">Estado</p>
                      <span className="status-pill status-pill--active">
                        {selectedEmployee.estado}
                      </span>
                    </div>
                  </div>

                  <div className="modal-employee__row">
                    <div>
                      <p className="modal-label">Correo</p>
                      <p className="modal-value">—</p>
                    </div>
                    <div>
                      <p className="modal-label">Teléfono</p>
                      <p className="modal-value">
                        {selectedEmployee.telefono || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="modal-employee__row">
                    <div>
                      <p className="modal-label">Fecha de ingreso</p>
                      <p className="modal-value">
                        {selectedEmployee.fechaIngreso}
                      </p>
                    </div>
                    <div>
                      <p className="modal-label">Salario base</p>
                      <p className="modal-value">
                        Q
                        {selectedEmployee.salarioBase.toLocaleString("es-GT")}
                      </p>
                    </div>
                  </div>

                  <div className="modal-employee__row modal-employee__row--full">
                    <div>
                      <p className="modal-label">DPI en PDF</p>
                      <div className="modal-employee__dpi-actions">
                        {selectedEmployee.dpiUrl ||
                        selectedEmployee.dpi_pdf_ruta ? (
                          <>
                            <button
                              type="button"
                              className="btn-ghost btn-ghost--sm"
                              onClick={() => {
                                const url =
                                  selectedEmployee.dpiUrl ||
                                  `http://localhost:4000/uploads/dpi-empleados/${selectedEmployee.dpi_pdf_ruta}`;
                                window.open(url, "_blank");
                              }}
                            >
                              <RiFilePdfLine />
                              Ver DPI
                            </button>
                            <button
                              type="button"
                              className="btn-primary btn-primary--sm"
                              onClick={() => {
                                const url =
                                  selectedEmployee.dpiUrl ||
                                  `http://localhost:4000/uploads/dpi-empleados/${selectedEmployee.dpi_pdf_ruta}`;
                                window.open(url, "_blank");
                              }}
                            >
                              <RiDownloadLine />
                              Descargar DPI
                            </button>
                          </>
                        ) : (
                          <p className="modal-value">No cargado</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal__footer">
              <button
                type="button"
                className="btn-primary btn-primary--sm"
                onClick={handleCerrarDetalle}
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

export default Empleados;
