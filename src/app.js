import swaggerUi from 'swagger-ui-express';
import swaggerSpec from "./config/swagger.js";

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from "helmet";

//Importaciones de rutas existentes
import clientsRoutes from './routes/clientsRoutes.js'
import estateRoutes from './routes/estatesRoutes.js';
import billsRoutes from './routes/billsRoutes.js';
import ownersRoutes from './routes/ownersRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import authRoutes from "./routes/authRoutes.js";
import estatesOwnersRoutes from "./routes/estatesOwnersRoutes.js";
import {generalLimiter, authLimiter} from "./middlewares/rate-limit.js";

//Variables
const app = express();

//Middleware
//para seguridad con headers HTTP
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:"],
        },
    },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: {policy: 'same-origin'},
}));

// Configuración más específica para producción
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:4200', // URL de tu app Angular
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 horas
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(morgan('dev'));
//Aplicar a todas las rutas
app.use(generalLimiter);


//Conexión a la DB
app.use('/api/clients', clientsRoutes)
app.use('/api/estates', estateRoutes)
app.use('/api/bills', billsRoutes)
app.use('/api/owners', ownersRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/auth', authLimiter, authRoutes) //Aplicar solo a rutas de autenticación
app.use('/api/estate-owners', estatesOwnersRoutes)

//Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware para rutas no encontradas (404)
app.use((req, res) => {
    res.status(404).json('Ruta no encontrada');
});

// Middleware para errores globales (500)
app.use((err, req, res, next) => {
    console.error('Error inesperado:', err.stack);

    res.status(500).json('Error interno del servidor');
});


export default app;