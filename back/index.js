//importa express, la conexion a la base de datos y los modulos de las rutas
const express = require("express");
const { conection } = require("./config/db");
const usuarios = require("./routes/usuarios");
const profesores = require("./routes/profesores");
const actividades = require("./routes/actividades");
const horarios = require("./routes/horarios");
const suscriptores = require("./routes/suscriptores");
const suscripciones = require("./routes/suscripciones");
const noticias = require("./routes/noticias");

//importa cors
const cors = require("cors");

//crea una variable app en la que almacena la instancia express
const app = express();

//crea una variable port que el servidor escuchara
const port = 8000;

//permite manejar solicutudes json
app.use(express.json());
//permite habilitar cors
app.use(cors());

//asocia cada modulo de rutas a la ruta raiz ('/')
//Esto significa que todas las rutas definidas en esos módulos estarán disponibles desde la raíz del servidor.
app.use("/", usuarios);
app.use("/", profesores);
app.use("/", actividades);
app.use("/", horarios);
app.use("/", suscriptores);
app.use("/", suscripciones);
app.use("/", noticias);

//inicia la conexion a la base de datos y muestra un mensaje cuando la conexion es exitosa
conection.connect(() => {
  console.log("conectado a la base de datos mundo_acuatico");
});

//Define una ruta GET en la raíz del servidor que imprime "bienvenido al mundo acuático" en la consola y responde con un mensaje JSON de bienvenida.
app.get("/", (req, res) => {
  console.log("bienvenido al mundo acuático");
  res.send({ message: "bienvenido a la API del Mundo Acuático" });
});

//Inicia el servidor y lo hace escuchar en el puerto definido (8000).
//Muestra un mensaje en la consola cuando el servidor está corriendo.
app.listen(port, () => {
  console.log("escuchando " + port);
});
