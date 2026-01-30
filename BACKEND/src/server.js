// src/server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { poolConnect } = require("./db");

// Rutas
const renglonesRoutes = require("./routes/renglones.routes");
const bonificacionesRoutes = require("./routes/bonificaciones.routes");
const descuentosRoutes = require("./routes/descuentos.routes");
const empleadosRoutes = require("./routes/empleados.routes");
const departamentosRoutes = require("./routes/departamentos.routes");
const puestosRoutes = require("./routes/puestos.routes");
const planillasRoutes = require("./routes/planillas.routes"); // 👈 OJO: routes/planillas.routes

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Archivos estáticos (para fotos y DPI)
app.use(
  "/fotosempleados",
  express.static(path.join(__dirname, "..", "fotosempleados"))
);
app.use(
  "/dpiempleados",
  express.static(path.join(__dirname, "..", "dpiempleados"))
);

// Rutas estáticas para fotos y DPI (las que usa el front)
app.use(
  "/uploads/fotos-empleados",
  express.static(path.join(__dirname, "..", "fotosempleados"))
);

app.use(
  "/uploads/dpi-empleados",
  express.static(path.join(__dirname, "..", "dpiempleados"))
);

// Rutas API
app.use("/api/renglones", renglonesRoutes);
app.use("/api/bonificaciones", bonificacionesRoutes);
app.use("/api/descuentos", descuentosRoutes);
app.use("/api/empleados", empleadosRoutes);
app.use("/api/departamentos", departamentosRoutes);
app.use("/api/puestos", puestosRoutes);
app.use("/api/planillas", planillasRoutes); // 👈 usa planillasRoutes, igual que arriba

// Arrancar servidor cuando el pool esté listo
poolConnect.then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
  });
});
