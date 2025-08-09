//importa express
const express = require("express");

//importa las funciones del archivo /controllers/suscriptores
const {
  todoSuscriptores,
  agregarSuscriptores,
  borrarSuscriptores,
  editarSuscriptores,
  verSuscriptores,
  suscriptoresPorEstado,
} = require("../controllers/suscriptores");

//crea la constante router que almacena la instancia del enrutador de express
const router = express.Router();

//Cada línea asigna una ruta y un método HTTP a una función controladora que maneja la solicitud
router.get("/suscriptores", todoSuscriptores);
router.post("/suscriptores/agregar", agregarSuscriptores);
router.get("/suscriptores/:id", verSuscriptores);
router.delete("/suscriptores/eliminar/:id", borrarSuscriptores);
router.put("/suscriptores/editar/:id", editarSuscriptores);
router.get("/suscriptores/estado/:estado", suscriptoresPorEstado);

//exporta router
module.exports = router;
