# 📦 Backend — API Facturación

## 📖 Descripción

API REST para gestión de facturación y administración inmobiliaria. Gestiona clientes, proveedores, propietarios, inmuebles, facturas emitidas, facturas recibidas, gastos internos y libros de IVA. Diseñada para ser consumida por un frontend Angular.

---

## 🧱 Arquitectura

El proyecto sigue el patrón **Controller → Service → Repository (CSR)**:

| Capa | Responsabilidad |
|------|----------------|
| **Controller** (`src/controllers/`) | Recibe la petición HTTP, extrae parámetros, llama al servicio y devuelve la respuesta |
| **Service** (`src/services/`) | Contiene la lógica de negocio. Orquesta llamadas al repositorio y a utilidades (PDF, Excel, cálculos) |
| **Repository** (`src/repository/`) | Ejecuta las queries SQL directamente contra la base de datos usando el pool de MySQL |

Adicionalmente existen:

- `src/dto/` — Mapeo de filas de BD a objetos de transferencia
- `src/validator/` — Validaciones de entrada con `express-validator`
- `src/middlewares/` — Auth JWT, roles, rate-limit, upload de ficheros, error handler
- `src/shared/` — Helpers (NIF, catastro, cálculos) y generadores de PDF/Excel

---

## 📂 Estructura del proyecto

```
backend/
├── index.js                        # Punto de entrada: carga .env, valida vars, arranca servidor
├── src/
│   ├── app.js                      # Configuración Express: middlewares, CORS, rutas, error handler
│   ├── db/
│   │   └── dbConnect.js            # Pool MySQL (10 conexiones, keep-alive)
│   ├── config/
│   │   └── swagger.js              # Configuración Swagger / OpenAPI
│   ├── controllers/                # 16 controladores (uno por recurso)
│   ├── services/                   # 16 servicios + tokenManager + fileService + CompanyService
│   ├── repository/                 # 13 repositorios con queries SQL
│   ├── routes/                     # 16 archivos de rutas (uno por recurso)
│   ├── middlewares/
│   │   ├── auth.js                 # Verificación JWT (Bearer token)
│   │   ├── role.js                 # Autorización por rol (admin / employee)
│   │   ├── rate-limit.js           # Límites de peticiones (general + auth)
│   │   ├── fileUpload.js           # Multer — solo PDF, máx. 10 MB
│   │   └── errorHandler.js         # Manejo de errores de validación express-validator
│   ├── dto/                        # 11 DTOs de transformación de datos
│   ├── validator/                  # 9 archivos de validación de entrada
│   ├── errors/
│   │   └── AppError.js             # Clase de error operativo personalizado
│   └── shared/
│       ├── helpers/                # Helpers: NIF, catastro, cálculo de totales, strings
│       └── utils/
│           ├── Pdf-invoicesIssued/ # Generador PDF facturas emitidas y abonos
│           ├── Pdf-Received/       # Generador PDF facturas recibidas
│           ├── Pdf-Expenses/       # Generador PDF gastos de alquiler y devoluciones
│           ├── Pdf-VATBook/        # Generador PDF libro de IVA
│           └── excelGenerador/     # Generador Excel (exceljs)
├── migrations/
│   └── 001_create_app_tables.sql   # Tablas opcionales: user_settings, notification_reads
├── test/
│   └── tests/                      # 7 suites de test (Jest + supertest)
├── uploads/                        # Directorio de PDFs subidos
├── Dockerfile
├── .env.example
└── package.json
```

---

## ⚙️ Configuración (`.env`)

Copiar `.env.example` a `.env` y rellenar los valores:

```env
# Servidor
PORT=3600
NODE_ENV=development

# Base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=your_db_name

# JWT — usar cadenas largas y aleatorias distintas entre sí
JWT_SECRET=change_this_to_a_long_random_secret
JWT_REFRESH_SECRET=change_this_to_a_different_long_random_secret

# CORS — URL del frontend Angular
FRONTEND_URL=http://localhost:4200

# Almacenamiento de archivos (opcional; por defecto ./uploads)
# UPLOAD_PATH=/ruta/absoluta/a/uploads

# Datos de empresa (para exportaciones AEAT)
COMPANY_NIF=XXXXXXXXX
COMPANY_NAME=Nombre de tu empresa
COMPANY_ADDRESS=Calle y número
COMPANY_POSTAL_CODE=00000
COMPANY_CITY=Ciudad
COMPANY_PROVINCE=Provincia
COMPANY_COUNTRY=España
```

