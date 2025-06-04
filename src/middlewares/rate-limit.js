import rateLimit from 'express-rate-limit';

//Limiter para rutas generales
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, //15 minutos
    max: 100, //Limita cada IP a 100 peticiones por ventana
    standardHeaders: true, //Devuelve info de rate limit en los headers `RateLimit-*`
    legacyHeaders: false, //Deshabilita los headers `X-RateLimit-*`
    handler: (req, res) => {
        // Respuesta directa sin objeto wrapper
        return res.status(429).json('Demasiadas peticiones desde esta IP, por favor intente de nuevo después de 15 minutos');
    }
});

//Limiter más estricto para rutas de autenticación (login, registro)
export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, //1 hora
    max: 5, //5 intentos por hora
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        return res.status(429).json('Demasiados intentos de autenticación, por favor intente después de 1 hora');
    }
});