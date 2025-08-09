# Sistema de Gestión Mundo Acuático

Este proyecto consiste en una aplicación web fullstack para la gestión de un centro acuático, con frontend en React y backend en Node.js/Express.

## Estructura del Proyecto

```
intento 1/
├── back/              # Backend (Node.js + Express + MySQL)
│   ├── index.js       # Servidor principal
│   ├── config/        # Configuración de base de datos
│   ├── controllers/   # Controladores de la API
│   └── routes/        # Rutas de la API
└── front/             # Frontend (React + Vite)
    ├── src/
    │   ├── components/     # Componentes React
    │   ├── pages/         # Páginas principales
    │   ├── css/           # Estilos CSS
    │   └── config/        # Configuración de API
    └── package.json
```

## Requisitos Previos

- Node.js (versión 16 o superior)
- MySQL (versión 8.0 o superior)
- NPM o Yarn

## Configuración de la Base de Datos

1. Crear una base de datos MySQL llamada `mundo_acuatico`
2. Configurar las credenciales en `back/config/db.js`:
   - Host: localhost
   - Usuario: root
   - Contraseña: 1234
   - Base de datos: mundo_acuatico

3. Crear las tablas necesarias (usuarios, noticias, profesores, suscriptores, etc.)

## Instalación y Ejecución

### Backend

1. Navegar al directorio del backend:
```bash
cd back
```

2. Instalar dependencias:
```bash
npm install
```

3. Ejecutar el servidor en modo desarrollo:
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:8000`

### Frontend

1. Navegar al directorio del frontend:
```bash
cd front
```

2. Instalar dependencias:
```bash
npm install
```

3. Ejecutar la aplicación en modo desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Funcionalidades

### Sistema de Autenticación
- Login con usuario y contraseña
- Validación contra la base de datos
- Gestión de sesiones con localStorage

### Panel de Administración
- **Gestión de Noticias**: Crear, editar, eliminar y publicar noticias
- **Gestión de Usuarios**: Administrar usuarios del sistema
- **Gestión de Profesores**: Administrar información de profesores
- **Gestión de Suscriptores**: Administrar información de suscriptores
- **Gestión de Actividades**: Administrar actividades del centro acuático
- **Gestión de Horarios**: Administrar horarios de las actividades
- **Gestión de Suscripciones**: Administrar suscripciones y pagos

### API Endpoints

#### Usuarios
- `GET /usuarios` - Obtener todos los usuarios activos
- `POST /usuarios/agregar` - Crear nuevo usuario
- `PUT /usuarios/editar/:id` - Editar usuario
- `DELETE /usuarios/eliminar/:id` - Eliminar usuario (soft delete)
- `POST /usuarios/login` - Autenticar usuario

#### Noticias
- `GET /noticias` - Obtener noticias publicadas
- `GET /noticias/todas` - Obtener todas las noticias (admin)
- `POST /noticias/agregar` - Crear nueva noticia
- `PUT /noticias/editar/:id` - Editar noticia
- `DELETE /noticias/eliminar/:id` - Eliminar noticia
- `PUT /noticias/publicar/:id` - Publicar noticia

#### Profesores
- `GET /profesores` - Obtener todos los profesores activos
- `POST /profesores/agregar` - Crear nuevo profesor
- `PUT /profesores/editar/:id` - Editar profesor
- `DELETE /profesores/eliminar/:id` - Eliminar profesor

#### Suscriptores
- `GET /suscriptores` - Obtener todos los suscriptores
- `POST /suscriptores/agregar` - Crear nuevo suscriptor
- `PUT /suscriptores/editar/:id` - Editar suscriptor
- `DELETE /suscriptores/eliminar/:id` - Eliminar suscriptor

#### Actividades
- `GET /actividades` - Obtener todas las actividades activas
- `POST /actividades/agregar` - Crear nueva actividad
- `PUT /actividades/editar/:id` - Editar actividad
- `DELETE /actividades/eliminar/:id` - Eliminar actividad
- `GET /actividades/:id` - Obtener actividad específica

#### Horarios
- `GET /horarios` - Obtener todos los horarios activos
- `POST /horarios/agregar` - Crear nuevo horario
- `PUT /horarios/editar/:id` - Editar horario
- `DELETE /horarios/eliminar/:id` - Eliminar horario
- `GET /horarios/actividad/:actividad_id` - Obtener horarios por actividad

#### Suscripciones
- `GET /suscripciones` - Obtener todas las suscripciones
- `POST /suscripciones/agregar` - Crear nueva suscripción
- `PUT /suscripciones/editar/:id` - Editar suscripción
- `DELETE /suscripciones/eliminar/:id` - Cancelar suscripción
- `PUT /suscripciones/pago/:id` - Registrar pago
- `GET /suscripciones/suscriptor/:suscriptor_id` - Suscripciones por suscriptor

## Tecnologías Utilizadas

### Backend
- **Node.js**: Entorno de ejecución de JavaScript
- **Express.js**: Framework web para Node.js
- **MySQL2**: Driver para conexión con MySQL
- **CORS**: Middleware para permitir peticiones cross-origin

### Frontend
- **React**: Biblioteca para construir interfaces de usuario
- **React Router**: Enrutamiento para aplicaciones React
- **Vite**: Herramienta de build y desarrollo
- **CSS3**: Estilos responsive

## Estructura de Componentes

### Componentes Principales
- `App.jsx`: Componente principal con enrutamiento
- `Navbar.jsx`: Barra de navegación con autenticación
- `Login.jsx`: Formulario de inicio de sesión
- `Admin.jsx`: Panel de administración
- `Noticias.jsx`: Visualización de noticias públicas

### Componentes de Administración
- `TablaNoticias.jsx`: CRUD de noticias
- `TablaUsuarios.jsx`: CRUD de usuarios
- `TablaProfesores.jsx`: CRUD de profesores
- `TablaSuscriptores.jsx`: CRUD de suscriptores
- `TablaActividades.jsx`: CRUD de actividades
- `TablaHorarios.jsx`: CRUD de horarios
- `TablaSuscripciones.jsx`: CRUD de suscripciones y gestión de pagos

## Características de Seguridad

- Autenticación basada en sesiones
- Validación de datos en el frontend
- Queries parametrizadas para prevenir SQL injection
- Soft delete para mantener integridad de datos

## Desarrollo

### Scripts Disponibles

**Backend:**
- `npm start`: Ejecutar en producción
- `npm run dev`: Ejecutar en desarrollo con nodemon

**Frontend:**
- `npm run dev`: Servidor de desarrollo
- `npm run build`: Build para producción
- `npm run preview`: Vista previa del build

## Configuración de Desarrollo

El archivo `front/src/config/api.js` contiene la configuración de la URL base de la API. Para desarrollo local, está configurado como `http://localhost:8000`.

## Notas

- Asegúrate de que el servidor backend esté ejecutándose antes de iniciar el frontend
- Las credenciales de la base de datos deben configurarse según tu entorno local
- Para producción, cambiar las URLs y credenciales correspondientes
# mundo_acuatico