**Variables obligatorias** (el servidor no arranca sin ellas):
`JWT_SECRET`, `JWT_REFRESH_SECRET`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `COMPANY_NIF`

---

## 🚀 Ejecución

```bash
# Instalar dependencias
npm install

# Desarrollo (hot-reload con --watch nativo de Node.js)
npm run dev

# Producción
npm start

# Tests
npm test
npm run test:coverage

# Linting
npm run lint
```

**Requisitos**: Node.js ≥ 24.0.0 y MySQL ≥ 8.

### Migraciones opcionales

```sql
-- Ejecutar para activar: configuración de usuario y estado de notificaciones leídas
mysql -u root -p your_db_name < migrations/001_create_app_tables.sql
```

> Sin esta migración el servidor funciona con normalidad; las notificaciones simplemente aparecen siempre como no leídas y la configuración de usuario no persiste.

### Documentación interactiva

```
http://localhost:3600/api-docs
```

---

## 📡 Endpoints reales

Todos los endpoints están bajo `/api`. Las rutas marcadas con 🔒 requieren token JWT. Las marcadas con 👑 requieren rol `admin`; el resto acepta `admin` o `employee`.

### Autenticación — `/api/auth` (sin token, rate-limit: 25 req/hora)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login — devuelve `accessToken` (15 min) y `refreshToken` (7 días) |
| POST | `/api/auth/refresh-token` | Renueva el `accessToken` usando el `refreshToken` |

### Usuarios — `/api/users` 🔒

| Método | Ruta | Roles |
|--------|------|-------|
| GET | `/api/users` | admin, employee |
| GET | `/api/users/:id` | admin, employee |
| GET | `/api/users/search/username/:username` | 👑 admin |
| GET | `/api/users/search/email/:email` | 👑 admin |
| GET | `/api/users/search/phone/:phone` | 👑 admin |
| POST | `/api/users` | 👑 admin |
| PUT | `/api/users/:id` | 👑 admin |
| DELETE | `/api/users/:id` | 👑 admin |

### Empleados — `/api/employee` 🔒

| Método | Ruta | Roles |
|--------|------|-------|
| GET | `/api/employee` | admin, employee |
| GET | `/api/employee/:id` | admin, employee |
| GET | `/api/employee/search` | admin, employee |
| POST | `/api/employee` | 👑 admin |
| PUT | `/api/employee/:id` | 👑 admin |
| DELETE | `/api/employee/:id` | 👑 admin |

### Propietarios — `/api/owners` 🔒

| Método | Ruta | Roles |
|--------|------|-------|
| GET | `/api/owners` | admin, employee |
| GET | `/api/owners/:id` | admin, employee |
| GET | `/api/owners/search/name` | admin, employee |
| GET | `/api/owners/dropdown` | admin, employee |
| POST | `/api/owners` | 👑 admin |
| PUT | `/api/owners/:id` | 👑 admin |
| DELETE | `/api/owners/:id` | 👑 admin |

### Clientes — `/api/clients` 🔒

| Método | Ruta | Roles |
|--------|------|-------|
| GET | `/api/clients` | admin, employee |
| GET | `/api/clients/:id` | admin, employee |
| GET | `/api/clients/companies` | admin, employee |
| GET | `/api/clients/autonoms-with-companies` | admin, employee |
| GET | `/api/clients/company/:companyId/administrators` | admin, employee |
| GET | `/api/clients/type/:clientType` | admin, employee |
| GET | `/api/clients/search/company/:company_name` | admin, employee |
| GET | `/api/clients/search/fullname` | admin, employee |
| GET | `/api/clients/search/identification/:identification` | admin, employee |
| GET | `/api/clients/dropdown` | admin, employee |
| POST | `/api/clients` | admin, employee |
| PUT | `/api/clients/:id` | 👑 admin |
| DELETE | `/api/clients/:id` | 👑 admin |

### Proveedores — `/api/suppliers` 🔒

| Método | Ruta | Roles |
|--------|------|-------|
| GET | `/api/suppliers` | admin, employee |
| GET | `/api/suppliers/all` | admin, employee |
| GET | `/api/suppliers/:id` | admin, employee |
| GET | `/api/suppliers/stats` | admin, employee |
| GET | `/api/suppliers/suggestions` | admin, employee |
| GET | `/api/suppliers/search/:name` | admin, employee |
| GET | `/api/suppliers/tax/:tax_id` | admin, employee |
| GET | `/api/suppliers/payment-terms/:payment_terms` | admin, employee |
| POST | `/api/suppliers` | admin, employee |
| PUT | `/api/suppliers/:id` | admin, employee |
| PUT | `/api/suppliers/:id/activate` | admin, employee |
| DELETE | `/api/suppliers/:id` | admin, employee |

