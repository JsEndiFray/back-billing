/**
 * @fileoverview Configuración principal del servidor Express.
 * Define middlewares, rutas, documentación y manejo de errores.
 */
//Importaciones de Módulos
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from "helmet";

//Importaciones de Configuración y Middlewares Locales
import swaggerSpec from "./config/swagger.js";
import {generalLimiter, authLimiter} from "./middlewares/rate-limit.js";

//Importaciones de Rutas de la API
import clientsRoutes from './routes/clientsRoutes.js'
import estateRoutes from './routes/estatesRoutes.js';
import ownersRoutes from './routes/ownersRoutes.js';
import cadastralRoutes from './routes/cadastralRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import authRoutes from "./routes/authRoutes.js";
import estatesOwnersRoutes from "./routes/estatesOwnersRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js"
import suppliersRoutes from "./routes/suppliersRoutes.js";
import invoicesReceivedRoutes from "./routes/invoicesReceivedRoutes.js";
import internalExpensesRoutes from "./routes/internalExpensesRoutes.js";
import invoicesIssuedRoutes from "./routes/invoicesIssuedRoutes.js";
import VATBookRoutes from "./routes/VATBookRoutes.js";


//Inicialización de la App
const app = express();

//Middlewares de Seguridad
app.use(helmet({
    // Configura headers de seguridad HTTP para proteger la aplicación
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"], // Necesario para Swagger UI
            styleSrc: ["'self'", "'unsafe-inline'"],  // Necesario para Swagger UI
            imgSrc: ["'self'", "data:"],
        },
    },
    //Protección XSS habilitada - previene ataques de scripting
    xssFilter: true,
    //Prevención de MIME type sniffing - evita interpretación incorrecta de archivos
    noSniff: true,
    //Política de referrer para same-origin - controla información enviada en headers
    referrerPolicy: {policy: 'same-origin'},
}));

//Habilita CORS para permitir peticiones desde el frontend
const corsOptions = {
    // URL del frontend Angular (desde variable de entorno o localhost por defecto)
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    //Métodos HTTP permitidos para requests cross-origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    //Headers permitidos en las solicitudes del cliente
    allowedHeaders: ['Content-Type', 'Authorization'],
    //Permitir envío de credenciales (cookies, auth headers)
    credentials: true,
    //Cache de preflight requests por 24 horas (en segundos)
    maxAge: 86400
};

app.use(cors(corsOptions));

//Middlewares Generales

// Parsea el body de las peticiones a JSON (req.body)
app.use(express.json());

// Logger de peticiones HTTP en la consola en modo desarrollo
app.use(morgan('dev'));

// Aplica un límite de peticiones general a toda la API
app.use(generalLimiter);

//Rutas de la API

// Aplica rate limiting específico a las rutas de autenticación
app.use('/api/auth', authLimiter, authRoutes)

// Endpoints para cada recurso de la aplicación
app.use('/api/users', usersRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/owners', ownersRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/estates', estateRoutes);
app.use('/api/cadastral', cadastralRoutes);
app.use('/api/estate-owners', estatesOwnersRoutes);
app.use('/api/invoices-received', invoicesReceivedRoutes);
app.use('/api/invoices-issued', invoicesIssuedRoutes);
app.use('/api/internal-expense', internalExpensesRoutes);
app.use('/api/vat-book', VATBookRoutes);

//Documentación de la API con Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Manejo de Errores

// Middleware para capturar rutas no encontradas (404)
app.use((req, res) => {
    res.status(404).json('Ruta no encontrada');
});

/// Middleware global para manejar errores inesperados (500)
app.use((err, req, res, next) => {
    res.status(500).json('Error interno del servidor');
});

//Exportación de la App
export default app;