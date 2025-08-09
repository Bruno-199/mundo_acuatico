//importa la conexion con la base de datos
const { conection } = require("../config/db");

//crea la funcion con los paramtros request y response
const todoUsuarios = (req, res) => {
  const query = "SELECT id, usuario, nombre, rol, ultimo_acceso, estado, fecha_creacion FROM usuarios WHERE estado = 'Activo';";

  conection.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
};

const agregarUsuarios = (req, res) => {
  // Obtenemos los valores del request body
  const { usuario, nombre, password_hash, rol } = req.body;
  
  // Creamos la consulta SQL para insertar un nuevo usuario
  const query = `INSERT INTO usuarios (usuario, nombre, password_hash, rol) 
                 VALUES (?, ?, ?, ?)`;
  
  // Ejecutamos la consulta con los valores parametrizados
  conection.query(query, [usuario, nombre, password_hash, rol], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
};

const borrarUsuarios = (req, res) => {
  const id = req.params.id;
  const query = `UPDATE usuarios SET estado = 'Inactivo' WHERE id = ?`;
  
  conection.query(query, [id], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
};

const editarUsuarios = (req, res) => {
  const id = req.params.id;
  const { usuario, nombre, rol, estado } = req.body;

  const query = `UPDATE usuarios 
                 SET usuario = ?, 
                     nombre = ?, 
                     rol = ?,
                     estado = ? 
                 WHERE id = ?`;
  
  conection.query(query, [usuario, nombre, rol, estado, id], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
};

const verUsuarios = (req, res) => {
  const id = req.params.id;
  const query = `SELECT id, usuario, nombre, rol, ultimo_acceso, estado, fecha_creacion, fecha_actualizacion
                 FROM usuarios 
                 WHERE id = ?`;
  
  conection.query(query, [id], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
};

const loginUsuarios = (req, res) => {
  const { usuario, password } = req.body;
  const query = `SELECT id, usuario, nombre, rol, password_hash 
                 FROM usuarios 
                 WHERE usuario = ? AND estado = 'Activo'`;
  
  conection.query(query, [usuario], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
};

module.exports = {
  todoUsuarios,
  agregarUsuarios,
  borrarUsuarios,
  editarUsuarios,
  verUsuarios,
  loginUsuarios,
};
