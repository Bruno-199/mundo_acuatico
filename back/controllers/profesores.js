//importa la conexion con la base de datos
const { conection } = require("../config/db");

//crea la funcion con los paramtros request y response
const todoProfesores = (req, res) => {
  console.log('Controller profesores - Recibida petición GET /profesores');
  const query = "SELECT * FROM profesores ORDER BY fecha_creacion DESC;";

  conection.query(query, (err, results) => {
    if (err) {
      console.error('Controller profesores - Error en consulta:', err);
      return res.status(500).json({ error: 'Error al obtener profesores' });
    }
    console.log('Controller profesores - Resultados obtenidos:', results.length, 'profesores');
    res.json(results);
  });
};

const agregarProfesores = (req, res) => {
  // Obtenemos los valores del request body
  const { nombre, especialidad, telefono, email, horario } = req.body;
  
  // Validar campos requeridos básicos (especialidad y horario pueden venir vacíos del frontend)
  if (!nombre || !telefono) {
    return res.status(400).json({ 
      error: 'Nombre y teléfono son requeridos' 
    });
  }
  
  // Validar longitud mínima del teléfono (según CHECK en la tabla)
  if (telefono.length < 7) {
    return res.status(400).json({ 
      error: 'El teléfono debe tener al menos 7 caracteres' 
    });
  }
  
  // Validar email si se proporciona (debe contener '@')
  if (email && email.trim() !== '' && !email.includes('@')) {
    return res.status(400).json({ 
      error: 'El email debe ser válido' 
    });
  }
  
  // Si especialidad viene vacía, usar valor por defecto
  const especialidadFinal = especialidad && especialidad.trim() !== '' ? especialidad : 'General';
  
  // Si horario viene vacío, usar valor por defecto
  const horarioFinal = horario && horario.trim() !== '' ? horario : 'Mañana';
  
  // Validar que el horario sea válido
  const horariosPermitidos = ['Mañana', 'Tarde', 'Noche'];
  if (!horariosPermitidos.includes(horarioFinal)) {
    return res.status(400).json({ 
      error: `Horario inválido. Debe ser uno de: ${horariosPermitidos.join(', ')}` 
    });
  }
  
  try {
    // Creamos la consulta SQL para insertar un nuevo profesor
    const query = `INSERT INTO profesores (nombre, especialidad, telefono, email, horario) 
                   VALUES (?, ?, ?, ?, ?)`;
    
    // Ejecutamos la consulta con los valores parametrizados
    conection.query(query, [nombre, especialidadFinal, telefono, email || null, horarioFinal], (err, results) => {
      if (err) {
        console.error('Error al agregar profesor:', err);
        
        // Manejo específico de errores comunes
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ 
            error: 'El email ya está registrado' 
          });
        }
        
        return res.status(500).json({ 
          error: 'Error al crear profesor: ' + err.message 
        });
      }
      
      res.status(201).json({ 
        message: 'Profesor agregado correctamente', 
        id: results.insertId 
      });
    });
  } catch (error) {
    console.error('Error en agregarProfesores:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const borrarProfesores = (req, res) => {
  const id = req.params.id;
  
  try {
    const query = `UPDATE profesores SET estado = 'Inactivo' WHERE id = ?`;
    
    conection.query(query, [id], (err, results) => {
      if (err) {
        console.error('Error al borrar profesor:', err);
        return res.status(500).json({ error: 'Error al desactivar profesor' });
      }
      
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Profesor no encontrado' });
      }
      
      res.json({ message: 'Profesor desactivado correctamente' });
    });
  } catch (error) {
    console.error('Error en borrarProfesores:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const editarProfesores = (req, res) => {
  const id = req.params.id;
  const { nombre, especialidad, telefono, email, horario, estado } = req.body;

  // Validar campos requeridos básicos
  if (!nombre || !telefono) {
    return res.status(400).json({ 
      error: 'Nombre y teléfono son requeridos' 
    });
  }
  
  // Validar longitud mínima del teléfono
  if (telefono.length < 7) {
    return res.status(400).json({ 
      error: 'El teléfono debe tener al menos 7 caracteres' 
    });
  }
  
  // Validar email si se proporciona
  if (email && email.trim() !== '' && !email.includes('@')) {
    return res.status(400).json({ 
      error: 'El email debe ser válido' 
    });
  }
  
  // Si especialidad viene vacía, usar valor por defecto
  const especialidadFinal = especialidad && especialidad.trim() !== '' ? especialidad : 'General';
  
  // Si horario viene vacío, usar valor por defecto válido del ENUM
  const horarioFinal = horario && horario.trim() !== '' ? horario : 'Mañana';
  
  // Validar horario si se proporciona
  const horariosPermitidos = ['Mañana', 'Tarde', 'Noche'];
  if (!horariosPermitidos.includes(horarioFinal)) {
    return res.status(400).json({ 
      error: `Horario inválido. Debe ser uno de: ${horariosPermitidos.join(', ')}` 
    });
  }
  
  // Validar estado si se proporciona
  const estadosPermitidos = ['Activo', 'Inactivo'];
  if (estado && !estadosPermitidos.includes(estado)) {
    return res.status(400).json({ 
      error: `Estado inválido. Debe ser uno de: ${estadosPermitidos.join(', ')}` 
    });
  }

  try {
    const query = `UPDATE profesores 
                   SET nombre = ?, 
                       especialidad = ?, 
                       telefono = ?,
                       email = ?,
                       horario = ?,
                       estado = ?,
                       fecha_actualizacion = CURRENT_TIMESTAMP
                   WHERE id = ?`;
    
    conection.query(query, [nombre, especialidadFinal, telefono, email || null, horarioFinal, estado, id], (err, results) => {
      if (err) {
        console.error('Error al editar profesor:', err);
        
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ 
            error: 'El email ya está registrado' 
          });
        }
        
        return res.status(500).json({ 
          error: 'Error al actualizar profesor: ' + err.message 
        });
      }
      
      if (results.affectedRows === 0) {
        return res.status(404).json({ 
          error: 'Profesor no encontrado' 
        });
      }
      
      res.json({ 
        message: 'Profesor actualizado correctamente' 
      });
    });
  } catch (error) {
    console.error('Error en editarProfesores:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const verProfesores = (req, res) => {
  const id = req.params.id;
  
  try {
    const query = `SELECT p.*, 
                          COUNT(h.id) as cantidad_horarios,
                          GROUP_CONCAT(DISTINCT a.nombre) as actividades
                   FROM profesores p
                   LEFT JOIN horarios h ON h.profesor_id = p.id AND h.activo = TRUE
                   LEFT JOIN actividades a ON a.id = h.actividad_id AND a.activa = TRUE
                   WHERE p.id = ?
                   GROUP BY p.id`;
    
    conection.query(query, [id], (err, results) => {
      if (err) {
        console.error('Error al obtener profesor:', err);
        return res.status(500).json({ error: 'Error al obtener profesor' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Profesor no encontrado' });
      }
      
      res.json(results[0]);
    });
  } catch (error) {
    console.error('Error en verProfesores:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  todoProfesores,
  agregarProfesores,
  borrarProfesores,
  editarProfesores,
  verProfesores,
};
