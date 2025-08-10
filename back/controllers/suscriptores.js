//importa la conexion con la base de datos
const { conection } = require("../config/db");

//crea la funcion con los paramtros request y response
const todoSuscriptores = (req, res) => {
  const query = "SELECT * FROM suscriptores ORDER BY estado, nombre;";

  conection.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener suscriptores:', err);
      return res.status(500).json({ error: 'Error al obtener suscriptores' });
    }
    res.json(results);
  });
};

const agregarSuscriptores = (req, res) => {
  // Obtenemos los valores del request body
  const { nombre, email, telefono, dni, fecha_nacimiento, direccion, contacto_emergencia, telefono_emergencia, observaciones } = req.body;
  
  // Validaciones básicas
  if (!nombre || !email || !telefono || !fecha_nacimiento) {
    return res.status(400).json({ error: 'Los campos nombre, email, teléfono y fecha de nacimiento son obligatorios' });
  }

  // Validación de nombre (mínimo 2 caracteres)
  if (nombre.length < 2) {
    return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres' });
  }

  // Validación de email
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'El email debe tener un formato válido' });
  }

  // Validación de teléfono (mínimo 7 caracteres)
  if (telefono.length < 7) {
    return res.status(400).json({ error: 'El teléfono debe tener al menos 7 caracteres' });
  }

  // Validación de teléfono de emergencia (si se proporciona, mínimo 7 caracteres)
  if (telefono_emergencia && telefono_emergencia.length < 7) {
    return res.status(400).json({ error: 'El teléfono de emergencia debe tener al menos 7 caracteres' });
  }

  // Validación de DNI (si se proporciona, mínimo 7 caracteres)
  if (dni && dni.length < 7) {
    return res.status(400).json({ error: 'El DNI debe tener al menos 7 caracteres' });
  }

  // Validación de fecha de nacimiento
  const fechaNac = new Date(fecha_nacimiento);
  const hoy = new Date();
  if (fechaNac >= hoy) {
    return res.status(400).json({ error: 'La fecha de nacimiento debe ser anterior a la fecha actual' });
  }

  // Validar edad mínima (ejemplo: 5 años)
  const edad = Math.floor((hoy - fechaNac) / (365.25 * 24 * 60 * 60 * 1000));
  if (edad < 5) {
    return res.status(400).json({ error: 'El suscriptor debe tener al menos 5 años' });
  }
  
  // Creamos la consulta SQL para insertar un nuevo suscriptor
  const query = `INSERT INTO suscriptores (nombre, email, telefono, dni, fecha_nacimiento, direccion, contacto_emergencia, telefono_emergencia, observaciones) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  // Ejecutamos la consulta con los valores parametrizados
  conection.query(query, [
    nombre, 
    email, 
    telefono, 
    dni || null, 
    fecha_nacimiento, 
    direccion || '', 
    contacto_emergencia || '', 
    telefono_emergencia || '', 
    observaciones || ''
  ], (err, results) => {
    if (err) {
      console.error('Error al agregar suscriptor:', err);
      // Manejar errores específicos de la base de datos
      if (err.code === 'ER_DUP_ENTRY') {
        if (err.message.includes('email')) {
          return res.status(400).json({ error: 'El email ya está registrado' });
        }
        if (err.message.includes('dni')) {
          return res.status(400).json({ error: 'El DNI ya está registrado' });
        }
      }
      if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
        return res.status(400).json({ error: 'Los datos no cumplen con las restricciones de la base de datos' });
      }
      return res.status(500).json({ error: 'Error al agregar suscriptor' });
    }
    res.json({ message: 'Suscriptor agregado exitosamente', id: results.insertId });
  });
};

const borrarSuscriptores = (req, res) => {
  const id = req.params.id;
  
  if (!id) {
    return res.status(400).json({ error: 'ID de suscriptor requerido' });
  }

  const query = `UPDATE suscriptores SET estado = 'Inactivo' WHERE id = ?`;
  
  conection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error al desactivar suscriptor:', err);
      return res.status(500).json({ error: 'Error al desactivar suscriptor' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Suscriptor no encontrado' });
    }
    
    res.json({ message: 'Suscriptor desactivado exitosamente' });
  });
};

const editarSuscriptores = (req, res) => {
  const id = req.params.id;
  const { nombre, email, telefono, dni, fecha_nacimiento, direccion, contacto_emergencia, telefono_emergencia, estado, observaciones } = req.body;

  // Validaciones básicas
  if (!id) {
    return res.status(400).json({ error: 'ID de suscriptor requerido' });
  }

  if (!nombre || !email || !telefono || !fecha_nacimiento) {
    return res.status(400).json({ error: 'Los campos nombre, email, teléfono y fecha de nacimiento son obligatorios' });
  }

  // Validación de nombre (mínimo 2 caracteres)
  if (nombre.length < 2) {
    return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres' });
  }

  // Validación de email
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'El email debe tener un formato válido' });
  }

  // Validación de teléfono (mínimo 7 caracteres)
  if (telefono.length < 7) {
    return res.status(400).json({ error: 'El teléfono debe tener al menos 7 caracteres' });
  }

  // Validación de teléfono de emergencia (si se proporciona, mínimo 7 caracteres)
  if (telefono_emergencia && telefono_emergencia.length < 7) {
    return res.status(400).json({ error: 'El teléfono de emergencia debe tener al menos 7 caracteres' });
  }

  // Validación de DNI (si se proporciona, mínimo 7 caracteres)
  if (dni && dni.length < 7) {
    return res.status(400).json({ error: 'El DNI debe tener al menos 7 caracteres' });
  }

  // Validación de estado ENUM
  const estadosValidos = ['Activo', 'Pendiente', 'Inactivo'];
  if (estado && !estadosValidos.includes(estado)) {
    return res.status(400).json({ error: 'El estado debe ser: Activo, Pendiente o Inactivo' });
  }

  // Validación de fecha de nacimiento
  const fechaNac = new Date(fecha_nacimiento);
  const hoy = new Date();
  if (fechaNac >= hoy) {
    return res.status(400).json({ error: 'La fecha de nacimiento debe ser anterior a la fecha actual' });
  }

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
  
  conection.query(query, [
    nombre, 
    email, 
    telefono, 
    dni || null, 
    fecha_nacimiento, 
    direccion || '', 
    contacto_emergencia || '', 
    telefono_emergencia || '', 
    estado || 'Pendiente', 
    observaciones || '', 
    id
  ], (err, results) => {
    if (err) {
      console.error('Error al editar suscriptor:', err);
      // Manejar errores específicos de la base de datos
      if (err.code === 'ER_DUP_ENTRY') {
        if (err.message.includes('email')) {
          return res.status(400).json({ error: 'El email ya está registrado por otro suscriptor' });
        }
        if (err.message.includes('dni')) {
          return res.status(400).json({ error: 'El DNI ya está registrado por otro suscriptor' });
        }
      }
      if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
        return res.status(400).json({ error: 'Los datos no cumplen con las restricciones de la base de datos' });
      }
      return res.status(500).json({ error: 'Error al editar suscriptor' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Suscriptor no encontrado' });
    }
    
    res.json({ message: 'Suscriptor actualizado exitosamente' });
  });
};

const verSuscriptores = (req, res) => {
  const id = req.params.id;
  
  if (!id) {
    return res.status(400).json({ error: 'ID de suscriptor requerido' });
  }

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
    if (err) {
      console.error('Error al obtener suscriptor:', err);
      return res.status(500).json({ error: 'Error al obtener suscriptor' });
    }
    res.json(results);
  });
};

const suscriptoresPorEstado = (req, res) => {
  const estado = req.params.estado;
  
  // Validar que el estado sea válido
  const estadosValidos = ['Activo', 'Pendiente', 'Inactivo'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado no válido. Debe ser: Activo, Pendiente o Inactivo' });
  }

  const query = `SELECT * FROM suscriptores WHERE estado = ? ORDER BY nombre`;
  
  conection.query(query, [estado], (err, results) => {
    if (err) {
      console.error('Error al obtener suscriptores por estado:', err);
      return res.status(500).json({ error: 'Error al obtener suscriptores por estado' });
    }
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
