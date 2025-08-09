// Importo mysql
const mysql = require("mysql2");

// Hago la conexion con la base de datos
const conection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "mundo_acuatico",
});

//Exporta la conexion
module.exports = { conection };
