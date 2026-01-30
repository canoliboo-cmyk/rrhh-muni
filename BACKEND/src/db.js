// src/db.js
const sql = require("mssql/msnodesqlv8");
require("dotenv").config();

// Construimos la cadena de conexión ODBC
const connectionString = `
  Driver={SQL Server};
  Server=${process.env.DB_SERVER || ".\\SQLEXPRESS"};
  Database=${process.env.DB_NAME || "rrhh-muni"};
  Trusted_Connection=Yes;
`.replace(/\s+/g, " "); // quita saltos de línea

const dbConfig = {
  driver: "msnodesqlv8",
  connectionString,
};

const pool = new sql.ConnectionPool(dbConfig);

const poolConnect = pool
  .connect()
  .then(() => {
    console.log("✅ Conectado a SQL Server con msnodesqlv8");
  })
  .catch((err) => {
    console.error("❌ ERROR REAL DE SQL SERVER");
    console.error(err);
  });

module.exports = { sql, pool, poolConnect };
