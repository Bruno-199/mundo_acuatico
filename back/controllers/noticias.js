//importa la conexion con la base de datos
const { conection } = require("../config/db");

//crea la funcion con los paramtros request y response
const todoNoticias = (req, res) => {
  const query = "SELECT * FROM noticias WHERE estado = 'Publicado' ORDER BY fecha_publicacion DESC;";

  conection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener noticias publicadas:", err);
      return res.status(500).json({ 
        error: "Error interno del servidor al obtener noticias" 
      });
    }
    res.json(results);
  });
};

const todasNoticias = (req, res) => {
  const query = "SELECT * FROM noticias ORDER BY fecha_creacion DESC;";

  conection.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener todas las noticias:", err);
      return res.status(500).json({ 
        error: "Error interno del servidor al obtener noticias" 
      });
    }
    res.json(results);
  });
};

// Función de validación para noticias
const validarNoticia = (titulo, contenido, imagen_url, estado) => {
  const errores = [];

  // Validación de título (requerido, mínimo 5 caracteres, máximo 200)
  if (!titulo || titulo.trim() === '') {
    errores.push('El título es obligatorio');
  } else {
    const tituloTrimmed = titulo.trim();
    if (tituloTrimmed.length < 5) {
      errores.push('El título debe tener al menos 5 caracteres');
    }
    if (tituloTrimmed.length > 200) {
      errores.push('El título no puede exceder los 200 caracteres');
    }
  }

  // Validación de contenido (requerido, mínimo 10 caracteres)
  if (!contenido || contenido.trim() === '') {
    errores.push('El contenido es obligatorio');
  } else {
    const contenidoTrimmed = contenido.trim();
    if (contenidoTrimmed.length < 10) {
      errores.push('El contenido debe tener al menos 10 caracteres');
    }
  }

  // Validación de imagen_url (opcional, pero si se proporciona debe ser válida y no exceder 500 caracteres)
  if (imagen_url && imagen_url.trim() !== '') {
    const urlTrimmed = imagen_url.trim();
    if (urlTrimmed.length > 500) {
      errores.push('La URL de la imagen no puede exceder los 500 caracteres');
    }
    
    // Validación básica de formato URL
    try {
      new URL(urlTrimmed);
    } catch (e) {
      errores.push('La URL de la imagen no tiene un formato válido');
    }
  }

  // Validación de estado (debe ser uno de los valores del ENUM)
  const estadosValidos = ['Borrador', 'Publicado', 'Archivado'];
  if (!estado || !estadosValidos.includes(estado)) {
    errores.push('El estado debe ser: Borrador, Publicado o Archivado');
  }

  return errores;
};

const agregarNoticias = (req, res) => {
  // Obtenemos los valores del request body
  const { titulo, contenido, imagen_url, estado, fecha_publicacion } = req.body;
  
  // Validaciones
  const erroresValidacion = validarNoticia(titulo, contenido, imagen_url, estado || 'Borrador');
  
  if (erroresValidacion.length > 0) {
    return res.status(400).json({ 
      error: "Errores de validación", 
      detalles: erroresValidacion 
    });
  }

  // Validación de fecha_publicacion
  let fechaPublicacion = null;
  if (fecha_publicacion && fecha_publicacion.trim() !== '') {
    const fecha = new Date(fecha_publicacion);
    if (isNaN(fecha.getTime())) {
      return res.status(400).json({ 
        error: "La fecha de publicación no tiene un formato válido" 
      });
    }
    fechaPublicacion = fecha_publicacion;
  }

  // Si el estado es 'Publicado' y no hay fecha_publicacion, usar fecha actual
  if (estado === 'Publicado' && !fechaPublicacion) {
    fechaPublicacion = new Date().toISOString().split('T')[0];
  }

  // Preparar datos para inserción
  const imagenUrl = imagen_url && imagen_url.trim() !== '' ? imagen_url.trim() : null;
  const estadoFinal = estado || 'Borrador';
  
  // Creamos la consulta SQL para insertar una nueva noticia
  const query = `INSERT INTO noticias (titulo, contenido, imagen_url, estado, fecha_publicacion) 
                 VALUES (?, ?, ?, ?, ?)`;
  
  // Ejecutamos la consulta con los valores parametrizados
  conection.query(query, [titulo.trim(), contenido.trim(), imagenUrl, estadoFinal, fechaPublicacion], (err, results) => {
    if (err) {
      console.error("Error al agregar noticia:", err);
      
      // Manejo específico de errores de base de datos
      if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
        return res.status(400).json({ 
          error: "Error de validación: verifique que el título tenga al menos 5 caracteres y el contenido al menos 10 caracteres" 
        });
      }
      
      return res.status(500).json({ 
        error: "Error interno del servidor al agregar la noticia" 
      });
    }
    
    res.status(201).json({ 
      message: "Noticia agregada exitosamente", 
      id: results.insertId 
    });
  });
};

