//importa la conexion con la base de datos
const { conection } = require("../config/db");

//crea la funcion con los paramtros request y response
const todoProfesores = (req, res) => {
  console.log('Controller profesores - Recibida petición GET /profesores');
  const query = "SELECT * FROM profesores ORDER BY fecha_creacion DESC;";

  conection.query(query, (err, results) => {
    if (err) {
      console.error('Controller profesores - Error en consulta:', err);
      throw err;
    }
    console.log('Controller profesores - Resultados obtenidos:', results.length, 'profesores');
    res.json(results);
  });
};

const agregarProfesores = (req, res) => {
  // Obtenemos los valores del request body
  const { nombre, especialidad, telefono, email, horario } = req.body;
  
  // Creamos la consulta SQL para insertar un nuevo profesor
  const query = `INSERT INTO profesores (nombre, especialidad, telefono, email, horario) 
                 VALUES (?, ?, ?, ?, ?)`;
  
  // Ejecutamos la consulta con los valores parametrizados
  conection.query(query, [nombre, especialidad, telefono, email, horario], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
};

const borrarProfesores = (req, res) => {
  const id = req.params.id;
  const query = `UPDATE profesores SET estado = 'Inactivo' WHERE id = ?`;
  
  conection.query(query, [id], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
};

const editarProfesores = (req, res) => {
  const id = req.params.id;
  const { nombre, especialidad, telefono, email, horario, estado } = req.body;

  const query = `UPDATE profesores 
                 SET nombre = ?, 
                     especialidad = ?, 
                     telefono = ?,
                     email = ?,
                     horario = ?,
                     estado = ?
                 WHERE id = ?`;
  
  conection.query(query, [nombre, especialidad, telefono, email, horario, estado, id], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
};

const verProfesores = (req, res) => {
  const id = req.params.id;
  const query = `SELECT p.*, 
                        COUNT(h.id) as cantidad_horarios,
                        GROUP_CONCAT(DISTINCT a.nombre) as actividades
                 FROM profesores p
                 LEFT JOIN horarios h ON h.profesor_id = p.id AND h.activo = TRUE
                 LEFT JOIN actividades a ON a.id = h.actividad_id AND a.activa = TRUE
                 WHERE p.id = ?
                 GROUP BY p.id`;
  
  conection.query(query, [id], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
};

module.exports = {
  todoProfesores,
  agregarProfesores,
  borrarProfesores,
  editarProfesores,
  verProfesores,
};
