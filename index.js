/**
 * @fileoverview Punto de entrada principal de la aplicación
 *
 * Archivo de inicialización que carga las variables de entorno,
 * importa la aplicación Express configurada y inicia el servidor
 * en el puerto especificado.
 *
 * @requires ./src/app.js
 * @author Tu Nombre
 * @since 1.0.0
 */

import app from './src/app.js';

/**
 * Carga las variables de entorno desde el archivo .env
 *
 * Utiliza el método nativo de Node.js para cargar automáticamente
 * las variables de entorno necesarias para la configuración.
 * Debe ejecutarse antes de usar process.env.VARIABLE
 */
process.loadEnvFile();

/**
 * Puerto en el que se ejecutará el servidor
 *
 * Utiliza la variable de entorno PORT o 3600 como puerto por defecto
 * si no está definida en el entorno. Esto permite flexibilidad
 * entre desarrollo local y despliegue en producción.
 *
 * @constant {number}
 * @default 3600
 *
 * @example
 * // En .env file:
 * // PORT=8080
 *
 * @example
 * // Si no hay .env, usa puerto por defecto:
 * // const port = 3600;
 */
const port = process.env.PORT || 3600;

/**
 * Inicia el servidor HTTP
 *
 * Pone la aplicación Express a escuchar en el puerto especificado
 * y muestra información de confirmación incluyendo la URL de la
 * documentación Swagger para facilitar el desarrollo.
 *
 * @function
 * @listens {number} port - Puerto en el que escucha el servidor
 *
 * @example
 * // Salida en consola cuando el servidor inicia correctamente:
 * // "Servidor conectado en el puerto..... 3600"
 * // "Documentación disponible en http://localhost:3600/api-docs"
 *
 * @example
 * // La aplicación estará disponible en:
 * // http://localhost:3600 (servidor principal)
 * // http://localhost:3600/api-docs (documentación Swagger)
 * // http://localhost:3600/api/* (endpoints de la API)
 *
 * @example
 * // Variables de entorno utilizadas:
 * // PORT - Puerto del servidor (opcional, default: 3600)
 * // DB_HOST - Host de la base de datos
 * // DB_USER - Usuario de la base de datos
 * // DB_PASSWORD - Contraseña de la base de datos
 * // DB_DATABASE - Nombre de la base de datos
 * // FRONTEND_URL - URL del frontend para CORS
 */
app.listen(port, () => {
    console.log(`Servidor conectado en el puerto..... ${port}`);
    console.log(`Documentación disponible en http://localhost:${port}/api-docs`);
})