const borrarNoticias = (req, res) => {
  const id = req.params.id;
  
  // Validación del ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ 
      error: "ID de noticia inválido" 
    });
  }

  // Verificar que la noticia existe antes de eliminar (archivar)
  const checkQuery = `SELECT id, estado FROM noticias WHERE id = ?`;
  
  conection.query(checkQuery, [id], (err, results) => {
    if (err) {
      console.error("Error al verificar noticia:", err);
      return res.status(500).json({ 
        error: "Error interno del servidor" 
      });
    }

    if (results.length === 0) {
      return res.status(404).json({ 
        error: "Noticia no encontrada" 
      });
    }

    // Cambiar estado a 'Archivado' en lugar de eliminar físicamente
    const query = `UPDATE noticias SET estado = 'Archivado' WHERE id = ?`;
    
    conection.query(query, [id], (err, updateResults) => {
      if (err) {
        console.error("Error al archivar noticia:", err);
        return res.status(500).json({ 
          error: "Error interno del servidor al archivar la noticia" 
        });
      }

      if (updateResults.affectedRows === 0) {
        return res.status(404).json({ 
          error: "No se pudo archivar la noticia" 
        });
      }

      res.json({ 
        message: "Noticia archivada exitosamente" 
      });
    });
  });
};

const editarNoticias = (req, res) => {
  const id = req.params.id;
  const { titulo, contenido, imagen_url, estado, fecha_publicacion } = req.body;

  // Validación del ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ 
      error: "ID de noticia inválido" 
    });
  }

  // Validaciones de campos
  const erroresValidacion = validarNoticia(titulo, contenido, imagen_url, estado);
  
  if (erroresValidacion.length > 0) {
    return res.status(400).json({ 
      error: "Errores de validación", 
      detalles: erroresValidacion 
    });
  }

  // Validación de fecha_publicacion
  let fechaPublicacion = null;
  if (fecha_publicacion && fecha_publicacion.trim() !== '') {
    const fecha = new Date(fecha_publicacion);
    if (isNaN(fecha.getTime())) {
      return res.status(400).json({ 
        error: "La fecha de publicación no tiene un formato válido" 
      });
    }
    fechaPublicacion = fecha_publicacion;
  }

  // Si el estado es 'Publicado' y no hay fecha_publicacion, usar fecha actual
  if (estado === 'Publicado' && !fechaPublicacion) {
    fechaPublicacion = new Date().toISOString().split('T')[0];
  }

  // Preparar datos para actualización
  const imagenUrl = imagen_url && imagen_url.trim() !== '' ? imagen_url.trim() : null;

  // Verificar que la noticia existe antes de actualizar
  const checkQuery = `SELECT id FROM noticias WHERE id = ?`;
  
  conection.query(checkQuery, [id], (err, results) => {
    if (err) {
      console.error("Error al verificar noticia:", err);
      return res.status(500).json({ 
        error: "Error interno del servidor" 
      });
    }

    if (results.length === 0) {
      return res.status(404).json({ 
        error: "Noticia no encontrada" 
      });
    }

    const query = `UPDATE noticias 
                   SET titulo = ?, 
                       contenido = ?, 
                       imagen_url = ?,
                       estado = ?,
                       fecha_publicacion = ?
                   WHERE id = ?`;
    
    conection.query(query, [titulo.trim(), contenido.trim(), imagenUrl, estado, fechaPublicacion, id], (err, updateResults) => {
      if (err) {
        console.error("Error al editar noticia:", err);
        
        // Manejo específico de errores de base de datos
        if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
          return res.status(400).json({ 
            error: "Error de validación: verifique que el título tenga al menos 5 caracteres y el contenido al menos 10 caracteres" 
          });
        }
        
        return res.status(500).json({ 
          error: "Error interno del servidor al actualizar la noticia" 
        });
      }

      if (updateResults.affectedRows === 0) {
        return res.status(404).json({ 
          error: "No se pudo actualizar la noticia" 
        });
      }

      res.json({ 
        message: "Noticia actualizada exitosamente" 
      });
    });
  });
};

