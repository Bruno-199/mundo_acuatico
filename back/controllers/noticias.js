//importa la conexion con la base de datos
const { conection } = require("../config/db");

//crea la funcion con los paramtros request y response
const todoNoticias = (req, res) => {
  const query = "SELECT * FROM noticias WHERE estado = 'Publicado' ORDER BY fecha_publicacion DESC;";

  conection.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
};

const todasNoticias = (req, res) => {
  const query = "SELECT * FROM noticias ORDER BY fecha_creacion DESC;";

  conection.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
};

const agregarNoticias = (req, res) => {
  // Obtenemos los valores del request body
  const { titulo, contenido, imagen_url, estado, fecha_publicacion } = req.body;
  
  // Validamos la fecha de publicación - si está vacía o es null, usamos null
  const fechaPublicacion = fecha_publicacion && fecha_publicacion.trim() !== '' ? fecha_publicacion : null;
  
  // Creamos la consulta SQL para insertar una nueva noticia
  const query = `INSERT INTO noticias (titulo, contenido, imagen_url, estado, fecha_publicacion) 
                 VALUES (?, ?, ?, ?, ?)`;
  
  // Ejecutamos la consulta con los valores parametrizados
  conection.query(query, [titulo, contenido, imagen_url, estado, fechaPublicacion], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
};

const borrarNoticias = (req, res) => {
  const id = req.params.id;
  const query = `UPDATE noticias SET estado = 'Archivado' WHERE id = ?`;
  
  conection.query(query, [id], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
};

const editarNoticias = (req, res) => {
  const id = req.params.id;
  const { titulo, contenido, imagen_url, estado, fecha_publicacion } = req.body;

  // Validamos la fecha de publicación - si está vacía o es null, usamos null
  const fechaPublicacion = fecha_publicacion && fecha_publicacion.trim() !== '' ? fecha_publicacion : null;

  const query = `UPDATE noticias 
                 SET titulo = ?, 
                     contenido = ?, 
                     imagen_url = ?,
                     estado = ?,
                     fecha_publicacion = ?
                 WHERE id = ?`;
  
  conection.query(query, [titulo, contenido, imagen_url, estado, fechaPublicacion, id], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
};

const verNoticias = (req, res) => {
  const id = req.params.id;
  const query = `SELECT * FROM noticias WHERE id = ?`;
  
  conection.query(query, [id], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
};

const noticiasPorEstado = (req, res) => {
  const estado = req.params.estado;
  const query = `SELECT * FROM noticias WHERE estado = ? ORDER BY fecha_creacion DESC`;
  
  conection.query(query, [estado], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
};

const publicarNoticia = (req, res) => {
  const id = req.params.id;
  const { fecha_publicacion } = req.body;

  const query = `UPDATE noticias 
                 SET estado = 'Publicado', 
                     fecha_publicacion = ?
                 WHERE id = ?`;
  
  conection.query(query, [fecha_publicacion || new Date().toISOString().split('T')[0], id], (err, results) => {
    if (err) throw err;
    res.send(results);
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
