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

## 🧱 Estructura del proyecto

```
src/
├── controllers/    # Controladores HTTP para cada entidad
├── db/            # Configuración de conexión a la base de datos
├── helpers/       # Funciones útiles (validación NIF, manejo de errores)
├── middlewares/   # Middlewares (auth, roles, rate-limit)
├── repository/    # Capa de acceso a datos para cada entidad
├── routes/        # Definición de rutas para la API
├── services/      # Lógica de negocio para cada entidad
├── utils/         # Utilidades específicas (generación de PDFs)
└── validator/     # Validadores para cada entidad
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

## 🧪 Pruebas

Para ejecutar las pruebas unitarias y de integración:

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas con watch mode
npm run test:watch

# Ver cobertura de pruebas
npm run test:coverage
```

## 📚 Documentación de la API

La documentación de la API está pendiente a través de Swagger UI:

```
http://localhost:3600/api-docs
```

## 🚧 Próximas funcionalidades

- Implementación de tests más completos
- Sistema de logs estructurados
- Soporte para múltiples idiomas
- Sistema de notificaciones para facturas vencidas
- Dashboard con estadísticas de facturación
- Integración con servicios de firma digital
- Exportación de datos en múltiples formatos
- Sistema de búsqueda avanzada
- Implementación de caché para optimizar consultas frecuentes

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Haz fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Haz push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📞 Contacto

Endi - [endifraymv@hotmail.com](mailto:endifraymv@hotmail.com)

---

**Desarrollado por Endi**