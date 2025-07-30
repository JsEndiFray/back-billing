/**
 * @fileoverview Configuración de rate-limiting para la aplicación.
 * Previene el abuso y los ataques de fuerza bruta limitando las peticiones por IP.
 */
import rateLimit from 'express-rate-limit';

// --- Limitador General ---

// Límite de peticiones para rutas comunes de la API.


export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,       // Ventana de tiempo: 15 minutos
    max: 100,                       // Límite: 100 peticiones por IP en 15 minutos
    standardHeaders: true,          // Devuelve info del límite en los headers `RateLimit-*`
    legacyHeaders: false,           // Deshabilita los headers `X-RateLimit-*` (obsoletos)

    // Mensaje de error cuando se excede el límite
    handler: (req, res) => {
        res.status(429).json({message: 'Demasiadas peticiones, por favor intente de nuevo en 15 minutos.'});
    }
});

/// --- Limitador de Autenticación ---

/// Límite más estricto para rutas sensibles como login, registro, etc.

export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,       // Ventana de tiempo: 1 hora
    max: 25,                         // Límite: 5 peticiones por IP en 1 hora para prevenir fuerza bruta
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        // Es recomendable registrar este evento para monitorear posibles ataques
        return res.status(429).json('Demasiados intentos de autenticación, por favor intente después de 1 hora');
    }
});
/*
  NOTA SOBRE USO EN PRODUCCIÓN:
  - Para un entorno con múltiples servidores, se recomienda usar un almacenamiento
    externo como Redis (ej. 'rate-limit-redis') para compartir el estado
    del rate limit entre todas las instancias.
*/