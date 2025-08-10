//importa express
const express = require("express");

//importa las funciones del archivo /controllers/actividades
const {
  todoActividades,
  agregarActividades,
  borrarActividades,
  editarActividades,
  verActividades,
} = require("../controllers/actividades");

//crea la constante router que almacena la instancia del enrutador de express
const router = express.Router();

//Cada línea asigna una ruta y un método HTTP a una función controladora que maneja la solicitud
router.get("/actividades", todoActividades);
router.post("/actividades/agregar", agregarActividades);
router.get("/actividades/:id", verActividades);
router.delete("/actividades/eliminar/:id", borrarActividades);
router.put("/actividades/editar/:id", editarActividades);

//exporta router
module.exports = router;