### Inmuebles — `/api/estates` 🔒

| Método | Ruta | Roles |
|--------|------|-------|
| GET | `/api/estates` | admin, employee |
| GET | `/api/estates/:id` | admin, employee |
| GET | `/api/estates/search/cadastral/:cadastral` | admin, employee |
| GET | `/api/estates/dropdown/list` | admin, employee |
| POST | `/api/estates` | admin, employee |
| PUT | `/api/estates/:id` | 👑 admin |
| DELETE | `/api/estates/:id` | 👑 admin |

### Propietarios de Inmuebles — `/api/estate-owners` 🔒

| Método | Ruta | Roles |
|--------|------|-------|
| GET | `/api/estate-owners` | admin, employee |
| GET | `/api/estate-owners/:id` | admin, employee |
| POST | `/api/estate-owners` | 👑 admin |
| PUT | `/api/estate-owners/:id` | 👑 admin |
| DELETE | `/api/estate-owners/:id` | 👑 admin |

### Catastro — `/api/cadastral`

| Método | Ruta | Auth |
|--------|------|------|
| GET | `/api/cadastral/validate/:reference` | 🔒 admin, employee |
| GET | `/api/cadastral/health` | Pública |

### Facturas Emitidas — `/api/invoices-issued` 🔒

| Método | Ruta | Roles |
|--------|------|-------|
| GET | `/api/invoices-issued` | admin, employee |
| GET | `/api/invoices-issued/:id` | admin, employee |
| GET | `/api/invoices-issued/stats` | admin, employee |
| GET | `/api/invoices-issued/stats/client` | admin, employee |
| GET | `/api/invoices-issued/stats/owner` | admin, employee |
| GET | `/api/invoices-issued/overdue` | admin, employee |
| GET | `/api/invoices-issued/due-soon` | admin, employee |
| GET | `/api/invoices-issued/aging` | admin, employee |
| GET | `/api/invoices-issued/refunds` | admin, employee |
| GET | `/api/invoices-issued/vat-book/:year` | admin, employee |
| GET | `/api/invoices-issued/income-statement/:year` | admin, employee |
| GET | `/api/invoices-issued/monthly-summary/:year` | admin, employee |
| GET | `/api/invoices-issued/search/:invoice_number` | admin, employee |
| GET | `/api/invoices-issued/owners/:id` | admin, employee |
| GET | `/api/invoices-issued/clients/:id` | admin, employee |
| GET | `/api/invoices-issued/clients/nif/:nif` | admin, employee |
| GET | `/api/invoices-issued/collection-status/:status` | admin, employee |
| GET | `/api/invoices-issued/month/:month` | admin, employee |
| GET | `/api/invoices-issued/:id/proportional-details` | admin, employee |
| GET | `/api/invoices-issued/:id/pdf` | admin, employee |
| GET | `/api/invoices-issued/refunds/:id/pdf` | admin, employee |
| POST | `/api/invoices-issued` | 👑 admin |
| POST | `/api/invoices-issued/date-range` | 👑 admin |
| POST | `/api/invoices-issued/refunds` | 👑 admin |
| POST | `/api/invoices-issued/validate-proportional-dates` | 👑 admin |
| POST | `/api/invoices-issued/simulate-proportional` | 👑 admin |
| PUT | `/api/invoices-issued/:id` | 👑 admin |
| PUT | `/api/invoices-issued/:id/collection` | 👑 admin |
| DELETE | `/api/invoices-issued/:id` | 👑 admin |

### Facturas Recibidas — `/api/invoices-received` 🔒

