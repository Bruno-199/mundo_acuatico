# API Backend - Mundo Acuático

Backend API para el sistema de gestión del centro acuático "Mundo Acuático". Este sistema permite administrar usuarios, profesores, actividades, horarios, suscriptores, suscripciones y noticias.

## 🚀 Configuración e Instalación

### Prerequisitos
- Node.js (versión 14 o superior)
- MySQL (versión 5.7 o superior)
- npm o yarn

### Instalación

1. **Clonar o descargar el proyecto**
```bash
cd back
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar base de datos**
   - Asegúrate de tener MySQL funcionando
   - Ejecuta el script `database_init.sql` en MySQL para crear la base de datos y las tablas:
   ```sql
   mysql -u root -p < database_init.sql
   ```

4. **Configurar conexión a base de datos**
   - Edita el archivo `config/db.js` si necesitas cambiar los datos de conexión:
   ```javascript
   const conection = mysql.createConnection({
     host: "localhost",
     user: "root",
     password: "1234", // Cambia por tu contraseña
     database: "mundo_acuatico",
   });
   ```

5. **Ejecutar el servidor**
```bash
# Modo desarrollo (con recarga automática)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en: `http://localhost:8000`

## 📋 Estructura del Proyecto

```
back/
├── config/
│   └── db.js              # Configuración de base de datos
├── controllers/           # Lógica de negocio
│   ├── usuarios.js
│   ├── profesores.js
│   ├── actividades.js
│   ├── horarios.js
│   ├── suscriptores.js
│   ├── suscripciones.js
│   └── noticias.js
├── routes/               # Definición de rutas
│   ├── usuarios.js
│   ├── profesores.js
│   ├── actividades.js
│   ├── horarios.js
│   ├── suscriptores.js
│   ├── suscripciones.js
│   └── noticias.js
├── database_init.sql     # Script de inicialización de BD
├── index.js             # Archivo principal
└── package.json
```

## 🛠 API Endpoints

### Usuarios
- `GET /usuarios` - Obtener todos los usuarios activos
- `POST /usuarios/agregar` - Crear nuevo usuario
- `GET /usuarios/:id` - Obtener usuario por ID
- `PUT /usuarios/editar/:id` - Actualizar usuario
- `DELETE /usuarios/eliminar/:id` - Desactivar usuario
- `POST /usuarios/login` - Login de usuario

### Profesores
- `GET /profesores` - Obtener todos los profesores activos
- `POST /profesores/agregar` - Crear nuevo profesor
- `GET /profesores/:id` - Obtener profesor por ID con sus actividades
- `PUT /profesores/editar/:id` - Actualizar profesor
- `DELETE /profesores/eliminar/:id` - Desactivar profesor

### Actividades
- `GET /actividades` - Obtener todas las actividades activas
- `POST /actividades/agregar` - Crear nueva actividad
- `GET /actividades/:id` - Obtener actividad por ID con estadísticas
- `PUT /actividades/editar/:id` - Actualizar actividad
- `DELETE /actividades/eliminar/:id` - Desactivar actividad

### Horarios
- `GET /horarios` - Obtener todos los horarios con información completa
- `POST /horarios/agregar` - Crear nuevo horario
- `GET /horarios/:id` - Obtener horario por ID con detalles
- `PUT /horarios/editar/:id` - Actualizar horario
- `DELETE /horarios/eliminar/:id` - Desactivar horario
- `GET /horarios/actividad/:actividad_id` - Obtener horarios por actividad

### Suscriptores
- `GET /suscriptores` - Obtener todos los suscriptores activos/pendientes
- `POST /suscriptores/agregar` - Crear nuevo suscriptor
- `GET /suscriptores/:id` - Obtener suscriptor por ID con sus actividades
- `PUT /suscriptores/editar/:id` - Actualizar suscriptor
- `DELETE /suscriptores/eliminar/:id` - Desactivar suscriptor
- `GET /suscriptores/estado/:estado` - Obtener suscriptores por estado

