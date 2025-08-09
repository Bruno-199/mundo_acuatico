//importa la conexion con la base de datos
const { conection } = require("../config/db");

//crea la funcion con los paramtros request y response
const todoSuscriptores = (req, res) => {
  const query = "SELECT * FROM suscriptores WHERE estado IN ('Activo', 'Pendiente') ORDER BY nombre;";

  conection.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
};

const agregarSuscriptores = (req, res) => {
  // Obtenemos los valores del request body
  const { nombre, email, telefono, dni, fecha_nacimiento, direccion, contacto_emergencia, telefono_emergencia, observaciones } = req.body;
  
  // Creamos la consulta SQL para insertar un nuevo suscriptor
  const query = `INSERT INTO suscriptores (nombre, email, telefono, dni, fecha_nacimiento, direccion, contacto_emergencia, telefono_emergencia, observaciones) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  // Ejecutamos la consulta con los valores parametrizados
  conection.query(query, [nombre, email, telefono, dni, fecha_nacimiento, direccion, contacto_emergencia, telefono_emergencia, observaciones], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
};

const borrarSuscriptores = (req, res) => {
  const id = req.params.id;
  const query = `UPDATE suscriptores SET estado = 'Inactivo' WHERE id = ?`;
  
  conection.query(query, [id], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
};

const editarSuscriptores = (req, res) => {
  const id = req.params.id;
  const { nombre, email, telefono, dni, fecha_nacimiento, direccion, contacto_emergencia, telefono_emergencia, estado, observaciones } = req.body;

  const query = `UPDATE suscriptores 
                 SET nombre = ?, 
                     email = ?, 
                     telefono = ?,
                     dni = ?,
                     fecha_nacimiento = ?,
                     direccion = ?,
                     contacto_emergencia = ?,
                     telefono_emergencia = ?,
                     estado = ?,
                     observaciones = ?
                 WHERE id = ?`;
  
  conection.query(query, [nombre, email, telefono, dni, fecha_nacimiento, direccion, contacto_emergencia, telefono_emergencia, estado, observaciones, id], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
};

const verSuscriptores = (req, res) => {
  const id = req.params.id;
  const query = `SELECT s.*, 
                        GROUP_CONCAT(
                          CONCAT(a.nombre, ' - ', h.dias_semana, ' ', h.hora_inicio, '-', h.hora_fin) 
                          SEPARATOR '; '
                        ) as actividades_suscritas
                 FROM suscriptores s
                 LEFT JOIN suscripciones su ON su.suscriptor_id = s.id AND su.estado = 'Activa'
                 LEFT JOIN horarios h ON h.id = su.horario_id
                 LEFT JOIN actividades a ON a.id = h.actividad_id
                 WHERE s.id = ?
                 GROUP BY s.id`;
  
  conection.query(query, [id], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
};

const suscriptoresPorEstado = (req, res) => {
  const estado = req.params.estado;
  const query = `SELECT * FROM suscriptores WHERE estado = ? ORDER BY nombre`;
  
  conection.query(query, [estado], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
};

module.exports = {
  todoSuscriptores,
  agregarSuscriptores,
  borrarSuscriptores,
  editarSuscriptores,
  verSuscriptores,
  suscriptoresPorEstado,
};
