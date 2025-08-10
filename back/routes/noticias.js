//importa express
const express = require("express");

//importa las funciones del archivo /controllers/noticias
const {
  todoNoticias,
  todasNoticias,
  agregarNoticias,
  borrarNoticias,
  editarNoticias,
  verNoticias,
  noticiasPorEstado,
  publicarNoticia,
} = require("../controllers/noticias");

//crea la constante router que almacena la instancia del enrutador de express
const router = express.Router();

//Cada línea asigna una ruta y un método HTTP a una función controladora que maneja la solicitud
router.get("/noticias", todoNoticias); // Solo noticias publicadas
router.get("/noticias/todas", todasNoticias); // Todas las noticias para admin
router.post("/noticias/agregar", agregarNoticias);
router.get("/noticias/:id", verNoticias);
router.delete("/noticias/eliminar/:id", borrarNoticias);
router.put("/noticias/editar/:id", editarNoticias);
router.get("/noticias/estado/:estado", noticiasPorEstado);
router.put("/noticias/publicar/:id", publicarNoticia);

//exporta router
module.exports = router;
