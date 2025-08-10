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
                 GROUP BY h.id
                 ORDER BY h.activo DESC, h.dias_semana, h.hora_inicio;`;

  conection.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener horarios:', err);
      return res.status(500).json({ error: 'Error al obtener horarios' });
    }
    res.json(results);
  });
};

const agregarHorarios = (req, res) => {
  // Obtenemos los valores del request body
  const { actividad_id, profesor_id, dias_semana, hora_inicio, hora_fin, cupo_maximo, observaciones } = req.body;
  
  // Validaciones básicas
  if (!actividad_id || !profesor_id || !dias_semana || !hora_inicio || !hora_fin) {
    return res.status(400).json({ error: 'Todos los campos obligatorios deben estar completos' });
  }

  // Validación de cupo máximo según restricciones de la BD
  const cupo = cupo_maximo || 20; // Default 20 como en la BD
  if (cupo < 1 || cupo > 50) {
    return res.status(400).json({ error: 'El cupo máximo debe estar entre 1 y 50 personas' });
  }

  // Validación de días de la semana (mínimo 5 caracteres)
  if (dias_semana.length < 5) {
    return res.status(400).json({ error: 'Los días de la semana deben tener al menos 5 caracteres' });
  }

  // Validación de horarios (hora_fin > hora_inicio)
  if (hora_inicio >= hora_fin) {
    return res.status(400).json({ error: 'La hora de inicio debe ser anterior a la hora de fin' });
  }

  // Validación de observaciones (máximo 200 caracteres)
  if (observaciones && observaciones.length > 200) {
    return res.status(400).json({ error: 'Las observaciones no pueden exceder 200 caracteres' });
  }
  
  // Creamos la consulta SQL para insertar un nuevo horario
  const query = `INSERT INTO horarios (actividad_id, profesor_id, dias_semana, hora_inicio, hora_fin, cupo_maximo, observaciones) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
  
  // Ejecutamos la consulta con los valores parametrizados
  conection.query(query, [actividad_id, profesor_id, dias_semana, hora_inicio, hora_fin, cupo, observaciones || ''], (err, results) => {
    if (err) {
      console.error('Error al agregar horario:', err);
      // Manejar errores específicos de la base de datos
      if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
        return res.status(400).json({ error: 'Los datos no cumplen con las restricciones de la base de datos' });
      }
      return res.status(500).json({ error: 'Error al agregar horario' });
    }
    res.json({ message: 'Horario agregado exitosamente', id: results.insertId });
  });
};

const borrarHorarios = (req, res) => {
  const id = req.params.id;
  
  if (!id) {
    return res.status(400).json({ error: 'ID de horario requerido' });
  }

  const query = `UPDATE horarios SET activo = FALSE WHERE id = ?`;
  
  conection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error al desactivar horario:', err);
      return res.status(500).json({ error: 'Error al desactivar horario' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Horario no encontrado' });
    }
    
    res.json({ message: 'Horario desactivado exitosamente' });
  });
};

const editarHorarios = (req, res) => {
  const id = req.params.id;
  const { actividad_id, profesor_id, dias_semana, hora_inicio, hora_fin, cupo_maximo, activo, observaciones } = req.body;

  // Validaciones básicas
  if (!id) {
    return res.status(400).json({ error: 'ID de horario requerido' });
  }

  if (!actividad_id || !profesor_id || !dias_semana || !hora_inicio || !hora_fin) {
    return res.status(400).json({ error: 'Todos los campos obligatorios deben estar completos' });
  }

  // Validación de cupo máximo según restricciones de la BD
  const cupo = cupo_maximo || 20; // Default 20 como en la BD
  if (cupo < 1 || cupo > 50) {
    return res.status(400).json({ error: 'El cupo máximo debe estar entre 1 y 50 personas' });
  }

  // Validación de días de la semana (mínimo 5 caracteres)
  if (dias_semana.length < 5) {
    return res.status(400).json({ error: 'Los días de la semana deben tener al menos 5 caracteres' });
  }

  // Validación de horarios (hora_fin > hora_inicio)
  if (hora_inicio >= hora_fin) {
    return res.status(400).json({ error: 'La hora de inicio debe ser anterior a la hora de fin' });
  }

  // Validación de observaciones (máximo 200 caracteres)
  if (observaciones && observaciones.length > 200) {
    return res.status(400).json({ error: 'Las observaciones no pueden exceder 200 caracteres' });
  }

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
  
  conection.query(query, [actividad_id, profesor_id, dias_semana, hora_inicio, hora_fin, cupo, activo, observaciones || '', id], (err, results) => {
    if (err) {
      console.error('Error al editar horario:', err);
      // Manejar errores específicos de la base de datos
      if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
        return res.status(400).json({ error: 'Los datos no cumplen con las restricciones de la base de datos' });
      }
      return res.status(500).json({ error: 'Error al editar horario' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Horario no encontrado' });
    }
    
    res.json({ message: 'Horario actualizado exitosamente' });
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
    if (err) {
      console.error('Error al obtener horario:', err);
      return res.status(500).json({ error: 'Error al obtener horario' });
    }
    res.json(results);
  });
};

const horariosPorActividad = (req, res) => {
  const actividad_id = req.params.actividad_id;
  
  if (!actividad_id) {
    return res.status(400).json({ error: 'ID de actividad requerido' });
  }

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
    if (err) {
      console.error('Error al obtener horarios por actividad:', err);
      return res.status(500).json({ error: 'Error al obtener horarios por actividad' });
    }
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
