import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import clientsRoutes from './src/routes/clientsRoutes.js'
import estateRoutes from './src/routes/estatesRoutes.js';
import billsRoutes from './src/routes/billsRoutes.js';
import ownersRoutes from './src/routes/ownersRoutes.js';
import usersRoutes from './src/routes/usersRoutes.js';
import authRoutes from "./src/routes/authRoutes.js";

//.env
process.loadEnvFile();

//Variables
const app = express();
const port = process.env.PORT || 3600;

//Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

//Conexión a la DB
app.use('/api/clients', clientsRoutes)
app.use('/api/estates', estateRoutes)
app.use('/api/bills', billsRoutes)
app.use('/api/owners', ownersRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/auth', authRoutes)


// Middleware para rutas no encontradas (404)
app.use((req, res) => {
    res.status(404).json({
        msg: 'Ruta no encontrada'
    });
});

// Middleware para errores globales (500)
app.use((err, req, res, next) => {
    console.error('Error inesperado:', err.stack);

    res.status(500).json({
        msg: 'Error interno del servidor'
    });
});

//Conexión del servidor
app.listen(port, () => {
    console.log(`Servidor conectado en el puerto..... ${port}`);
})

