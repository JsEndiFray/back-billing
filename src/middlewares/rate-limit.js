import rateLimit from 'express-rate-limit';

/**
 * 🛡️ CONFIGURACIÓN DE RATE LIMITING
 *
 * ¿Qué es Rate Limiting?
 * - Técnica para limitar el número de requests por IP/usuario en un tiempo determinado
 * - Previene ataques de fuerza bruta, spam y abuso de API
 * - Protege recursos del servidor contra sobrecarga
 *
 * ¿Por qué usar diferentes limitadores?
 * - Rutas públicas: límites generosos para uso normal
 * - Rutas de autenticación: límites estrictos para prevenir ataques de contraseña
 *
 * Implementación: Usa express-rate-limit con almacenamiento en memoria
 * Nota: En producción considerar Redis para múltiples servidores
 */

// ==========================================
// 🌐 LIMITADOR GENERAL (Rutas normales)
// ==========================================

/**
 * 📊 Rate limiter para rutas generales de la aplicación
 *
 * Configuración:
 * - 100 peticiones por IP cada 15 minutos
 * - Ventana deslizante de 15 minutos
 * - Headers estándar para informar límites al cliente
 *
 * ¿Dónde aplicar?
 * - Rutas de API generales (GET, POST normales)
 * - Endpoints de consulta de datos
 * - Rutas que no son críticas para seguridad
 *
 * Ejemplo de uso:
 * app.use('/api/', generalLimiter);
 * router.get('/users', generalLimiter, getUsersController);
 */
export const generalLimiter = rateLimit({
    // ⏰ VENTANA DE TIEMPO
    // 15 minutos * 60 segundos * 1000 milisegundos = 900,000 ms
    windowMs: 15 * 60 * 1000,

    // 🔢 MÁXIMO DE REQUESTS POR VENTANA
    // 100 peticiones por IP en 15 minutos = ~6-7 requests por minuto
    // Suficiente para uso normal, restrictivo para abuso
    max: 100,

    // 📋 HEADERS DE RESPUESTA
    // Incluye headers RateLimit-* en las respuestas HTTP
    // Permite al cliente saber cuántas requests le quedan
    standardHeaders: true,

    // 🚫 DESHABILITAR HEADERS LEGACY
    // No incluir headers X-RateLimit-* (formato antiguo)
    legacyHeaders: false,

    // 🚨 HANDLER PERSONALIZADO PARA LÍMITE EXCEDIDO
    // Se ejecuta cuando una IP excede el límite de requests
    handler: (req, res) => {
        // 📝 LOG PARA MONITOREO
        console.log(`⚠️  Rate limit excedido para IP: ${req.ip}`);

        // 📤 RESPUESTA DE ERROR PERSONALIZADA
        // Formato JSON simple sin wrapper para mantener consistencia con otros errores
        return res.status(429).json('Demasiadas peticiones desde esta IP, por favor intente de nuevo después de 15 minutos');
    }
});

// ==========================================
// 🔐 LIMITADOR DE AUTENTICACIÓN (Seguridad)
// ==========================================

/**
 * 🛡️ Rate limiter estricto para rutas de autenticación
 *
 * ¿Por qué más restrictivo?
 * - Previene ataques de fuerza bruta contra contraseñas
 * - Protege contra enumeration de usuarios válidos
 * - Limita intentos de credential stuffing
 * - Reduce superficie de ataque en endpoints críticos
 *
 * Configuración:
 * - 20 peticiones por IP cada 1 hora
 * - Ventana de 1 hora para dar tiempo de "enfriamiento"
 * - Aplicable a login, registro, reset password
 *
 * ¿Dónde aplicar?
 * - POST /auth/login
 * - POST /auth/register
 * - POST /auth/forgot-password
 * - POST /auth/reset-password
 *
 * Ejemplo de uso:
 * router.post('/login', authLimiter, AuthController.login);
 */
