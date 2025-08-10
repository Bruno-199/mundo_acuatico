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
                 ORDER BY su.estado, su.fecha_creacion DESC;`;

  conection.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener suscripciones:', err);
      return res.status(500).json({ error: 'Error al obtener suscripciones' });
    }
    res.json(results);
  });
};

const agregarSuscripciones = (req, res) => {
  // Obtenemos los valores del request body
  const { suscriptor_id, horario_id, monto_mensual, fecha_ultimo_pago, metodo_pago, observaciones } = req.body;
  
  // Validaciones básicas
  if (!suscriptor_id || !horario_id || monto_mensual === undefined || monto_mensual === null) {
    return res.status(400).json({ error: 'Los campos suscriptor, horario y monto mensual son obligatorios' });
  }

  // Validación de monto (debe ser >= 0)
  if (parseFloat(monto_mensual) < 0) {
    return res.status(400).json({ error: 'El monto mensual debe ser mayor o igual a 0' });
  }

  // Validación de método de pago
  const metodosValidos = ['Efectivo', 'Transferencia', 'Tarjeta'];
  if (metodo_pago && !metodosValidos.includes(metodo_pago)) {
    return res.status(400).json({ error: 'El método de pago debe ser: Efectivo, Transferencia o Tarjeta' });
  }

  // Validación de fecha de último pago (no puede ser futura)
  if (fecha_ultimo_pago) {
    const fechaPago = new Date(fecha_ultimo_pago);
    const hoy = new Date();
    if (fechaPago > hoy) {
      return res.status(400).json({ error: 'La fecha de último pago no puede ser futura' });
    }
  }

  // Verificar que el horario tenga cupo disponible
  const checkCupoQuery = `SELECT h.cupo_maximo, 
                                 COUNT(su.id) as suscripciones_activas
                          FROM horarios h
                          LEFT JOIN suscripciones su ON su.horario_id = h.id AND su.estado = 'Activa'
                          WHERE h.id = ?
                          GROUP BY h.id`;

  conection.query(checkCupoQuery, [horario_id], (err, cupoResults) => {
    if (err) {
      console.error('Error al verificar cupo:', err);
      return res.status(500).json({ error: 'Error al verificar cupo disponible' });
    }

    if (cupoResults.length === 0) {
      return res.status(404).json({ error: 'Horario no encontrado' });
    }

    const { cupo_maximo, suscripciones_activas } = cupoResults[0];
    if (suscripciones_activas >= cupo_maximo) {
      return res.status(400).json({ error: 'No hay cupo disponible en este horario' });
    }

    // Verificar que el suscriptor no esté ya inscrito en este horario
    const checkDuplicateQuery = `SELECT id FROM suscripciones 
                                WHERE suscriptor_id = ? AND horario_id = ? AND estado IN ('Activa', 'Pendiente')`;

    conection.query(checkDuplicateQuery, [suscriptor_id, horario_id], (err, duplicateResults) => {
      if (err) {
        console.error('Error al verificar duplicados:', err);
        return res.status(500).json({ error: 'Error al verificar suscripción duplicada' });
      }

      if (duplicateResults.length > 0) {
        return res.status(400).json({ error: 'El suscriptor ya está inscrito en este horario' });
      }

      // Creamos la consulta SQL para insertar una nueva suscripción
      const query = `INSERT INTO suscripciones (suscriptor_id, horario_id, monto_mensual, fecha_ultimo_pago, metodo_pago, observaciones) 
                     VALUES (?, ?, ?, ?, ?, ?)`;
      
      // Ejecutamos la consulta con los valores parametrizados
      conection.query(query, [
        suscriptor_id, 
        horario_id, 
        monto_mensual, 
        fecha_ultimo_pago || null, 
        metodo_pago || 'Efectivo', 
        observaciones || ''
      ], (err, results) => {
        if (err) {
          console.error('Error al agregar suscripción:', err);
          if (err.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ error: 'Suscriptor o horario no válido' });
          }
          if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
            return res.status(400).json({ error: 'Los datos no cumplen con las restricciones de la base de datos' });
          }
          return res.status(500).json({ error: 'Error al agregar suscripción' });
        }
        res.json({ message: 'Suscripción agregada exitosamente', id: results.insertId });
      });
    });
  });
};

const borrarSuscripciones = (req, res) => {
  const id = req.params.id;
  
  if (!id) {
    return res.status(400).json({ error: 'ID de suscripción requerido' });
  }

  const query = `UPDATE suscripciones SET estado = 'Cancelada' WHERE id = ?`;
  
  conection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error al cancelar suscripción:', err);
      return res.status(500).json({ error: 'Error al cancelar suscripción' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Suscripción no encontrada' });
    }
    
    res.json({ message: 'Suscripción cancelada exitosamente' });
  });
};

const editarSuscripciones = (req, res) => {
  const id = req.params.id;
  const { horario_id, estado, monto_mensual, fecha_ultimo_pago, metodo_pago, observaciones } = req.body;

  // Validaciones básicas
  if (!id) {
    return res.status(400).json({ error: 'ID de suscripción requerido' });
  }

  if (horario_id && monto_mensual === undefined) {
    return res.status(400).json({ error: 'El monto mensual es obligatorio' });
  }

  // Validación de monto (debe ser >= 0)
  if (monto_mensual !== undefined && parseFloat(monto_mensual) < 0) {
    return res.status(400).json({ error: 'El monto mensual debe ser mayor o igual a 0' });
  }

  // Validación de estado ENUM
  const estadosValidos = ['Activa', 'Pendiente', 'Vencida', 'Cancelada'];
  if (estado && !estadosValidos.includes(estado)) {
    return res.status(400).json({ error: 'El estado debe ser: Activa, Pendiente, Vencida o Cancelada' });
  }

  // Validación de método de pago
  const metodosValidos = ['Efectivo', 'Transferencia', 'Tarjeta'];
  if (metodo_pago && !metodosValidos.includes(metodo_pago)) {
    return res.status(400).json({ error: 'El método de pago debe ser: Efectivo, Transferencia o Tarjeta' });
  }

  // Validación de fecha de último pago (no puede ser futura)
  if (fecha_ultimo_pago) {
    const fechaPago = new Date(fecha_ultimo_pago);
    const hoy = new Date();
    if (fechaPago > hoy) {
      return res.status(400).json({ error: 'La fecha de último pago no puede ser futura' });
    }
  }

  const query = `UPDATE suscripciones 
                 SET horario_id = COALESCE(?, horario_id),
                     estado = COALESCE(?, estado),
                     monto_mensual = COALESCE(?, monto_mensual),
                     fecha_ultimo_pago = ?,
                     metodo_pago = COALESCE(?, metodo_pago),
                     observaciones = COALESCE(?, observaciones)
                 WHERE id = ?`;
  
  conection.query(query, [
    horario_id, 
    estado, 
    monto_mensual, 
    fecha_ultimo_pago, 
    metodo_pago, 
    observaciones, 
    id
  ], (err, results) => {
    if (err) {
      console.error('Error al editar suscripción:', err);
      if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ error: 'Horario no válido' });
      }
      if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
        return res.status(400).json({ error: 'Los datos no cumplen con las restricciones de la base de datos' });
      }
      return res.status(500).json({ error: 'Error al editar suscripción' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Suscripción no encontrada' });
    }
    
    res.json({ message: 'Suscripción actualizada exitosamente' });
  });
};

const verSuscripciones = (req, res) => {
  const id = req.params.id;
  
  if (!id) {
    return res.status(400).json({ error: 'ID de suscripción requerido' });
  }

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
    if (err) {
      console.error('Error al obtener suscripción:', err);
      return res.status(500).json({ error: 'Error al obtener suscripción' });
    }
    res.json(results);
  });
};

const suscripcionesPorSuscriptor = (req, res) => {
  const suscriptor_id = req.params.suscriptor_id;
  
  if (!suscriptor_id) {
    return res.status(400).json({ error: 'ID de suscriptor requerido' });
  }

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
    if (err) {
      console.error('Error al obtener suscripciones por suscriptor:', err);
      return res.status(500).json({ error: 'Error al obtener suscripciones por suscriptor' });
    }
    res.json(results);
  });
};

const suscripcionesPorEstado = (req, res) => {
  const estado = req.params.estado;
  
  // Validar que el estado sea válido
  const estadosValidos = ['Activa', 'Pendiente', 'Vencida', 'Cancelada'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado no válido. Debe ser: Activa, Pendiente, Vencida o Cancelada' });
  }

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
    if (err) {
      console.error('Error al obtener suscripciones por estado:', err);
      return res.status(500).json({ error: 'Error al obtener suscripciones por estado' });
    }
    res.json(results);
  });
};

const actualizarPago = (req, res) => {
  const id = req.params.id;
  const { fecha_ultimo_pago, metodo_pago } = req.body;

  // Validaciones básicas
  if (!id) {
    return res.status(400).json({ error: 'ID de suscripción requerido' });
  }

  if (!fecha_ultimo_pago) {
    return res.status(400).json({ error: 'Fecha de último pago requerida' });
  }

  // Validación de método de pago
  const metodosValidos = ['Efectivo', 'Transferencia', 'Tarjeta'];
  if (metodo_pago && !metodosValidos.includes(metodo_pago)) {
    return res.status(400).json({ error: 'El método de pago debe ser: Efectivo, Transferencia o Tarjeta' });
  }

  // Validación de fecha de último pago (no puede ser futura)
  const fechaPago = new Date(fecha_ultimo_pago);
  const hoy = new Date();
  if (fechaPago > hoy) {
    return res.status(400).json({ error: 'La fecha de último pago no puede ser futura' });
  }

  const query = `UPDATE suscripciones 
                 SET fecha_ultimo_pago = ?, 
                     metodo_pago = ?,
                     estado = 'Activa'
                 WHERE id = ?`;
  
  conection.query(query, [fecha_ultimo_pago, metodo_pago || 'Efectivo', id], (err, results) => {
    if (err) {
      console.error('Error al actualizar pago:', err);
      return res.status(500).json({ error: 'Error al actualizar pago' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Suscripción no encontrada' });
    }
    
    res.json({ message: 'Pago actualizado exitosamente' });
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
