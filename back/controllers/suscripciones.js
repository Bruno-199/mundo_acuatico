//importa la conexion con la base de datos
const { conection } = require("../config/db");

//crea la funcion con los paramtros request y response
const todoSuscripciones = (req, res) => {
  const query = `SELECT su.*, 
                        s.nombre as suscriptor_nombre,
                        s.email as suscriptor_email,
                        s.telefono as suscriptor_telefono,
                        a.nombre as actividad_nombre,
                        h.dias_semana,
                        h.hora_inicio,
                        h.hora_fin,
                        p.nombre as profesor_nombre
                 FROM suscripciones su
                 INNER JOIN suscriptores s ON s.id = su.suscriptor_id
                 INNER JOIN horarios h ON h.id = su.horario_id
                 INNER JOIN actividades a ON a.id = h.actividad_id
                 INNER JOIN profesores p ON p.id = h.profesor_id
                 WHERE su.estado IN ('Activa', 'Pendiente')
                 ORDER BY su.fecha_creacion DESC;`;

  conection.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
};

const agregarSuscripciones = (req, res) => {
  // Obtenemos los valores del request body
  const { suscriptor_id, horario_id, fecha_inicio, fecha_fin, monto_mensual, fecha_ultimo_pago, metodo_pago, observaciones } = req.body;
  
  // Creamos la consulta SQL para insertar una nueva suscripción
  const query = `INSERT INTO suscripciones (suscriptor_id, horario_id, fecha_inicio, fecha_fin, monto_mensual, fecha_ultimo_pago, metodo_pago, observaciones) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  
  // Ejecutamos la consulta con los valores parametrizados
  conection.query(query, [suscriptor_id, horario_id, fecha_inicio, fecha_fin, monto_mensual, fecha_ultimo_pago, metodo_pago, observaciones], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
};

const borrarSuscripciones = (req, res) => {
  const id = req.params.id;
  const query = `UPDATE suscripciones SET estado = 'Cancelada' WHERE id = ?`;
  
  conection.query(query, [id], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
};

const editarSuscripciones = (req, res) => {
  const id = req.params.id;
  const { horario_id, fecha_inicio, fecha_fin, estado, monto_mensual, fecha_ultimo_pago, metodo_pago, observaciones } = req.body;

  const query = `UPDATE suscripciones 
                 SET horario_id = ?, 
                     fecha_inicio = ?, 
                     fecha_fin = ?,
                     estado = ?,
                     monto_mensual = ?,
                     fecha_ultimo_pago = ?,
                     metodo_pago = ?,
                     observaciones = ?
                 WHERE id = ?`;
  
  conection.query(query, [horario_id, fecha_inicio, fecha_fin, estado, monto_mensual, fecha_ultimo_pago, metodo_pago, observaciones, id], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
};

const verSuscripciones = (req, res) => {
  const id = req.params.id;
  const query = `SELECT su.*, 
                        s.nombre as suscriptor_nombre,
                        s.email as suscriptor_email,
                        s.telefono as suscriptor_telefono,
                        s.dni as suscriptor_dni,
                        a.nombre as actividad_nombre,
                        a.descripcion as actividad_descripcion,
                        h.dias_semana,
                        h.hora_inicio,
                        h.hora_fin,
                        h.cupo_maximo,
                        p.nombre as profesor_nombre,
                        p.especialidad as profesor_especialidad
                 FROM suscripciones su
                 INNER JOIN suscriptores s ON s.id = su.suscriptor_id
                 INNER JOIN horarios h ON h.id = su.horario_id
                 INNER JOIN actividades a ON a.id = h.actividad_id
                 INNER JOIN profesores p ON p.id = h.profesor_id
                 WHERE su.id = ?`;
  
  conection.query(query, [id], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
};

const suscripcionesPorSuscriptor = (req, res) => {
  const suscriptor_id = req.params.suscriptor_id;
  const query = `SELECT su.*, 
                        a.nombre as actividad_nombre,
                        h.dias_semana,
                        h.hora_inicio,
                        h.hora_fin,
                        p.nombre as profesor_nombre
                 FROM suscripciones su
                 INNER JOIN horarios h ON h.id = su.horario_id
                 INNER JOIN actividades a ON a.id = h.actividad_id
                 INNER JOIN profesores p ON p.id = h.profesor_id
                 WHERE su.suscriptor_id = ?
                 ORDER BY su.fecha_creacion DESC`;
  
  conection.query(query, [suscriptor_id], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
};

const suscripcionesPorEstado = (req, res) => {
  const estado = req.params.estado;
  const query = `SELECT su.*, 
                        s.nombre as suscriptor_nombre,
                        a.nombre as actividad_nombre,
                        h.dias_semana,
                        h.hora_inicio,
                        h.hora_fin
                 FROM suscripciones su
                 INNER JOIN suscriptores s ON s.id = su.suscriptor_id
                 INNER JOIN horarios h ON h.id = su.horario_id
                 INNER JOIN actividades a ON a.id = h.actividad_id
                 WHERE su.estado = ?
                 ORDER BY su.fecha_creacion DESC`;
  
  conection.query(query, [estado], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
};

const actualizarPago = (req, res) => {
  const id = req.params.id;
  const { fecha_ultimo_pago, metodo_pago } = req.body;

  const query = `UPDATE suscripciones 
                 SET fecha_ultimo_pago = ?, 
                     metodo_pago = ?,
                     estado = 'Activa'
                 WHERE id = ?`;
  
  conection.query(query, [fecha_ultimo_pago, metodo_pago, id], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
};

module.exports = {
  todoSuscripciones,
  agregarSuscripciones,
  borrarSuscripciones,
  editarSuscripciones,
  verSuscripciones,
  suscripcionesPorSuscriptor,
  suscripcionesPorEstado,
  actualizarPago,
};
