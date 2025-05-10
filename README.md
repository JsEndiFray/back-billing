# 📦 Backend de Facturación - Sistema de Gestión Inmobiliaria

Este proyecto es una API REST desarrollada en **Node.js** diseñada para la gestión integral de **clientes**, **facturas**, **propietarios** e **inmuebles** en un contexto de administración inmobiliaria.

---

## 🚀 Características principales

- Gestión completa de clientes (particulares, autónomos y empresas)
- Administración de propietarios e inmuebles
- Sistema de facturación con validaciones avanzadas
- Autenticación mediante JWT con sistema de rotación de tokens
- Control de acceso basado en roles (admin, employee)
- Validaciones robustas para todos los datos de entrada
- Arquitectura en capas para mejor mantenibilidad

---

## 🛠️ Tecnologías utilizadas

- **Node.js** – Entorno de ejecución
- **Express** – Framework para la API
- **MySQL** - Base de datos relacional (usando mysql2/promise)
- **JWT** - Autenticación con tokens de acceso y refresco
- **bcrypt** - Hash seguro de contraseñas
- **express-validator** – Validación de datos
- **helmet** - Seguridad mediante headers HTTP
- **cors** - Control de acceso entre orígenes
- **morgan** - Logging de solicitudes HTTP
- **rate-limit** - Protección contra ataques de fuerza bruta

---

## 📌 Roles del sistema

- **admin** → Acceso completo (CRUD)
- **employee** → Acceso limitado (lectura y creación de facturas)

---

## 🛡️ Seguridad implementada

- **Autenticación JWT** con tokens de acceso (corta duración) y refresco (larga duración)
- **Rate limiting** para prevenir ataques de fuerza bruta
- **Headers de seguridad** con Helmet
- **Validación estricta** de datos de entrada
- **Hashing de contraseñas** con bcrypt
- **Middlewares de autorización** por roles
- **Sanitización** de datos de entrada

---

## 🧱 Estructura del proyecto

```
src/
├── controllers/    # Controladores HTTP
├── db/             # Conexión y configuración de base de datos
├── helpers/        # Utilidades y mensajes de error
├── middlewares/    # Middlewares (auth, rate-limit, roles)
├── repository/     # Consultas SQL a la base de datos
├── routes/         # Definición de rutas Express
├── services/       # Lógica de negocio
└── validator/      # Validaciones 
```

---

## ⚙️ Instalación y configuración

### Requisitos previos
- Node.js 20+
- MySQL 8.0+

### Pasos para instalar

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/backend-facturacion.git
cd backend-facturacion
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```
# Crea un archivo .env con los siguientes valores (ajusta según tu entorno)
PORT=3600
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_PORT=3306
DB_DATABASE=tu_base_de_datos
JWT_SECRET=tu_clave_secreta_para_tokens
JWT_REFRESH_SECRET=tu_clave_secreta_para_refresh_tokens
```

4. Inicia el servidor:
```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

---

## 🚦 Endpoints de la API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión (devuelve accessToken y refreshToken)
- `POST /api/auth/refresh-token` - Renovar tokens expirados

### Clientes
- `GET /api/clients` - Obtener todos los clientes
- `GET /api/clients/:id` - Obtener cliente por ID
- `POST /api/clients` - Crear nuevo cliente
- `PUT /api/clients/:id` - Actualizar cliente
- `DELETE /api/clients/:id` - Eliminar cliente

### Inmuebles
- `GET /api/estates` - Obtener todos los inmuebles
- `GET /api/estates/:id` - Obtener inmueble por ID
- `POST /api/estates` - Crear nuevo inmueble
- `PUT /api/estates/:id` - Actualizar inmueble
- `DELETE /api/estates/:id` - Eliminar inmueble

### Propietarios
- `GET /api/owners` - Obtener todos los propietarios
- `GET /api/owners/:id` - Obtener propietario por ID
- `POST /api/owners` - Crear nuevo propietario
- `PUT /api/owners/:id` - Actualizar propietario
- `DELETE /api/owners/:id` - Eliminar propietario

### Facturas
- `GET /api/bills` - Obtener todas las facturas
- `GET /api/bills/:id` - Obtener factura por ID
- `POST /api/bills` - Crear nueva factura
- `PUT /api/bills/:id` - Actualizar factura
- `DELETE /api/bills/:id` - Eliminar factura

### Usuarios
- `GET /api/users` - Obtener todos los usuarios (admin)
- `POST /api/users` - Crear nuevo usuario (admin)
- `PUT /api/users/:id` - Actualizar usuario (admin)
- `DELETE /api/users/:id` - Eliminar usuario (admin)

---

## 🧪 Pruebas

Para probar la API, puedes usar Postman o cualquier cliente HTTP:

1. Autentícate con el endpoint `/api/auth/login`
2. Guarda el token recibido
3. Incluye el token en el header `Authorization: Bearer {token}` para las peticiones protegidas

Puedes importar la colección de Postman incluida en `/docs/postman-collection.json` para empezar rápidamente.

---

## 🔄 Flujo de autenticación

El sistema implementa una estrategia de autenticación con rotación de tokens:

1. **Login**: El usuario se autentica y recibe:
  - `accessToken`: Token de corta duración (15 minutos)
  - `refreshToken`: Token de larga duración (7 días)

2. **Autorización**: El cliente utiliza el `accessToken` para acceder a rutas protegidas

3. **Renovación**: Cuando el `accessToken` expira, el cliente puede obtener nuevos tokens usando el `refreshToken`

4. **Seguridad**: Si el `refreshToken` es comprometido, tiene acceso limitado y expira en 7 días

---

## 📝 Validaciones implementadas

- **Clientes**: Validación de NIF/NIE/CIF según tipo de cliente
- **Inmuebles**: Validación de referencia catastral
- **Facturas**: Prevención de duplicados en mismo mes/año/propietario
- **Usuarios**: Validación de roles y credenciales

---

## 📚 Documentación adicional

- [Guía de despliegue](./docs/deployment.md)
- [Estructura de la base de datos](./docs/database.md)
- [Guía de desarrollo](./docs/development.md)

---

## 🚧 Próximas funcionalidades

- Generación de facturas en PDF (usando PDFKit)
- Documentación de API con Swagger/OpenAPI
- Tests automatizados
- Integración con frontend Angular
- Copias de seguridad automáticas
- Dashboard con estadísticas de facturación

---

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Haz fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Haz push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

---

## 📞 Contacto

Endi - [endifraymv@hotmail.com](mailto:tu-email@ejemplo.com)

---

**Desarrollado por Endi**
