import { RiMenuLine, RiNotification3Line, RiUser3Line } from "react-icons/ri";

function Header({ onToggleSidebar }) {
  return (
    <header className="header">
      <div className="header__left">
        <button className="header__menu-btn" onClick={onToggleSidebar}>
          <RiMenuLine />
        </button>

        <div className="header__titles">
          <h1 className="header__title">Sistema de Gestión de Recursos Humanos</h1>
          <p className="header__subtitle">Municipalidad</p>
        </div>
      </div>

      <div className="header__right">
        <button className="header__icon-btn">
          <RiNotification3Line />
        </button>

        <div className="header__user">
          <div className="header__avatar">
            <RiUser3Line />
          </div>
          <div className="header__user-info">
            <span className="header__user-name">Administrador Sistema</span>
            <span className="header__user-role">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