export const authLimiter = rateLimit({
    // ⏰ VENTANA DE TIEMPO EXTENDIDA
    // 1 hora * 60 minutos * 60 segundos * 1000 ms = 3,600,000 ms
    // Ventana más larga para dar "tiempo de enfriamiento" tras múltiples intentos fallidos
    windowMs: 60 * 60 * 1000,

    // 🔢 LÍMITE ESTRICTO DE REQUESTS
    // 5 intentos por hora = suficiente para uso legítimo
    // Muy restrictivo para ataques automatizados
    // Un usuario normal no hace 5 logins por hora
    max: 5,

    // 📋 HEADERS DE INFORMACIÓN
    // Permite al frontend mostrar mensajes informativos al usuario
    // "Te quedan X intentos, próximo intento disponible en Y minutos"
    standardHeaders: true,

    // 🚫 DESHABILITAR HEADERS LEGACY
    legacyHeaders: false,

    // 🚨 HANDLER DE SEGURIDAD PARA LÍMITE EXCEDIDO
    // Respuesta específica para intentos de autenticación excesivos
    handler: (req, res) => {
        // 📝 LOG DE SEGURIDAD CRÍTICO
        // Este log debe ser monitoreado en producción
        console.log(`🔒 Límite de autenticación excedido para IP: ${req.ip} - Posible ataque de fuerza bruta`);

        // 📧 OPCIONAL: Alert a equipo de seguridad
        // await sendSecurityAlert(`Possible brute force from ${req.ip}`);

        // 📤 RESPUESTA DE SEGURIDAD
        // Mensaje claro sobre el límite temporal
        return res.status(429).json('Demasiados intentos de autenticación, por favor intente después de 1 hora');
    }
});

/*
==========================================
📊 ANÁLISIS DE CONFIGURACIÓN:
==========================================

🟢 GENERAL LIMITER (15 min / 100 req):
- Promedio: ~6.7 requests por minuto
- Burst permitido: Hasta 100 requests seguidas
- Recuperación: Completa cada 15 minutos
- Uso típico: Navegación normal, consultas API

🔴 AUTH LIMITER (1 hora / 20 req):
- Promedio: ~0.33 requests por minuto
- Burst permitido: Hasta 20 requests seguidas
- Recuperación: Completa cada hora
- Uso típico: Solo intentos de login legítimos

==========================================
🛡️ CASOS DE USO DE SEGURIDAD:
==========================================

✅ LEGÍTIMO - Usuario normal:
- Login fallido por error de tipeo: 1-3 intentos → ✅ Permitido
- Navegación normal: 50 requests/15min → ✅ Permitido
- Uso de API: 80 requests/15min → ✅ Permitido

🚨 SOSPECHOSO - Posible ataque:
- 21 intentos de login en 1 hora → ❌ Bloqueado por authLimiter
- 101 requests en 15 minutos → ❌ Bloqueado por generalLimiter
- Scripts automatizados → ❌ Bloqueados por ambos

==========================================
⚙️ OPTIMIZACIONES PARA PRODUCCIÓN:
==========================================

🔄 ALMACENAMIENTO DISTRIBUIDO:
// Para múltiples servidores, usar Redis:
const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'rl:',
});

📊 MÉTRICAS Y MONITOREO:
// Agregar métricas en el handler:
metrics.increment('rate_limit.exceeded', {
  limiter: 'auth',
  ip: req.ip
});

🎯 LÍMITES DINÁMICOS:
// Diferentes límites según tipo de usuario:
const dynamicLimit = (req) => {
  if (req.user?.role === 'admin') return 200;
  if (req.user?.isPremium) return 150;
  return 100;
};

🌍 WHITELIST DE IPs:
// Excluir IPs confiables del rate limiting:
const skip = (req) => {
  const trustedIPs = ['192.168.1.1', '10.0.0.1'];
  return trustedIPs.includes(req.ip);
};
*/