| Método | Ruta | Roles |
|--------|------|-------|
| GET | `/api/invoices-received` | admin, employee |
| GET | `/api/invoices-received/:id` | admin, employee |
| GET | `/api/invoices-received/stats` | admin, employee |
| GET | `/api/invoices-received/stats/category` | admin, employee |
| GET | `/api/invoices-received/overdue` | admin, employee |
| GET | `/api/invoices-received/due-soon` | admin, employee |
| GET | `/api/invoices-received/refunds` | admin, employee |
| GET | `/api/invoices-received/vat-book/:year` | admin, employee |
| GET | `/api/invoices-received/search/:invoice_number` | admin, employee |
| GET | `/api/invoices-received/supplier/:supplier_id` | admin, employee |
| GET | `/api/invoices-received/category/:category` | admin, employee |
| GET | `/api/invoices-received/payment-status/:status` | admin, employee |
| GET | `/api/invoices-received/files/:fileName` | admin, employee |
| GET | `/api/invoices-received/:id/pdf` | admin, employee |
| GET | `/api/invoices-received/refunds/:id/pdf` | admin, employee |
| POST | `/api/invoices-received` | admin, employee |
| POST | `/api/invoices-received/date-range` | admin, employee |
| POST | `/api/invoices-received/refunds` | admin, employee |
| PUT | `/api/invoices-received/:id` | admin, employee |
| PUT | `/api/invoices-received/:id/payment` | admin, employee |

### Gastos Internos — `/api/internal-expenses` 🔒

| Método | Ruta | Roles |
|--------|------|-------|
| GET | `/api/internal-expenses` | admin, employee |
| GET | `/api/internal-expenses/:id` | admin, employee |
| GET | `/api/internal-expenses/stats` | admin, employee |
| GET | `/api/internal-expenses/stats/category` | admin, employee |
| GET | `/api/internal-expenses/deductible` | admin, employee |
| GET | `/api/internal-expenses/recurring` | admin, employee |
| GET | `/api/internal-expenses/recurring-due` | admin, employee |
| GET | `/api/internal-expenses/categories` | admin, employee |
| GET | `/api/internal-expenses/payment-methods` | admin, employee |
| GET | `/api/internal-expenses/statuses` | admin, employee |
| GET | `/api/internal-expenses/category/:category` | admin, employee |
| GET | `/api/internal-expenses/status/:status` | admin, employee |
| GET | `/api/internal-expenses/supplier/:supplier_name` | admin, employee |
| GET | `/api/internal-expenses/monthly-summary/:year` | admin, employee |
| GET | `/api/internal-expenses/vat-book/:year` | admin, employee |
| GET | `/api/internal-expenses/files/:fileName` | admin, employee |
| POST | `/api/internal-expenses` | admin, employee |
| POST | `/api/internal-expenses/date-range` | admin, employee |
| POST | `/api/internal-expenses/advanced-search` | admin, employee |
| POST | `/api/internal-expenses/process-recurring` | 👑 admin |

### Libro de IVA — `/api/vat-book` 🔒

| Método | Ruta | Roles |
|--------|------|-------|
| GET | `/api/vat-book/supported/:year[/:quarter[/:month]]` | admin, employee |
| GET | `/api/vat-book/charged/:year[/:quarter[/:month]]` | admin, employee |
| GET | `/api/vat-book/by-owner/:year[/:quarter[/:month]]` | admin, employee |
| GET | `/api/vat-book/consolidated/:year[/:quarter[/:month]]` | admin, employee |
| GET | `/api/vat-book/complete/:year` | admin, employee |
| GET | `/api/vat-book/liquidation/:year/:quarter` | admin, employee |
| GET | `/api/vat-book/stats/:year` | admin, employee |
| GET | `/api/vat-book/comparison/:year` | admin, employee |
| GET | `/api/vat-book/config` | admin, employee |
| POST | `/api/vat-book/export/excel` | admin, employee |
| POST | `/api/vat-book/download/excel` | admin, employee |
| POST | `/api/vat-book/download/pdf` | admin, employee |

### Dashboard — `/api/dashboard` 🔒

| Método | Ruta | Roles |
|--------|------|-------|
| GET | `/api/dashboard/stats` | admin, employee |

### Configuración de usuario — `/api/settings` 🔒

| Método | Ruta |
|--------|------|
| GET | `/api/settings` |
| PUT | `/api/settings` |

> Requiere ejecutar la migración `001_create_app_tables.sql` para persistir la configuración.

