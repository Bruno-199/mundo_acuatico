//importa la conexion con la base de datos
const { conection } = require("../config/db");

//crea la funcion con los paramtros request y response
const todoActividades = (req, res) => {
  const query = "SELECT * FROM actividades ORDER BY fecha_creacion DESC;";

  conection.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener actividades:', err);
      return res.status(500).json({ error: 'Error al obtener actividades' });
    }
    res.json(results);
  });
};

const agregarActividades = (req, res) => {
  // Obtenemos los valores del request body
  const { nombre, descripcion, form_url, imagen_url, precio_mensual } = req.body;
  
  // Validar campos requeridos
  if (!nombre || nombre.trim().length < 3) {
    return res.status(400).json({ 
      error: 'El nombre es requerido y debe tener al menos 3 caracteres' 
    });
  }
  
  // Validar precio mensual
  const precio = parseFloat(precio_mensual) || 0.00;
  if (precio < 0) {
    return res.status(400).json({ 
      error: 'El precio mensual no puede ser negativo' 
    });
  }
  
  // Validar URLs si se proporcionan
  if (form_url && form_url.trim() && !isValidUrl(form_url)) {
    return res.status(400).json({ 
      error: 'La URL del formulario no es válida' 
    });
  }
  
  if (imagen_url && imagen_url.trim() && !isValidUrl(imagen_url)) {
    return res.status(400).json({ 
      error: 'La URL de la imagen no es válida' 
    });
  }
  
  try {
    // Creamos la consulta SQL para insertar una nueva actividad
    const query = `INSERT INTO actividades (nombre, descripcion, form_url, imagen_url, precio_mensual) 
                   VALUES (?, ?, ?, ?, ?)`;
    
    // Ejecutamos la consulta con los valores parametrizados
    conection.query(query, [
      nombre.trim(), 
      descripcion?.trim() || null, 
      form_url?.trim() || null, 
      imagen_url?.trim() || null, 
      precio
    ], (err, results) => {
      if (err) {
        console.error('Error al agregar actividad:', err);
        return res.status(500).json({ 
          error: 'Error al crear actividad: ' + err.message 
        });
      }
      
      res.status(201).json({ 
        message: 'Actividad agregada correctamente', 
        id: results.insertId 
      });
    });
  } catch (error) {
    console.error('Error en agregarActividades:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Función auxiliar para validar URLs
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

const borrarActividades = (req, res) => {
  const id = req.params.id;
  
  try {
    // Cambio activa por estado según la nueva estructura
    const query = `UPDATE actividades SET estado = 'Inactivo' WHERE id = ?`;
    
    conection.query(query, [id], (err, results) => {
      if (err) {
        console.error('Error al borrar actividad:', err);
        return res.status(500).json({ error: 'Error al desactivar actividad' });
      }
      
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Actividad no encontrada' });
      }
      
      res.json({ message: 'Actividad desactivada correctamente' });
    });
  } catch (error) {
    console.error('Error en borrarActividades:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const editarActividades = (req, res) => {
  const id = req.params.id;
  const { nombre, descripcion, form_url, imagen_url, estado, precio_mensual } = req.body;

  // Validar campos requeridos
  if (!nombre || nombre.trim().length < 3) {
    return res.status(400).json({ 
      error: 'El nombre es requerido y debe tener al menos 3 caracteres' 
    });
  }
  
  // Validar precio mensual
  const precio = parseFloat(precio_mensual) || 0.00;
  if (precio < 0) {
    return res.status(400).json({ 
      error: 'El precio mensual no puede ser negativo' 
    });
  }
  
  // Validar estado
  const estadosPermitidos = ['Activo', 'Inactivo'];
  if (estado && !estadosPermitidos.includes(estado)) {
    return res.status(400).json({ 
      error: `Estado inválido. Debe ser uno de: ${estadosPermitidos.join(', ')}` 
    });
  }
  
  // Validar URLs si se proporcionan
  if (form_url && form_url.trim() && !isValidUrl(form_url)) {
    return res.status(400).json({ 
      error: 'La URL del formulario no es válida' 
    });
  }
  
  if (imagen_url && imagen_url.trim() && !isValidUrl(imagen_url)) {
    return res.status(400).json({ 
      error: 'La URL de la imagen no es válida' 
    });
  }

  try {
    // Cambio activa por estado según la nueva estructura
    const query = `UPDATE actividades 
                   SET nombre = ?, 
                       descripcion = ?, 
                       form_url = ?,
                       imagen_url = ?,
                       estado = ?,
                       precio_mensual = ?
                   WHERE id = ?`;
    
    conection.query(query, [
      nombre.trim(), 
      descripcion?.trim() || null, 
      form_url?.trim() || null, 
      imagen_url?.trim() || null, 
      estado, 
      precio, 
      id
    ], (err, results) => {
      if (err) {
        console.error('Error al editar actividad:', err);
        return res.status(500).json({ 
          error: 'Error al actualizar actividad: ' + err.message 
        });
      }
      
      if (results.affectedRows === 0) {
        return res.status(404).json({ 
          error: 'Actividad no encontrada' 
        });
      }
      
      res.json({ 
        message: 'Actividad actualizada correctamente' 
      });
    });
  } catch (error) {
    console.error('Error en editarActividades:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const verActividades = (req, res) => {
  const id = req.params.id;
  
  try {
    // Cambio activo por estado según la nueva estructura
    const query = `SELECT a.*, 
                          COUNT(h.id) as cantidad_horarios,
                          COUNT(s.id) as cantidad_suscripciones
                   FROM actividades a
                   LEFT JOIN horarios h ON h.actividad_id = a.id AND h.activo = TRUE
                   LEFT JOIN suscripciones s ON s.horario_id = h.id AND s.estado = 'Activa'
                   WHERE a.id = ?
                   GROUP BY a.id`;
    
    conection.query(query, [id], (err, results) => {
      if (err) {
        console.error('Error al obtener actividad:', err);
        return res.status(500).json({ error: 'Error al obtener actividad' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Actividad no encontrada' });
      }
      
      res.json(results[0]);
    });
  } catch (error) {
    console.error('Error en verActividades:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  todoActividades,
  agregarActividades,
  borrarActividades,
  editarActividades,
  verActividades,
};
