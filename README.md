# 📦 Backend de Facturación - Sistema de Gestión Inmobiliaria

Este proyecto es una API REST desarrollada en **Node.js** diseñada para la gestión integral de **clientes**, **facturas**, **propietarios** e **inmuebles** en un contexto de administración inmobiliaria, con especial énfasis en la generación y gestión de facturas.

## 🚀 Características principales

- Gestión completa de clientes (particulares, autónomos y empresas)
- Administración de propietarios e inmuebles con relaciones M:M
- Sistema de facturación con validaciones avanzadas y cálculos automáticos
- Sistema de abonos (facturas rectificativas) con generación de PDFs
- Autenticación mediante JWT con sistema de rotación de tokens
- Control de acceso basado en roles (admin, employee)
- Validaciones robustas para todos los datos de entrada (NIF/NIE/CIF)
- Arquitectura en capas para mejor mantenibilidad
- Documentación de API con Swagger/OpenAPI
- **Sistema centralizado de manejo de errores con códigos estandarizados**

## 🛠️ Tecnologías utilizadas

- **Node.js** – Entorno de ejecución
- **Express** – Framework para la API (Versión 5.1.0)
- **MySQL** - Base de datos relacional (usando mysql2/promise)
- **JWT** - Autenticación con tokens de acceso y refresco
- **bcrypt** - Hash seguro de contraseñas
- **express-validator** – Validación de datos
- **helmet** - Seguridad mediante headers HTTP
- **cors** - Control de acceso entre orígenes
- **morgan** - Logging de solicitudes HTTP
- **rate-limit** - Protección contra ataques de fuerza bruta
- **PDFKit** - Generación de facturas en PDF
- **SweetAlert2** - Interfaz de usuario para mensajes de error en el frontend

## 📌 Roles del sistema

- **admin** → Acceso completo (CRUD en todas las entidades)
- **employee** → Acceso limitado:
  - Lectura en todas las entidades
  - Creación de facturas
  - Creación de clientes e inmuebles
  - No puede modificar ni eliminar recursos

## 🛡️ Seguridad implementada

- **Autenticación JWT** con tokens de acceso (15 minutos) y refresco (7 días)
- **Rate limiting** para prevenir ataques de fuerza bruta (100 peticiones/15min general, 5 intentos/hora para autenticación)
- **Headers de seguridad** con Helmet
- **Validación estricta** de datos de entrada con express-validator
- **Hashing de contraseñas** con bcrypt
- **Middlewares de autorización** por roles
- **Sanitización** de datos de entrada
- **Sistema centralizado de errores** con códigos estandarizados y mensajes descriptivos

## 🧱 Estructura del proyecto

```
src/
├── controllers/    # Controladores HTTP para cada entidad
├── db/            # Configuración de conexión a la base de datos
├── errors/        # Sistema centralizado de manejo de errores
│   ├── errorCodes.js     # Definición de códigos de error
│   └── index.js         # Funciones de utilidad para manejo de errores
├── helpers/       # Funciones útiles (validación NIF, manejo de errores)
├── middlewares/   # Middlewares (auth, roles, rate-limit)
├── repository/    # Capa de acceso a datos para cada entidad
├── routes/        # Definición de rutas para la API
├── services/      # Lógica de negocio para cada entidad
├── utils/         # Utilidades específicas (generación de PDFs)
└── validator/     # Validadores para cada entidad
```

---

## 🚀 Despliegue con Docker (Global)

Este backend forma parte de un sistema **fullstack dockerizado**, compuesto por:

- 🚀 Backend: Node.js + Express
- 🎨 Frontend: Angular
- 📂 Base de datos: MySQL 8.0
- 📄 Gestor de BD: phpMyAdmin

### ✅ Para lanzar todo con un solo comando:
```bash
docker-compose -f docker-compose.fullstack.yml up -d
```

Esto levantará:

- Backend en: `http://localhost:3600`
- Frontend en: `http://localhost:4200`
- phpMyAdmin en: `http://localhost:8080`
- Base de datos MySQL en: `localhost:3306`

### 📄 Archivos necesarios:
- `docker-compose.fullstack.yml`
- `backend/Dockerfile`, `frontend/Dockerfile`
- `.env.fullstack` con todas las variables

### 📁 Estructura sugerida del proyecto:
```
facturas-project/
├── backend/
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── Dockerfile
│   ├── Dockerfile.prod
│   └── .dockerignore
├── database/
│   └── init.sql (opcional)
├── docker-compose.fullstack.yml
├── .env.fullstack
├── start-fullstack.sh
└── stop-fullstack.sh
```

---

## 🅰️ Integración con Angular (Frontend)

Este backend está preparado para conectarse con una aplicación Angular (v19+) dockerizada. Configura la URL de la API en Angular así:

### 🔧 `src/environments/environment.ts`
```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3600/api'
};
```

### 🔧 `src/environments/environment.prod.ts`
```ts
export const environment = {
  production: true,
  apiUrl: 'https://api.tu-dominio.com/api'
};
```

## ⚙️ Instalación y configuración

### Requisitos previos
- Node.js 18+
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

## 🚦 Endpoints principales de la API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión (devuelve accessToken y refreshToken)
- `POST /api/auth/refresh-token` - Renovar tokens expirados

