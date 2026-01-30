import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // En pantallas grandes dejamos el sidebar siempre abierto visualmente
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Backdrop en móvil */}
      {isSidebarOpen && window.innerWidth < 1024 && (
        <div className="backdrop" onClick={closeSidebar} />
      )}

      <div className="main-content">
        <Header onToggleSidebar={toggleSidebar} />

        <main className="main-scroll">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
