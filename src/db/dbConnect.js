/**
 * @fileoverview Configuración y conexión a base de datos MySQL
 *
 * Maneja la conexión a MySQL usando mysql2 con pool de conexiones para optimizar
 * el rendimiento y la gestión de recursos. Incluye verificación automática de conexión
 * al inicializar la aplicación.
 *
 * @requires mysql2/promise
 * @author Tu Nombre
 * @since 1.0.0
 */

import mysql2 from 'mysql2/promise';

/**
 * Carga las variables de entorno desde el archivo .env
 *
 * Utiliza el método nativo de Node.js para cargar automáticamente
 * las variables de entorno necesarias para la configuración de la BD.
 */
process.loadEnvFile();

/**
 * Pool de conexiones MySQL configurado con variables de entorno
 *
 * Utiliza un pool de conexiones para mejorar el rendimiento y gestionar
 * eficientemente las conexiones a la base de datos. La configuración permite
 * hasta 10 conexiones simultáneas con keep-alive habilitado.
 *
 * @constant {mysql2.Pool}
 *
 * @example
 * // Realizar una consulta usando el pool
 * const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
 *
 * @example
 * // Obtener una conexión específica del pool
 * const connection = await db.getConnection();
 * try {
 *   await connection.execute('START TRANSACTION');
 *   // ... operaciones de transacción
 *   await connection.execute('COMMIT');
 * } finally {
 *   connection.release();
 * }
 */
const db = mysql2.createPool({
    /** @type {string} Host del servidor MySQL (desde variable de entorno) */
    host: process.env.DB_HOST,

    /** @type {string} Usuario de la base de datos (desde variable de entorno) */
    user: process.env.DB_USER,

    /** @type {string} Contraseña del usuario (desde variable de entorno) */
    password: process.env.DB_PASSWORD,

    /** @type {number} Puerto de conexión (por defecto 3306 si no se especifica) */
    port: process.env.DB_PORT || 3306,

    /** @type {string} Nombre de la base de datos (desde variable de entorno) */
    database: process.env.DB_DATABASE,

    /** @type {boolean} Esperar por conexiones disponibles cuando el pool esté lleno */
    waitForConnections: true,

    /** @type {number} Máximo número de conexiones simultáneas en el pool */
    connectionLimit: 10,

    /** @type {number} Máximo número de peticiones en cola (0 = ilimitado) */
    queueLimit: 0,

    /** @type {boolean} Mantener conexiones activas para evitar timeouts */
    enableKeepAlive: true,

    /** @type {number} Delay inicial para el mecanismo keep-alive (0 = inmediato) */
    keepAliveInitialDelay: 0
});

/**
 * Verifica la conexión a la base de datos MySQL
 *
 * Realiza una prueba de conexión al inicializar la aplicación para
 * asegurar que la configuración es correcta y la base de datos está
 * disponible. Termina el proceso si la conexión falla.
 *
 * @async
 * @function check
 * @returns {Promise<void>} Promesa que se resuelve si la conexión es exitosa
 * @throws {Error} Termina el proceso con código 1 si falla la conexión
 *
 * @example
 * // La función se ejecuta automáticamente al importar el módulo
 * // No es necesario llamarla manualmente
 *
 * // Salida en consola si es exitoso:
 * // "Conectado correctamente a MYSQL"
 *
 * // Si falla, muestra el error y termina la aplicación
 */
const check = async () => {
    try {
        // Obtiene una conexión del pool para probar
        const connection = await db.getConnection();
        console.log('Conectado correctamente a MYSQL');

        // Libera la conexión de vuelta al pool
        connection.release();
    } catch (error) {
        console.error('Error de conexión:', error.message);

        // Termina la aplicación si no puede conectar a la DB
        // Esto previene que la app funcione sin base de datos
        process.exit(1);
    }
};

// Ejecuta la verificación de conexión al cargar el módulo
check();

/**
 * Pool de conexiones MySQL exportado para uso en toda la aplicación
 *
 * @module dbConnect
 * @default db
 *
 * @example
 * // Importar en otros archivos
 * import db from './dbConnect.js';
 *
 * @example
 * // Usar en controladores
 * const [users] = await db.execute('SELECT * FROM users');
 */
export default db;