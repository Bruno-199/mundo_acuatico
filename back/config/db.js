// Cargo las variables de entorno
require('dotenv').config();

// Importo mysql
const mysql = require("mysql2");

// Hago la conexion con la base de datos usando un pool
const conection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

//Exporta la conexion
module.exports = { conection };
