/**
 * @fileoverview Configuración principal de la aplicación Express
 *
 * Configura el servidor Express con todos los middlewares de seguridad,
 * CORS, rate limiting, rutas de la API y documentación Swagger.
 * Incluye manejo global de errores y rutas no encontradas.
 *
 * @requires express
 * @requires cors
 * @requires morgan
 * @requires helmet
 * @requires swagger-ui-express
 * @author Tu Nombre
 * @since 1.0.0
 */

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from "./config/swagger.js";

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from "helmet";

// Importaciones de rutas existentes
import clientsRoutes from './routes/clientsRoutes.js'
import estateRoutes from './routes/estatesRoutes.js';
import billsRoutes from './routes/billsRoutes.js';
import ownersRoutes from './routes/ownersRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import authRoutes from "./routes/authRoutes.js";
import estatesOwnersRoutes from "./routes/estatesOwnersRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js"
import rentalExpensesRoutes from "./routes/rentalExpensesRoutes.js";
import {generalLimiter, authLimiter} from "./middlewares/rate-limit.js";

/**
 * Instancia principal de la aplicación Express
 * @constant {express.Application}
 */
const app = express();

// ==========================================
// MIDDLEWARES DE SEGURIDAD
// ==========================================

/**
 * Configuración de Helmet para seguridad HTTP
 *
 * Aplica múltiples headers de seguridad para proteger contra ataques comunes
 * como XSS, clickjacking, y otros vectores de ataque web.
 *
 * @middleware
 * @see {@link https://helmetjs.github.io/} Documentación de Helmet
 */
app.use(helmet({
    /**
     * Política de Seguridad de Contenido (CSP)
     * Define qué recursos pueden cargar las páginas web
     */
    contentSecurityPolicy: {
        directives: {
            /** Fuentes por defecto - solo mismo origen */
            defaultSrc: ["'self'"],
            /** Scripts permitidos - mismo origen e inline para Swagger UI */
            scriptSrc: ["'self'", "'unsafe-inline'"],
            /** Estilos permitidos - mismo origen e inline para Swagger UI */
            styleSrc: ["'self'", "'unsafe-inline'"],
            /** Imágenes permitidas - mismo origen y data URIs */
            imgSrc: ["'self'", "data:"],
        },
    },
    /** Protección XSS habilitada - previene ataques de scripting */
    xssFilter: true,
    /** Prevención de MIME type sniffing - evita interpretación incorrecta de archivos */
    noSniff: true,
    /** Política de referrer para same-origin - controla información enviada en headers */
    referrerPolicy: {policy: 'same-origin'},
}));

/**
 * Configuración CORS para comunicación cross-origin
 *
 * Permite solicitudes desde el frontend Angular con credenciales
 * y controla qué métodos y headers están permitidos.
 *
 * @constant {Object} corsOptions - Configuración específica de CORS
 */
const corsOptions = {
    /** URL del frontend Angular (desde variable de entorno o localhost por defecto) */
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',

    /** Métodos HTTP permitidos para requests cross-origin */
    methods: ['GET', 'POST', 'PUT', 'DELETE'],

    /** Headers permitidos en las solicitudes del cliente */
    allowedHeaders: ['Content-Type', 'Authorization'],

    /** Permitir envío de credenciales (cookies, auth headers) */
    credentials: true,

    /** Cache de preflight requests por 24 horas (en segundos) */
    maxAge: 86400
};

app.use(cors(corsOptions));

// ==========================================
// MIDDLEWARES GENERALES
// ==========================================

/**
 * Parser de JSON para request bodies
 *
 * Convierte automáticamente el JSON del body de las requests
 * en objetos JavaScript accesibles via req.body
 *
 * @middleware
 */
app.use(express.json());

/**
 * Logger de requests HTTP en formato 'dev'
 *
 * Registra en consola información de cada request: método, URL,
 * código de estado y tiempo de respuesta en formato legible.
 *
 * @middleware
 * @see {@link https://github.com/expressjs/morgan} Documentación de Morgan
 *
 * @example
 * // Salida típica:
 * // GET /api/users 200 45.123 ms - 1024
 */
app.use(morgan('dev'));

/**
 * Rate limiting general aplicado a todas las rutas
 *
 * Limita el número de requests por IP para prevenir abuso
 * y ataques de denegación de servicio.
 *
 * @middleware
 */
app.use(generalLimiter);

// ==========================================
// RUTAS DE LA API
// ==========================================

/**
 * Rutas para gestión de clientes
 *
 * Maneja todas las operaciones CRUD relacionadas con clientes:
 * crear, leer, actualizar y eliminar registros de clientes.
 *
 * @route {Object} /api/clients - Operaciones CRUD de clientes
 */
