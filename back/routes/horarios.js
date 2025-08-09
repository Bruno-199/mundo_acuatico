//importa express
const express = require("express");

//importa las funciones del archivo /controllers/horarios
const {
  todoHorarios,
  agregarHorarios,
  borrarHorarios,
  editarHorarios,
  verHorarios,
  horariosPorActividad,
} = require("../controllers/horarios");

//crea la constante router que almacena la instancia del enrutador de express
const router = express.Router();

//Cada línea asigna una ruta y un método HTTP a una función controladora que maneja la solicitud
router.get("/horarios", todoHorarios);
router.post("/horarios/agregar", agregarHorarios);
router.get("/horarios/:id", verHorarios);
router.delete("/horarios/eliminar/:id", borrarHorarios);
router.put("/horarios/editar/:id", editarHorarios);
router.get("/horarios/actividad/:actividad_id", horariosPorActividad);

//exporta router
module.exports = router;