const verNoticias = (req, res) => {
  const id = req.params.id;
  
  // Validación del ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ 
      error: "ID de noticia inválido" 
    });
  }

  const query = `SELECT * FROM noticias WHERE id = ?`;
  
  conection.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error al obtener noticia:", err);
      return res.status(500).json({ 
        error: "Error interno del servidor al obtener la noticia" 
      });
    }

    if (results.length === 0) {
      return res.status(404).json({ 
        error: "Noticia no encontrada" 
      });
    }

    res.json(results[0]);
  });
};

const noticiasPorEstado = (req, res) => {
  const estado = req.params.estado;
  
  // Validación del estado
  const estadosValidos = ['Borrador', 'Publicado', 'Archivado'];
  if (!estado || !estadosValidos.includes(estado)) {
    return res.status(400).json({ 
      error: "Estado inválido. Debe ser: Borrador, Publicado o Archivado" 
    });
  }

  const query = `SELECT * FROM noticias WHERE estado = ? ORDER BY fecha_creacion DESC`;
  
  conection.query(query, [estado], (err, results) => {
    if (err) {
      console.error("Error al obtener noticias por estado:", err);
      return res.status(500).json({ 
        error: "Error interno del servidor al obtener noticias" 
      });
    }
    res.json(results);
  });
};

const publicarNoticia = (req, res) => {
  const id = req.params.id;
  const { fecha_publicacion } = req.body;

  // Validación del ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ 
      error: "ID de noticia inválido" 
    });
  }

  // Validación y preparación de fecha_publicacion
  let fechaPublicacion = fecha_publicacion;
  if (!fechaPublicacion || fechaPublicacion.trim() === '') {
    fechaPublicacion = new Date().toISOString().split('T')[0];
  } else {
    const fecha = new Date(fechaPublicacion);
    if (isNaN(fecha.getTime())) {
      return res.status(400).json({ 
        error: "La fecha de publicación no tiene un formato válido" 
      });
    }
  }

  // Verificar que la noticia existe y no está archivada
  const checkQuery = `SELECT id, estado, titulo, contenido FROM noticias WHERE id = ?`;
  
  conection.query(checkQuery, [id], (err, results) => {
    if (err) {
      console.error("Error al verificar noticia:", err);
      return res.status(500).json({ 
        error: "Error interno del servidor" 
      });
    }

    if (results.length === 0) {
      return res.status(404).json({ 
        error: "Noticia no encontrada" 
      });
    }

    const noticia = results[0];

    if (noticia.estado === 'Archivado') {
      return res.status(400).json({ 
        error: "No se puede publicar una noticia archivada" 
      });
    }

    // Validar que la noticia cumple con los requisitos mínimos para publicación
    if (!noticia.titulo || noticia.titulo.length < 5) {
      return res.status(400).json({ 
        error: "La noticia debe tener un título de al menos 5 caracteres para ser publicada" 
      });
    }

    if (!noticia.contenido || noticia.contenido.length < 10) {
      return res.status(400).json({ 
        error: "La noticia debe tener contenido de al menos 10 caracteres para ser publicada" 
      });
    }

    const query = `UPDATE noticias 
                   SET estado = 'Publicado', 
                       fecha_publicacion = ?
                   WHERE id = ?`;
    
    conection.query(query, [fechaPublicacion, id], (err, updateResults) => {
      if (err) {
        console.error("Error al publicar noticia:", err);
        return res.status(500).json({ 
          error: "Error interno del servidor al publicar la noticia" 
        });
      }

      if (updateResults.affectedRows === 0) {
        return res.status(404).json({ 
          error: "No se pudo publicar la noticia" 
        });
      }

      res.json({ 
        message: "Noticia publicada exitosamente",
        fecha_publicacion: fechaPublicacion
      });
    });
  });
};

module.exports = {
  todoNoticias,
  todasNoticias,
  agregarNoticias,
  borrarNoticias,
  editarNoticias,
  verNoticias,
  noticiasPorEstado,
  publicarNoticia,
};
