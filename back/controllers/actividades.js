//importa la conexion con la base de datos
const { conection } = require("../config/db");

//crea la funcion con los paramtros request y response
const todoActividades = (req, res) => {
  const query = "SELECT * FROM actividades ORDER BY fecha_creacion DESC;";

  conection.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
};

const agregarActividades = (req, res) => {
  // Obtenemos los valores del request body
  const { nombre, descripcion, form_url, imagen_url, precio_mensual } = req.body;
  
  // Creamos la consulta SQL para insertar una nueva actividad
  const query = `INSERT INTO actividades (nombre, descripcion, form_url, imagen_url, precio_mensual) 
                 VALUES (?, ?, ?, ?, ?)`;
  
  // Ejecutamos la consulta con los valores parametrizados
  conection.query(query, [nombre, descripcion, form_url, imagen_url, precio_mensual], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
};

const borrarActividades = (req, res) => {
  const id = req.params.id;
  const query = `UPDATE actividades SET activa = FALSE WHERE id = ?`;
  
  conection.query(query, [id], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
};

const editarActividades = (req, res) => {
  const id = req.params.id;
  const { nombre, descripcion, form_url, imagen_url, activa, precio_mensual } = req.body;

  const query = `UPDATE actividades 
                 SET nombre = ?, 
                     descripcion = ?, 
                     form_url = ?,
                     imagen_url = ?,
                     activa = ?,
                     precio_mensual = ?
                 WHERE id = ?`;
  
  conection.query(query, [nombre, descripcion, form_url, imagen_url, activa, precio_mensual, id], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
};

const verActividades = (req, res) => {
  const id = req.params.id;
  const query = `SELECT a.*, 
                        COUNT(h.id) as cantidad_horarios,
                        COUNT(s.id) as cantidad_suscripciones
                 FROM actividades a
                 LEFT JOIN horarios h ON h.actividad_id = a.id AND h.activo = TRUE
                 LEFT JOIN suscripciones s ON s.horario_id = h.id AND s.estado = 'Activa'
                 WHERE a.id = ?
                 GROUP BY a.id`;
  
  conection.query(query, [id], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
};

module.exports = {
  todoActividades,
  agregarActividades,
  borrarActividades,
  editarActividades,
  verActividades,
};
