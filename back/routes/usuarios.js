//importa express
const express = require("express");

//importa las funciones del archivo /controllers/usuarios
const {
  todoUsuarios,
  agregarUsuarios,
  borrarUsuarios,
  editarUsuarios,
  verUsuarios,
  loginUsuarios,
} = require("../controllers/usuarios");

//crea la constante router que almacena la instancia del enrutador de express
const router = express.Router();

//Cada línea asigna una ruta y un método HTTP a una función controladora que maneja la solicitud
router.get("/usuarios", todoUsuarios);
router.post("/usuarios/agregar", agregarUsuarios);
router.get("/usuarios/:id", verUsuarios);
router.delete("/usuarios/eliminar/:id", borrarUsuarios);
router.put("/usuarios/editar/:id", editarUsuarios);
router.post("/usuarios/login", loginUsuarios);

//exporta router
module.exports = router;
