/**
 * @fileoverview Punto de entrada principal de la aplicación
 *
 /**
 * @fileoverview Punto de entrada y arranque del servidor.
 * Carga las variables de entorno e inicia la aplicación Express.
 */

//Importaciones
import app from './src/app.js';

//Carga de Variables de Entorno

//Carga las variables desde el archivo .env a process.env
process.loadEnvFile();

/// --- Configuración del Puerto ---

// Define el puerto para el servidor, usa el del entorno o 3600 por defecto
const port = process.env.PORT || 3600;

/// --- Arranque del Servidor ---

// Inicia el servidor y lo pone a escuchar en el puerto definido
app.listen(port, () => {
    console.log(`Servidor conectado en el puerto..... ${port}`);
    console.log(`Documentación disponible en http://localhost:${port}/api-docs`);
})