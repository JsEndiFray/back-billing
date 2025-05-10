import cors from 'cors';

import app from './src/app.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from 'swagger-ui-express';

//.env
process.loadEnvFile();


const port = process.env.PORT || 3600;



/*
// Configuración más específica para producción
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:4200', // URL de tu app Angular
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 horas
};
app.use(cors(corsOptions));
*/



// Configura Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


//Conexión del servidor
app.listen(port, () => {
    console.log(`Servidor conectado en el puerto..... ${port}`);
})

