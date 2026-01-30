import { useState } from "react";
import {
  RiBuilding2Line,
  RiUserSettingsLine,
  RiShieldUserLine,
  RiDatabase2Line,
  RiSave3Line,
  RiAddLine,
  RiEdit2Line,
  RiRefreshLine,
} from "react-icons/ri";

const MOCK_USERS = [
  {
    id: 1,
    nombre: "Juan Carlos Pérez García",
    usuario: "jperez",
    rol: "Administrador",
    estado: "Activo",
    ultimaSesion: "2026-01-20 09:15",
  },
  {
    id: 2,
    nombre: "Ana Sofía Hernández",
    usuario: "ahernandez",
    rol: "RRHH",
    estado: "Activo",
    ultimaSesion: "2026-01-19 16:40",
  },
  {
    id: 3,
    nombre: "Carlos Alberto Rodríguez",
    usuario: "crodriguez",
    rol: "Consulta",
    estado: "Inactivo",
    ultimaSesion: "2025-12-01 11:05",
  },
];

const MOCK_ROLES = [
  {
    id: 1,
    nombre: "Administrador",
    descripcion: "Acceso completo a todos los módulos del sistema.",
  },
  {
    id: 2,
    nombre: "RRHH",
    descripcion: "Gestión de empleados, planillas, permisos y vacaciones.",
  },
  {
    id: 3,
    nombre: "Finanzas",
    descripcion: "Acceso a planillas, descuentos y reportes financieros.",
  },
  {
    id: 4,
    nombre: "Consulta",
    descripcion: "Solo lectura de información clave del sistema.",
  },
];

