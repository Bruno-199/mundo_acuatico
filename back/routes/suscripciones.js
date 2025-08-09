//importa express
const express = require("express");

//importa las funciones del archivo /controllers/suscripciones
const {
  todoSuscripciones,
  agregarSuscripciones,
  borrarSuscripciones,
  editarSuscripciones,
  verSuscripciones,
  suscripcionesPorSuscriptor,
  suscripcionesPorEstado,
  actualizarPago,
} = require("../controllers/suscripciones");

//crea la constante router que almacena la instancia del enrutador de express
const router = express.Router();

//Cada línea asigna una ruta y un método HTTP a una función controladora que maneja la solicitud
router.get("/suscripciones", todoSuscripciones);
router.post("/suscripciones/agregar", agregarSuscripciones);
router.get("/suscripciones/:id", verSuscripciones);
router.delete("/suscripciones/eliminar/:id", borrarSuscripciones);
router.put("/suscripciones/editar/:id", editarSuscripciones);
router.get("/suscripciones/suscriptor/:suscriptor_id", suscripcionesPorSuscriptor);
router.get("/suscripciones/estado/:estado", suscripcionesPorEstado);
router.put("/suscripciones/pago/:id", actualizarPago);

//exporta router
module.exports = router;
