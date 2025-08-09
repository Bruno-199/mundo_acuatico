//importa la conexion con la base de datos
const { conection } = require("../config/db");

//crea la funcion con los paramtros request y response
const todoHorarios = (req, res) => {
  const query = `SELECT h.*, 
                        a.nombre as actividad_nombre,
                        p.nombre as profesor_nombre,
                        COUNT(s.id) as suscripciones_actuales
                 FROM horarios h
                 INNER JOIN actividades a ON a.id = h.actividad_id
                 INNER JOIN profesores p ON p.id = h.profesor_id
                 LEFT JOIN suscripciones s ON s.horario_id = h.id AND s.estado = 'Activa'
                 WHERE h.activo = TRUE
                 GROUP BY h.id
                 ORDER BY h.dias_semana, h.hora_inicio;`;

  conection.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
};

const agregarHorarios = (req, res) => {
  // Obtenemos los valores del request body
  const { actividad_id, profesor_id, dias_semana, hora_inicio, hora_fin, cupo_maximo, observaciones } = req.body;
  
  // Creamos la consulta SQL para insertar un nuevo horario
  const query = `INSERT INTO horarios (actividad_id, profesor_id, dias_semana, hora_inicio, hora_fin, cupo_maximo, observaciones) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
  
  // Ejecutamos la consulta con los valores parametrizados
  conection.query(query, [actividad_id, profesor_id, dias_semana, hora_inicio, hora_fin, cupo_maximo, observaciones], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
};

const borrarHorarios = (req, res) => {
  const id = req.params.id;
  const query = `UPDATE horarios SET activo = FALSE WHERE id = ?`;
  
  conection.query(query, [id], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
};

const editarHorarios = (req, res) => {
  const id = req.params.id;
  const { actividad_id, profesor_id, dias_semana, hora_inicio, hora_fin, cupo_maximo, activo, observaciones } = req.body;

  const query = `UPDATE horarios 
                 SET actividad_id = ?, 
                     profesor_id = ?, 
                     dias_semana = ?,
                     hora_inicio = ?,
                     hora_fin = ?,
                     cupo_maximo = ?,
                     activo = ?,
                     observaciones = ?
                 WHERE id = ?`;
  
  conection.query(query, [actividad_id, profesor_id, dias_semana, hora_inicio, hora_fin, cupo_maximo, activo, observaciones, id], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
};

const verHorarios = (req, res) => {
  const id = req.params.id;
  const query = `SELECT h.*, 
                        a.nombre as actividad_nombre,
                        a.descripcion as actividad_descripcion,
                        a.precio_mensual,
                        p.nombre as profesor_nombre,
                        p.especialidad,
                        COUNT(s.id) as suscripciones_actuales,
                        (h.cupo_maximo - COUNT(s.id)) as cupos_disponibles
                 FROM horarios h
                 INNER JOIN actividades a ON a.id = h.actividad_id
                 INNER JOIN profesores p ON p.id = h.profesor_id
                 LEFT JOIN suscripciones s ON s.horario_id = h.id AND s.estado = 'Activa'
                 WHERE h.id = ?
                 GROUP BY h.id`;
  
  conection.query(query, [id], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
};

const horariosPorActividad = (req, res) => {
  const actividad_id = req.params.actividad_id;
  const query = `SELECT h.*, 
                        p.nombre as profesor_nombre,
                        COUNT(s.id) as suscripciones_actuales,
                        (h.cupo_maximo - COUNT(s.id)) as cupos_disponibles
                 FROM horarios h
                 INNER JOIN profesores p ON p.id = h.profesor_id
                 LEFT JOIN suscripciones s ON s.horario_id = h.id AND s.estado = 'Activa'
                 WHERE h.actividad_id = ? AND h.activo = TRUE
                 GROUP BY h.id
                 ORDER BY h.dias_semana, h.hora_inicio`;
  
  conection.query(query, [actividad_id], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
};

module.exports = {
  todoHorarios,
  agregarHorarios,
  borrarHorarios,
  editarHorarios,
  verHorarios,
  horariosPorActividad,
};
