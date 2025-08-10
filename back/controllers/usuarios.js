//importa la conexion con la base de datos
const { conection } = require("../config/db");
const bcrypt = require('bcrypt');

//crea la funcion con los paramtros request y response
const todoUsuarios = (req, res) => {
  const query = "SELECT id, usuario, nombre, rol, ultimo_acceso, estado, fecha_creacion FROM usuarios ORDER BY fecha_creacion DESC;";

  conection.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener usuarios:', err);
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }
    res.json(results);
  });
};

const agregarUsuarios = async (req, res) => {
  // Obtenemos los valores del request body - cambio password_hash por password
  const { usuario, nombre, password, rol } = req.body;
  
  // Validar que el rol sea uno de los valores permitidos según la base de datos
  const rolesPermitidos = ['Admin', 'Editor'];
  if (!rolesPermitidos.includes(rol)) {
    return res.status(400).json({ 
      error: `Rol inválido. Debe ser uno de: ${rolesPermitidos.join(', ')}` 
    });
  }
  
  // Validar campos requeridos
  if (!usuario || !nombre || !password || !rol) {
    return res.status(400).json({ 
      error: 'Todos los campos son requeridos' 
    });
  }
  
  // Validar longitud mínima del usuario (según CHECK en la tabla)
  if (usuario.length < 3) {
    return res.status(400).json({ 
      error: 'El usuario debe tener al menos 3 caracteres' 
    });
  }
  
  // Validar longitud mínima de la contraseña
  if (password.length < 6) {
    return res.status(400).json({ 
      error: 'La contraseña debe tener al menos 6 caracteres' 
    });
  }
  
  try {
    // Hashear la contraseña - bcrypt genera hashes de 60 caracteres que cumple CHECK >= 60
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    // Creamos la consulta SQL para insertar un nuevo usuario
    const query = `INSERT INTO usuarios (usuario, nombre, password_hash, rol) 
                   VALUES (?, ?, ?, ?)`;
    
    // Ejecutamos la consulta con los valores parametrizados
    conection.query(query, [usuario, nombre, password_hash, rol], (err, results) => {
      if (err) {
        console.error('Error al agregar usuario:', err);
        
        // Manejo específico de errores comunes
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ 
            error: 'El usuario ya existe' 
          });
        }
        
        return res.status(500).json({ 
          error: 'Error al crear usuario: ' + err.message 
        });
      }
      
      res.status(201).json({ 
        message: 'Usuario agregado correctamente', 
        id: results.insertId 
      });
    });
  } catch (error) {
    console.error('Error en agregarUsuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const borrarUsuarios = (req, res) => {
  const id = req.params.id;
  
  try {
    const query = `UPDATE usuarios SET estado = 'Inactivo' WHERE id = ?`;
    
    conection.query(query, [id], (err, results) => {
      if (err) {
        console.error('Error al borrar usuario:', err);
        return res.status(500).json({ error: 'Error al desactivar usuario' });
      }
      
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      res.json({ message: 'Usuario desactivado correctamente' });
    });
  } catch (error) {
    console.error('Error en borrarUsuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const editarUsuarios = async (req, res) => {
  const id = req.params.id;
  const { usuario, nombre, password, rol, estado } = req.body; // Cambio password_hash por password

  // Validar que el rol sea uno de los valores permitidos
  const rolesPermitidos = ['Admin', 'Editor'];
  if (rol && !rolesPermitidos.includes(rol)) {
    return res.status(400).json({ 
      error: `Rol inválido. Debe ser uno de: ${rolesPermitidos.join(', ')}` 
    });
  }
  
  // Validar que el estado sea válido
  const estadosPermitidos = ['Activo', 'Inactivo'];
  if (estado && !estadosPermitidos.includes(estado)) {
    return res.status(400).json({ 
      error: `Estado inválido. Debe ser uno de: ${estadosPermitidos.join(', ')}` 
    });
  }
  
  try {
    let query, params;
    
    // Si se está actualizando la contraseña, la hasheamos
    if (password && password.trim() !== '') {
      // Validar longitud mínima de la contraseña
      if (password.length < 6) {
        return res.status(400).json({ 
          error: 'La contraseña debe tener al menos 6 caracteres' 
        });
      }
      
      // Hashear la nueva contraseña
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);
      
      query = `UPDATE usuarios 
               SET usuario = ?, 
                   nombre = ?, 
                   password_hash = ?,
                   rol = ?,
                   estado = ?,
                   fecha_actualizacion = CURRENT_TIMESTAMP
               WHERE id = ?`;
      params = [usuario, nombre, password_hash, rol, estado, id];
    } else {
      // Si no se actualiza la contraseña, no incluir el campo password_hash
      query = `UPDATE usuarios 
               SET usuario = ?, 
                   nombre = ?, 
                   rol = ?,
                   estado = ?,
                   fecha_actualizacion = CURRENT_TIMESTAMP
               WHERE id = ?`;
      params = [usuario, nombre, rol, estado, id];
    }
    
    conection.query(query, params, (err, results) => {
      if (err) {
        console.error('Error al editar usuario:', err);
        
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ 
            error: 'El usuario ya existe' 
          });
        }
        
        return res.status(500).json({ 
          error: 'Error al actualizar usuario: ' + err.message 
        });
      }
      
      if (results.affectedRows === 0) {
        return res.status(404).json({ 
          error: 'Usuario no encontrado' 
        });
      }
      
      res.json({ 
        message: 'Usuario actualizado correctamente' 
      });
    });
  } catch (error) {
    console.error('Error en editarUsuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const verUsuarios = (req, res) => {
  const id = req.params.id;
  
  try {
    const query = `SELECT id, usuario, nombre, rol, ultimo_acceso, estado, fecha_creacion, fecha_actualizacion
                   FROM usuarios 
                   WHERE id = ?`;
    
    conection.query(query, [id], (err, results) => {
      if (err) {
        console.error('Error al obtener usuario:', err);
        return res.status(500).json({ error: 'Error al obtener usuario' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      res.json(results[0]);
    });
  } catch (error) {
    console.error('Error en verUsuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const loginUsuarios = async (req, res) => {
  const { usuario, password } = req.body;
  
  try {
    const query = `SELECT id, usuario, nombre, rol, password_hash 
                   FROM usuarios 
                   WHERE usuario = ? AND estado = 'Activo'`;
    
    conection.query(query, [usuario], async (err, results) => {
      if (err) {
        console.error('Error al hacer login:', err);
        return res.status(500).json({ error: 'Error en el servidor' });
      }
      
      if (results.length === 0) {
        return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
      }
      
      const user = results[0];
      
      // Verificar la contraseña usando bcrypt
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
      }
      
      // No enviar el hash de la contraseña en la respuesta
      const { password_hash, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    });
  } catch (error) {
    console.error('Error en loginUsuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  todoUsuarios,
  agregarUsuarios,
  borrarUsuarios,
  editarUsuarios,
  verUsuarios,
  loginUsuarios,
};
