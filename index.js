/**
 * @fileoverview Punto de entrada principal de la aplicación
 *
 /**
 * @fileoverview Punto de entrada y arranque del servidor.
 * Carga las variables de entorno e inicia la aplicación Express.
 */

//Importaciones
import app from './src/app.js';
import { checkDbConnection } from './src/db/dbConnect.js';

//Carga de Variables de Entorno

//Carga las variables desde el archivo .env a process.env
// Fallback: si no se usó --env-file al arrancar (e.g. node directo sin npm script)
try { process.loadEnvFile(); } catch { /* .env no encontrado o ya cargado */ }

/// --- Validación de Variables Críticas ---

const REQUIRED_ENV_VARS = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_DATABASE',
    'COMPANY_NIF',
];

const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key]);
if (missing.length > 0) {
    console.error(`Error: faltan variables de entorno obligatorias: ${missing.join(', ')}`);
    process.exit(1);
}

/// --- Configuración del Puerto ---

// Define el puerto para el servidor, usa el del entorno o 3600 por defecto
const port = process.env.PORT || 3600;

/// --- Arranque del Servidor ---

// Inicia el servidor y lo pone a escuchar en el puerto definido
checkDbConnection()
    .then(() => {
        app.listen(port, () => {
            console.log(`Servidor conectado en el puerto..... ${port}`);
            console.log(`Documentación disponible en http://localhost:${port}/api-docs`);
        });
    })
    .catch((error) => {
        console.error('Error de conexión:', error.message);
        process.exit(1);
    });