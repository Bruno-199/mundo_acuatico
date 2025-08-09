//importa express
const express = require("express");

//importa las funciones del archivo /controllers/profesores
const {
  todoProfesores,
  agregarProfesores,
  borrarProfesores,
  editarProfesores,
  verProfesores,
} = require("../controllers/profesores");

//crea la constante router que almacena la instancia del enrutador de express
const router = express.Router();

//Cada línea asigna una ruta y un método HTTP a una función controladora que maneja la solicitud
router.get("/profesores", todoProfesores);
router.post("/profesores/agregar", agregarProfesores);
router.get("/profesores/:id", verProfesores);
router.delete("/profesores/eliminar/:id", borrarProfesores);
router.put("/profesores/editar/:id", editarProfesores);

//exporta router
module.exports = router;
