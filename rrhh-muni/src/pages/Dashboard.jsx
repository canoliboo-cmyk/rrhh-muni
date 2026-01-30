import {
  RiUser3Line,
  RiUserSmileLine,
  RiFileList2Line,
  RiMoneyDollarCircleLine,
} from "react-icons/ri";

function Dashboard() {
  return (
    <div className="page">
      <h2 className="page__title">Dashboard</h2>
      <p className="page__subtitle">
        Bienvenido al Sistema de Gestión de Recursos Humanos
      </p>

      {/* Tarjetas resumen */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card__header">
            <div>
              <p className="kpi-card__label">Total Empleados</p>
              <p className="kpi-card__value">8</p>
              <p className="kpi-card__trend">↑ +2 este mes</p>
            </div>
            <div className="kpi-card__icon-wrapper kpi-card__icon-wrapper--blue">
              <RiUser3Line />
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card__header">
            <div>
              <p className="kpi-card__label">Empleados Activos</p>
              <p className="kpi-card__value">7</p>
            </div>
            <div className="kpi-card__icon-wrapper kpi-card__icon-wrapper--green">
              <RiUserSmileLine />
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card__header">
            <div>
              <p className="kpi-card__label">Renglones Activos</p>
              <p className="kpi-card__value">4</p>
            </div>
            <div className="kpi-card__icon-wrapper kpi-card__icon-wrapper--orange">
              <RiFileList2Line />
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card__header">
            <div>
              <p className="kpi-card__label">Planilla del Mes</p>
              <p className="kpi-card__value">Q67,500</p>
            </div>
            <div className="kpi-card__icon-wrapper kpi-card__icon-wrapper--purple">
              <RiMoneyDollarCircleLine />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficas placeholder */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-card__title">Empleados por Renglón</h3>
          <div className="chart-card__body chart-card__body--placeholder">
            Gráfica de barras (aquí después metemos librería de gráficos)
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-card__title">Distribución por Departamento</h3>
          <div className="chart-card__body chart-card__body--placeholder">
            Gráfica circular / pie chart
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <h3 className="section-title">Accesos Rápidos</h3>
      <div className="quick-actions-grid">
        <div className="quick-action-card">
          <p className="quick-action-card__title">Gestionar empleados</p>
          <p className="quick-action-card__subtitle">Ver y editar personal</p>
        </div>
        <div className="quick-action-card">
          <p className="quick-action-card__title">Generar Planilla</p>
          <p className="quick-action-card__subtitle">
            Calcular pagos del mes
          </p>
        </div>
        <div className="quick-action-card">
          <p className="quick-action-card__title">Aprobar Permisos</p>
          <p className="quick-action-card__subtitle">Revisar solicitudes</p>
        </div>
      </div>

      {/* Actividad reciente */}
      <h3 className="section-title">Actividad reciente</h3>
      <div className="activity-list">
        <div className="activity-item">
          <span className="activity-item__dot activity-item__dot--green" />
          <div>
            <p className="activity-item__title">
              Planilla de enero aprobada
            </p>
            <p className="activity-item__time">Hace 2 horas</p>
          </div>
        </div>
        <div className="activity-item">
          <span className="activity-item__dot activity-item__dot--blue" />
          <div>
            <p className="activity-item__title">Nuevo empleado registrado</p>
            <p className="activity-item__time">Hace 5 horas</p>
          </div>
        </div>
        <div className="activity-item">
          <span className="activity-item__dot activity-item__dot--orange" />
          <div>
            <p className="activity-item__title">
              2 solicitudes de permiso pendientes
            </p>
            <p className="activity-item__time">Hace 1 día</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