### Clientes
- `GET /api/clients` - Obtener todos los clientes
- `GET /api/clients/:id` - Obtener cliente por ID
- `GET /api/clients/type/:clientType` - Buscar clientes por tipo
- `GET /api/clients/search/identification/:identification` - Buscar cliente por NIF/NIE/CIF
- `POST /api/clients` - Crear nuevo cliente
- `PUT /api/clients/:id` - Actualizar cliente
- `DELETE /api/clients/:id` - Eliminar cliente

### Inmuebles
- `GET /api/estates` - Obtener todos los inmuebles
- `GET /api/estates/:id` - Obtener inmueble por ID
- `GET /api/estates/search/cadastral/:cadastral` - Buscar por referencia catastral
- `POST /api/estates` - Crear nuevo inmueble
- `PUT /api/estates/:id` - Actualizar inmueble
- `DELETE /api/estates/:id` - Eliminar inmueble

### Propietarios
- `GET /api/owners` - Obtener todos los propietarios
- `GET /api/owners/:id` - Obtener propietario por ID
- `POST /api/owners` - Crear nuevo propietario
- `PUT /api/owners/:id` - Actualizar propietario
- `DELETE /api/owners/:id` - Eliminar propietario

### Relación Inmuebles-Propietarios
- `GET /api/estate-owners` - Obtener todas las relaciones
- `POST /api/estate-owners` - Crear nueva relación
- `PUT /api/estate-owners/:id` - Actualizar relación
- `DELETE /api/estate-owners/:id` - Eliminar relación

### Facturas
- `GET /api/bills` - Obtener todas las facturas
- `GET /api/bills/:id` - Obtener factura por ID
- `GET /api/bills/:id/pdf` - Descargar factura en PDF
- `GET /api/bills/search/:bill_number` - Buscar factura por número
- `GET /api/bills/clients/nif/:nif` - Historial de facturas por NIF
- `POST /api/bills` - Crear nueva factura
- `PUT /api/bills/:id` - Actualizar factura
- `DELETE /api/bills/:id` - Eliminar factura

### Abonos (Facturas rectificativas)
- `GET /api/bills/refunds` - Obtener todos los abonos
- `GET /api/bills/refunds/:id/pdf` - Descargar abono en PDF
- `POST /api/bills/refunds` - Crear nuevo abono

### Usuarios
- `GET /api/users` - Obtener todos los usuarios (admin)
- `POST /api/users` - Crear nuevo usuario (admin)
- `PUT /api/users/:id` - Actualizar usuario (admin)
- `DELETE /api/users/:id` - Eliminar usuario (admin)

## 🔄 Flujo de autenticación

El sistema implementa una estrategia de autenticación con rotación de tokens:

1. **Login**: El usuario se autentica y recibe:
- `accessToken`: Token de corta duración (15 minutos)
- `refreshToken`: Token de larga duración (7 días)

2. **Autorización**: El cliente utiliza el `accessToken` para acceder a rutas protegidas

3. **Renovación**: Cuando el `accessToken` expira, el cliente puede obtener nuevos tokens usando el `refreshToken`

4. **Seguridad**: Si el `refreshToken` es comprometido, tiene acceso limitado y expira en 7 días

## 📝 Validaciones implementadas

- **Clientes**: Validación de NIF/NIE/CIF según tipo de cliente (particular, autónomo, empresa)
- **Inmuebles**: Validación de referencia catastral (20 caracteres alfanuméricos)
- **Propietarios**: Validación de NIF (8 números + 1 letra)
- **Facturas**: Prevención de duplicados en mismo mes/año/propietario
- **Usuarios**: Validación de roles y credenciales

## 🚨 Sistema de manejo de errores

Hemos implementado un sistema centralizado de manejo de errores que incluye:

- **Códigos de error estandarizados**: Cada tipo de error tiene un código único que lo identifica.
- **Mensajes descriptivos**: Mensajes claros y útiles para el usuario final.
- **Mapeo de parámetros a errores**: Sistema que asocia automáticamente campos con sus errores específicos.
- **Respuestas HTTP apropiadas**: Códigos de estado HTTP correctos según el tipo de error.
- **Interceptor en el frontend**: Manejo consistente de errores en la interfaz de usuario.

### Estructura de respuestas de error:

```json
{
  "errorCode": "USER_EMAIL_INVALID",
  "msg": "El formato del correo electrónico no es válido."
}
```

### Categorías de errores:

- **GLOBAL_**: Errores generales del sistema
- **USER_**: Errores relacionados con usuarios y autenticación
- **CLIENT_**: Errores relacionados con clientes
- **ESTATE_**: Errores relacionados con inmuebles
- **OWNER_**: Errores relacionados con propietarios
- **BILL_**: Errores relacionados con facturas


## 📚 Documentación de la API

La documentación de la API está pendiente a través de Swagger UI:

```
http://localhost:3600/api-docs
```


## 👥 Contribuciones

Las contribuciones son bienvenidas.

## 📞 Contacto

Endi - [endifraymv@hotmail.com](mailto:endifraymv@hotmail.com)

---

**Desarrollado por Endi**