app.use('/api/clients', clientsRoutes)

/**
 * Rutas para gestión de propiedades/inmuebles
 *
 * Maneja todas las operaciones relacionadas con propiedades:
 * listado, creación, modificación y eliminación de inmuebles.
 *
 * @route {Object} /api/estates - Operaciones CRUD de propiedades
 */
app.use('/api/estates', estateRoutes)

/**
 * Rutas para gestión de facturas
 *
 * Maneja el sistema de facturación: creación de facturas,
 * cálculos de impuestos, estados de pago, etc.
 *
 * @route {Object} /api/bills - Operaciones CRUD de facturas
 */
app.use('/api/bills', billsRoutes)

/**
 * Rutas para gestión de propietarios
 *
 * Maneja información de propietarios de inmuebles:
 * datos personales, contacto, documentación, etc.
 *
 * @route {Object} /api/owners - Operaciones CRUD de propietarios
 */
app.use('/api/owners', ownersRoutes)

/**
 * Rutas para gestión de usuarios del sistema
 *
 * Maneja cuentas de usuarios que acceden al sistema:
 * perfiles, permisos, configuraciones, etc.
 *
 * @route {Object} /api/users - Operaciones CRUD de usuarios
 */
app.use('/api/users', usersRoutes)

/**
 * Rutas de autenticación con rate limiting específico
 *
 * Maneja login, registro, renovación de tokens y logout.
 * Incluye rate limiting más estricto para prevenir ataques de fuerza bruta.
 *
 * @route {Object} /api/auth - Login, registro, tokens, logout
 */
app.use('/api/auth', authLimiter, authRoutes)

/**
 * Rutas para relaciones propiedades-propietarios
 *
 * Maneja las asociaciones entre inmuebles y sus propietarios,
 * permitiendo múltiples propietarios por propiedad.
 *
 * @route {Object} /api/estate-owners - Gestión de asociaciones
 */
app.use('/api/estate-owners', estatesOwnersRoutes)

/**
 * Rutas para relaciones empleados
 *
 * Maneja las cuenta de empleados a los sistemas,
 *
 * @route {Object} /api/employee - Gestión de empleados
 */
app.use('/api/employee', employeeRoutes)

/**
 * Rutas para gastos
 *
 * Maneja los gastos de los inmubles,
 *
 * @route {Object} /api/expenses - Gestión de gastos
 */
app.use('/api/expenses', rentalExpensesRoutes)

// ==========================================
// DOCUMENTACIÓN API
// ==========================================

/**
 * Documentación Swagger de la API
 *
 * Interfaz web interactiva para explorar y probar todos los endpoints
 * de la API. Genera documentación automática basada en la configuración
 * de Swagger definida en config/swagger.js
 *
 * @route {GET} /api-docs - Interfaz de documentación Swagger
 *
 * @example
 * // Acceso a la documentación:
 * // http://localhost:3600/api-docs
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ==========================================
// MANEJO DE ERRORES
// ==========================================

/**
 * Middleware para rutas no encontradas (404)
 *
 * Captura todas las solicitudes que no coinciden con ninguna ruta
 * definida anteriormente y devuelve un error 404 con mensaje JSON.
 *
 * @middleware
 * @param {express.Request} req - Objeto de solicitud
 * @param {express.Response} res - Objeto de respuesta
 *
 * @example
 * // Request a ruta inexistente:
 * // GET /api/nonexistent
 * // Response: "Ruta no encontrada"
 */
app.use((req, res) => {
    res.status(404).json('Ruta no encontrada');
});

/**
 * Middleware global para manejo de errores (500)
 *
 * Captura todos los errores no manejados en la aplicación,
 * los registra en consola para debugging y devuelve un mensaje
 * genérico al cliente sin exponer detalles internos.
 *
 * @middleware
 * @param {Error} err - Error capturado
 * @param {express.Request} req - Objeto de solicitud
 * @param {express.Response} res - Objeto de respuesta
 * @param {express.NextFunction} next - Función para pasar al siguiente middleware
 *
 * @example
 * // Si ocurre un error no controlado:
 * // Se registra en consola: "Error inesperado: [stack trace]"
 * // Se responde: "Error interno del servidor"
 */
app.use((err, req, res, next) => {
    // Log del error completo para debugging
    console.error('Error inesperado:', err.stack);

    // Respuesta genérica al cliente (no exponer detalles internos)
    res.status(500).json('Error interno del servidor');
});

/**
 * Aplicación Express configurada y lista para usar
 *
 * @module app
 * @default app
 *
 * @example
 * // Importar en index.js
 * import app from './src/app.js';
 *
 * @example
 * // Iniciar servidor
 * app.listen(3600, () => console.log('Servidor iniciado'));
 */
export default app;