### Notificaciones — `/api/notifications` 🔒

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/notifications` | Devuelve notificaciones computadas del usuario |
| PATCH | `/api/notifications/:id/read` | Marca una notificación como leída |

---

## 🔐 Sistema de autenticación

**Estrategia**: JWT stateless con doble token.

| Token | Duración | Uso |
|-------|----------|-----|
| `accessToken` | 15 minutos | Header `Authorization: Bearer <token>` en cada petición |
| `refreshToken` | 7 días | Endpoint `/api/auth/refresh-token` para renovar el access token |

**Flujo**:
1. `POST /api/auth/login` → devuelve ambos tokens
2. El frontend adjunta el `accessToken` en cada request
3. Cuando el access token expira (401), el frontend llama a `/api/auth/refresh-token`
4. A los 7 días el refresh token expira y el usuario debe volver a hacer login

**Roles disponibles**: `admin` (acceso completo) y `employee` (lectura + algunas operaciones de creación)

**Rate limiting**:
- Rutas generales: 100 peticiones por IP cada 15 minutos
- Rutas de autenticación: 25 peticiones por IP cada hora

---

## 🔔 Sistema de notificaciones

Las notificaciones son **computadas bajo demanda**, no almacenadas. En cada llamada a `GET /api/notifications` se ejecutan 3 queries en paralelo:

| ID | Tipo | Condición |
|----|------|-----------|
| 1 | `pending_invoices` | `invoices_issued` con `collection_status = 'pending'` |
| 2 | `overdue_invoices` | `invoices_issued` con `collection_status = 'overdue'` |
| 3 | `new_clients` | `clients` creados en los últimos 7 días |

Solo se incluye en la respuesta la notificación si su contador es > 0.

**Estado "leído"**: persiste en la tabla `notification_reads` (requiere migración). Si la tabla no existe, el sistema funciona igualmente y todas las notificaciones aparecen como no leídas.

**Limitación**: Los IDs de notificación son estáticos (1, 2, 3). No existe sistema de notificaciones en tiempo real (WebSocket/SSE).

---

## 📎 Gestión de archivos

- **Subida**: Multer con `memoryStorage` (procesado en RAM antes de guardar en disco)
- **Tipo permitido**: solo PDF
- **Tamaño máximo**: 10 MB
- **Campo del formulario**: `invoice_file`
- **Descarga**: endpoint `GET /files/:fileName` disponible en facturas recibidas y gastos internos

---

## 🧪 Estado actual

**✔ Funcionalidades completas**

- Autenticación JWT (login + refresh token)
- CRUD completo de: usuarios, empleados, propietarios, clientes, proveedores, inmuebles, relaciones propietario-inmueble
- Gestión completa de facturas emitidas (con abonos, facturación proporcional, estados de cobro)
- Gestión completa de facturas recibidas (con abonos, estados de pago, adjuntos PDF)
- Gestión de gastos internos (con recurrentes, categorías, adjuntos PDF)
- Libro de IVA con filtros por año/trimestre/mes, liquidación trimestral, exportación Excel y PDF
- Dashboard con estadísticas agregadas
- Generación de PDFs para facturas, abonos, gastos y libro de IVA
- Validación de referencias catastrales
- Rate limiting, Helmet, CORS configurados
- Documentación Swagger en `/api-docs`
- Suite de tests (Jest + supertest)
- Dockerfile incluido

**⚠ Funcionalidades parciales**

- **Notificaciones**: funcionan en lectura, pero los IDs son estáticos; añadir nuevos tipos requiere modificar código
- **`user_settings`**: el endpoint existe pero requiere ejecutar la migración manualmente para persistir datos
- **Rate limiting en producción multi-instancia**: usa memoria local; sin Redis, el estado no se comparte entre instancias

---

## ⚠️ Limitaciones reales

1. **Sin revocación de tokens**: no existe blacklist de tokens. Un token robado es válido hasta que expire (máx. 15 min para access token).
2. **Notificaciones estáticas**: máximo 3 tipos hardcodeados. Sin sistema push (WebSocket/SSE).
3. **Migraciones manuales**: no hay sistema de migraciones automáticas; `001_create_app_tables.sql` debe ejecutarse a mano.
4. **Rate limit en memoria**: en despliegues con múltiples procesos o instancias, el límite no se comparte.
5. **Sin registro de auditoría**: no existe log de quién creó/modificó/eliminó registros.
6. **Swagger warning cosmético**: `swagger-jsdoc@6` genera `DEP0169` en Node.js ≥24 por uso interno de `url.parse()`. No afecta a la funcionalidad (ver `TECHNICAL_DEBT.md`).

---

## 🧠 Mejoras futuras

- Integrar Redis para rate limiting distribuido y blacklist de refresh tokens
- Sistema de migraciones automáticas (ej. Flyway, Liquibase o solución Node.js)
- Notificaciones en tiempo real vía WebSocket o SSE
- Log de auditoría (quién y cuándo modificó cada registro)
- Actualizar a `swagger-jsdoc@7` cuando haya versión estable (elimina DEP0169)
- Paginación estandarizada en todos los listados
