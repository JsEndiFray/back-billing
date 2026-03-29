/**
 * @fileoverview Configuración de rate-limiting para la aplicación.
 * Previene el abuso y los ataques de fuerza bruta limitando las peticiones por IP.
 *
 * Para entornos con múltiples instancias, configurar REDIS_URL y descomentar
 * el bloque Redis a continuación para compartir el estado entre nodos.
 */
import rateLimit from 'express-rate-limit';

// ---------------------------------------------------------------------------
// Redis store (opcional) — descomentar cuando REDIS_URL esté disponible
// ---------------------------------------------------------------------------
// import { RedisStore } from 'rate-limit-redis';
// import { createClient } from 'redis';
//
// let redisStore;
// if (process.env.REDIS_URL) {
//     const redisClient = createClient({ url: process.env.REDIS_URL });
//     await redisClient.connect();
//     redisStore = new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) });
// }
// ---------------------------------------------------------------------------

// --- Limitador General ---

// Límite de peticiones para rutas comunes de la API.


export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,       // Ventana de tiempo: 15 minutos
    max: 100,                       // Límite: 100 peticiones por IP en 15 minutos
    standardHeaders: true,          // Devuelve info del límite en los headers `RateLimit-*`
    legacyHeaders: false,           // Deshabilita los headers `X-RateLimit-*` (obsoletos)
    // store: redisStore,           // Descomentar al habilitar Redis

    // Mensaje de error cuando se excede el límite
    handler: (req, res) => {
        res.status(429).json({message: 'Demasiadas peticiones, por favor intente de nuevo en 15 minutos.'});
    }
});

/// --- Limitador de Autenticación ---

/// Límite más estricto para rutas sensibles como login, registro, etc.

export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,       // Ventana de tiempo: 1 hora
    max: 25,                         // Límite: 25 peticiones por IP en 1 hora para prevenir fuerza bruta
    standardHeaders: true,
    legacyHeaders: false,
    // store: redisStore,            // Descomentar al habilitar Redis
    handler: (req, res) => {
        return res.status(429).json('Demasiados intentos de autenticación, por favor intente después de 1 hora');
    }
});