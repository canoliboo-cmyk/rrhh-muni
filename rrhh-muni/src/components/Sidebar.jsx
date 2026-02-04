import { NavLink } from "react-router-dom";
import {
  RiDashboardLine,
  RiUser3Line,
  RiFileList2Line,
  RiMoneyDollarCircleLine,
  RiPercentLine,
  RiScales3Line,
  RiCalendarLine,
  RiCalendar2Line,
  RiBarChart2Line,
  RiSettings3Line,
} from "react-icons/ri";

function Sidebar({ isOpen, onClose }) {
  const menuItems = [
    { label: "Inicio", icon: <RiDashboardLine />, to: "/" },
    { label: "Empleados", icon: <RiUser3Line />, to: "/empleados" },
    { label: "Renglones", icon: <RiFileList2Line />, to: "/renglones" },
    { label: "Planillas", icon: <RiMoneyDollarCircleLine />, to: "/planillas" },
    { label: "Bonificaciones", icon: <RiPercentLine />, to: "/bonificaciones" },
    { label: "Descuentos", icon: <RiScales3Line />, to: "/descuentos" },
    { label: "Permisos", icon: <RiCalendarLine />, to: "/permisos" },
    { label: "Vacaciones", icon: <RiCalendar2Line />, to: "/vacaciones" },
    { label: "Informes", icon: <RiBarChart2Line />, to: "/reportes" },
    { label: "Configuración", icon: <RiSettings3Line />, to: "/configuracion" },
  ];

  return (
    <aside
      className={`sidebar ${isOpen ? "sidebar--open" : "sidebar--closed"}`}
    >
      <div className="sidebar__inner">
        {/* HEADER: logo + botón cerrar (móvil) */}
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <div className="sidebar__logo-container">
              <img
                src="/muni2.png"
                alt="Logo Municipalidad"
                className="sidebar__logo-img"
              />
            </div>
            <p className="sidebar__logo-subtitle">Módulos</p>
          </div>

          {/* Botón cerrar SOLO en móvil */}
          <button className="sidebar__close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* MENÚ */}
        <nav className="sidebar__nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
              }
              onClick={onClose} // en móvil se cierra al hacer click
            >
              <span className="sidebar__icon">{item.icon}</span>
              <span className="sidebar__label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* FOOTER */}
        <div className="sidebar__footer">
          <p className="sidebar__version">Versión 1.0.0</p>
          <p className="sidebar__copy">
            © 2026 Municipalidad de San José Acatempa
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
