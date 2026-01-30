import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layout/MainLayout";

// Páginas
import Dashboard from "./pages/Dashboard";
import Empleados from "./pages/Empleados";
import Renglones from "./pages/Renglones";
import Planillas from "./pages/Planillas";
import Bonificaciones from "./pages/Bonificaciones";
import Descuentos from "./pages/Descuentos";
import Permisos from "./pages/Permisos";
import Vacaciones from "./pages/Vacaciones";
import Reportes from "./pages/Reportes";
import Configuracion from "./pages/Configuracion";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />

        <Route path="empleados" element={<Empleados />} />
        <Route path="renglones" element={<Renglones />} />
        <Route path="planillas" element={<Planillas />} />
        <Route path="bonificaciones" element={<Bonificaciones />} />
        <Route path="descuentos" element={<Descuentos />} />
        <Route path="permisos" element={<Permisos />} />
        <Route path="vacaciones" element={<Vacaciones />} />
        <Route path="reportes" element={<Reportes />} />
        <Route path="configuracion" element={<Configuracion />} />

        {/* Si no encuentra ruta, manda al dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