function Configuracion() {
  const [activeTab, setActiveTab] = useState("municipalidad");
  const [selectedRole, setSelectedRole] = useState(MOCK_ROLES[0]);

  const handleSubmitMunicipio = (e) => {
    e.preventDefault();
    alert(
      "Esta es solo la interfaz. Más adelante conectamos estos datos con el backend."
    );
  };

  const handleCrearUsuario = () => {
    alert("UI lista. Aquí luego abriremos un modal para crear usuarios.");
  };

  const handleBackupNow = () => {
    alert("Simulación de respaldo. Luego aquí llamaremos al backend.");
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page__title">Configuración</h2>
          <p className="page__subtitle">
            Configuración general del sistema de Recursos Humanos.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="config-tabs">
        <button
          type="button"
          className={`config-tabs__item ${
            activeTab === "municipalidad" ? "config-tabs__item--active" : ""
          }`}
          onClick={() => setActiveTab("municipalidad")}
        >
          Municipalidad
        </button>
        <button
          type="button"
          className={`config-tabs__item ${
            activeTab === "usuarios" ? "config-tabs__item--active" : ""
          }`}
          onClick={() => setActiveTab("usuarios")}
        >
          Usuarios
        </button>
        <button
          type="button"
          className={`config-tabs__item ${
            activeTab === "roles" ? "config-tabs__item--active" : ""
          }`}
          onClick={() => setActiveTab("roles")}
        >
          Roles
        </button>
        <button
          type="button"
          className={`config-tabs__item ${
            activeTab === "respaldos" ? "config-tabs__item--active" : ""
          }`}
          onClick={() => setActiveTab("respaldos")}
        >
          Respaldos
        </button>
      </div>

      {/* ===== TAB MUNICIPALIDAD ===== */}
      {activeTab === "municipalidad" && (
        <div className="config-card">
          <div className="config-card__header">
            <div className="config-card__title-wrapper">
              <span className="config-card__icon">
                <RiBuilding2Line />
              </span>
              <div>
                <h3 className="config-card__title">Datos de la Municipalidad</h3>
                <p className="config-card__subtitle">
                  Información institucional que aparecerá en reportes, constancias y encabezados.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitMunicipio}>
            <div className="config-grid-two">
              <div className="form-group">
                <label className="form-label">Nombre de la Municipalidad</label>
                <input
                  type="text"
                  className="form-input"
                  defaultValue="Municipalidad de Guatemala"
                />
              </div>
              <div className="form-group">
                <label className="form-label">NIT</label>
                <input
                  type="text"
                  className="form-input"
                  defaultValue="1234567-8"
                />
              </div>

              <div className="form-group form-group--full">
                <label className="form-label">Dirección</label>
                <input
                  type="text"
                  className="form-input"
                  defaultValue="21 calle 6-77, zona 1, Guatemala"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input
                  type="text"
                  className="form-input"
                  defaultValue="2285-8000"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                <input
                  type="email"
                  className="form-input"
                  defaultValue="info@municipalidad.gob.gt"
                />
              </div>

              <div className="form-group form-group--full">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-input"
                  rows={3}
                  defaultValue="Gobierno municipal encargado de la administración de la ciudad."
                />
              </div>
            </div>

            <div className="section-card" style={{ marginTop: "1.5rem" }}>
              <h4 className="section-card__title">Identidad visual</h4>
              <div className="config-grid-two">
                <div className="form-group">
                  <label className="form-label">Logo de la Municipalidad</label>
                  <div className="file-input-wrapper">
                    <label className="file-input-label">
                      <span>Seleccionar logo</span>
                      <input type="file" accept="image/*" />
                    </label>
                    <p className="file-input-help">
                      Formato PNG o JPG. Se usará en reportes y constancias.
                    </p>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Prefijo de código de empleado</label>
                  <input
                    type="text"
                    className="form-input"
                    defaultValue="EMP"
                  />
                  <p className="file-input-help">
                    Se utilizará al generar nuevos códigos (ej. EMP001, EMP002).
                  </p>
                </div>
              </div>
            </div>

            <div className="config-actions">
              <button type="submit" className="btn-primary">
                <RiSave3Line />
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===== TAB USUARIOS ===== */}
      {activeTab === "usuarios" && (
        <div className="config-card">
          <div className="config-card__header">
            <div className="config-card__title-wrapper">
              <span className="config-card__icon config-card__icon--blue">
                <RiUserSettingsLine />
              </span>
              <div>
                <h3 className="config-card__title">Usuarios del sistema</h3>
                <p className="config-card__subtitle">
                  Administración de cuentas que pueden ingresar al sistema.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={handleCrearUsuario}
            >
              <RiAddLine />
              Nuevo usuario
            </button>
          </div>

          <div className="config-users-table-card">
            <table className="config-users-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Última sesión</th>
                  <th style={{ textAlign: "center" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_USERS.map((u) => (
                  <tr key={u.id}>
                    <td>{u.nombre}</td>
                    <td>{u.usuario}</td>
                    <td>
                      <span className="badge badge--soft">{u.rol}</span>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          u.estado === "Activo"
                            ? "status-pill--active"
                            : "status-pill--inactive"
                        }`}
                      >
                        {u.estado}
                      </span>
                    </td>
                    <td>{u.ultimaSesion}</td>
                    <td>
                      <div className="config-users-table__actions">
                        <button
                          type="button"
                          className="icon-button"
                          title="Editar usuario"
                        >
                          <RiEdit2Line />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          title="Reiniciar contraseña"
                        >
                          <RiRefreshLine />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== TAB ROLES ===== */}
      {activeTab === "roles" && (
        <div className="config-card">
          <div className="config-card__header">
            <div className="config-card__title-wrapper">
              <span className="config-card__icon config-card__icon--purple">
                <RiShieldUserLine />
              </span>
              <div>
                <h3 className="config-card__title">Roles y permisos</h3>
                <p className="config-card__subtitle">
                  Define qué módulos puede utilizar cada tipo de usuario.
                </p>
              </div>
            </div>
          </div>

          <div className="config-roles-layout">
            <div className="config-roles-list">
              <h4 className="config-roles__subtitle">Roles configurados</h4>
              <ul>
                {MOCK_ROLES.map((role) => (
                  <li key={role.id}>
                    <button
                      type="button"
                      className={`config-role-item ${
                        selectedRole.id === role.id
                          ? "config-role-item--active"
                          : ""
                      }`}
                      onClick={() => setSelectedRole(role)}
                    >
                      <span className="config-role-item__name">
                        {role.nombre}
                      </span>
                      <span className="config-role-item__desc">
                        {role.descripcion}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="config-roles-detail">
              <h4 className="config-roles__subtitle">
                Permisos del rol:{" "}
                <span className="config-roles__role-name">
                  {selectedRole.nombre}
                </span>
              </h4>

              <div className="filters-grid">
                <label className="checkbox-item">
                  <input type="checkbox" defaultChecked /> Inicio / Dashboard
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" defaultChecked /> Empleados
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" defaultChecked /> Renglones
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" defaultChecked /> Planillas
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" defaultChecked /> Bonificaciones
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" defaultChecked /> Descuentos
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" defaultChecked /> Permisos
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" defaultChecked /> Vacaciones
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" defaultChecked /> Reportes
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" /> Configuración del sistema
                </label>
              </div>

              <div className="config-actions" style={{ marginTop: "1.25rem" }}>
                <button type="button" className="btn-primary">
                  <RiSave3Line />
                  Guardar permisos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB RESPALDOS ===== */}
      {activeTab === "respaldos" && (
        <div className="config-card">
          <div className="config-card__header">
            <div className="config-card__title-wrapper">
              <span className="config-card__icon config-card__icon--green">
                <RiDatabase2Line />
              </span>
              <div>
                <h3 className="config-card__title">Respaldos de información</h3>
                <p className="config-card__subtitle">
                  Configura la política de copias de seguridad de la base de
                  datos de RRHH.
                </p>
              </div>
            </div>
          </div>

          <div className="config-backup-grid">
            <div className="section-card">
              <h4 className="section-card__title">Estado de respaldos</h4>
              <div className="config-backup-info">
                <div>
                  <p className="config-backup__label">Último respaldo</p>
                  <p className="config-backup__value">
                    2026-01-20 22:15 (Automático)
                  </p>
                </div>
                <div>
                  <p className="config-backup__label">Próximo respaldo</p>
                  <p className="config-backup__value">2026-01-21 22:00</p>
                </div>
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={handleBackupNow}
              >
                <RiDatabase2Line />
                Ejecutar respaldo ahora
              </button>
            </div>

            <div className="section-card">
              <h4 className="section-card__title">Programación</h4>
              <div className="form-group">
                <label className="form-label">Frecuencia</label>
                <select className="form-input" defaultValue="diario">
                  <option value="diario">Diario</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Hora de ejecución</label>
                <input type="time" className="form-input" defaultValue="22:00" />
              </div>

              <label className="checkbox-item" style={{ marginTop: "0.5rem" }}>
                <input type="checkbox" defaultChecked /> Activar respaldos
                automáticos
              </label>

              <p className="file-input-help" style={{ marginTop: "0.75rem" }}>
                Los respaldos se almacenarán en el servidor configurado por el
                área de sistemas.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Configuracion;