### Suscripciones
- `GET /suscripciones` - Obtener todas las suscripciones activas/pendientes
- `POST /suscripciones/agregar` - Crear nueva suscripción
- `GET /suscripciones/:id` - Obtener suscripción por ID con detalles completos
- `PUT /suscripciones/editar/:id` - Actualizar suscripción
- `DELETE /suscripciones/eliminar/:id` - Cancelar suscripción
- `GET /suscripciones/suscriptor/:suscriptor_id` - Obtener suscripciones de un suscriptor
- `GET /suscripciones/estado/:estado` - Obtener suscripciones por estado
- `PUT /suscripciones/pago/:id` - Actualizar pago de suscripción

### Noticias
- `GET /noticias` - Obtener noticias publicadas (para público)
- `GET /noticias/todas` - Obtener todas las noticias (para admin)
- `POST /noticias/agregar` - Crear nueva noticia
- `GET /noticias/:id` - Obtener noticia por ID
- `PUT /noticias/editar/:id` - Actualizar noticia
- `DELETE /noticias/eliminar/:id` - Archivar noticia
- `GET /noticias/estado/:estado` - Obtener noticias por estado
- `PUT /noticias/publicar/:id` - Publicar noticia

## 💾 Base de Datos

### Tablas principales:
- **usuarios**: Gestión de usuarios del sistema (Admin/Editor)
- **profesores**: Información de profesores
- **actividades**: Actividades ofrecidas (Aquagym, Natación, etc.)
- **horarios**: Horarios de las actividades con profesores asignados
- **suscriptores**: Clientes del centro acuático
- **suscripciones**: Relación entre suscriptores y horarios
- **noticias**: Sistema de noticias para el sitio web

### Características de la BD:
- Integridad referencial con foreign keys
- Validaciones a nivel de base de datos
- Borrado lógico (cambio de estado en lugar de DELETE)
- Timestamps automáticos para auditoría
- Índices para optimización de consultas

## 🔧 Configuración de Desarrollo

### Variables de entorno recomendadas:
```javascript
// En un futuro, considera usar variables de entorno:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=1234
DB_NAME=mundo_acuatico
PORT=8000
```

### Dependencias principales:
- **express**: Framework web
- **mysql2**: Cliente MySQL
- **cors**: Middleware para CORS
- **nodemon**: Recarga automática en desarrollo

## 🚦 Estados y Validaciones

### Estados de entidades:
- **Usuarios**: Activo/Inactivo
- **Profesores**: Activo/Inactivo  
- **Actividades**: Activa/Inactiva
- **Horarios**: Activo/Inactivo
- **Suscriptores**: Activo/Pendiente/Inactivo
- **Suscripciones**: Activa/Pendiente/Vencida/Cancelada
- **Noticias**: Borrador/Publicado/Archivado

### Validaciones implementadas:
- Campos obligatorios
- Formatos de email y teléfono
- Longitudes mínimas y máximas
- Integridad referencial
- Validaciones de fechas y horarios

## 📝 Notas de Desarrollo

1. **Seguridad**: Las contraseñas se almacenan hasheadas con bcrypt
2. **CORS**: Habilitado para desarrollo, configurar apropiadamente para producción
3. **Logs**: Considera implementar un sistema de logging más robusto
4. **Testing**: Agregar tests unitarios e integración
5. **Autenticación**: Implementar JWT para autenticación stateless
6. **Documentación**: Considerar Swagger/OpenAPI para documentación automática

## 🐛 Troubleshooting

### Errores comunes:
1. **Error de conexión a BD**: Verificar credenciales en `config/db.js`
2. **Puerto ocupado**: Cambiar puerto en `index.js` línea 10
3. **Tablas no existen**: Ejecutar `database_init.sql`
4. **CORS errors**: Verificar configuración de cors en frontend

### Logs útiles:
- Conexión exitosa: "conectado a la base de datos mundo_acuatico"
- Servidor corriendo: "escuchando 8000"
