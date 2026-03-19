import { verifyToken } from "../services/tokenManager.js";

/**
 * 🛡️ MIDDLEWARE DE AUTENTICACIÓN
 *
 * ¿Qué es un middleware?
 * - Función que se ejecuta ENTRE el request y el controller
 * - Intercepta todos los requests a rutas protegidas
 * - Decide si permitir o rechazar el acceso
 * - Puede modificar req/res antes de llegar al controller
 *
 * ¿Qué hace este middleware?
 * - Extrae token del header Authorization
 * - Verifica que el token sea válido y no haya expirado
 * - Decodifica información del usuario del token
 * - Permite acceso a rutas protegidas SI el token es válido
 * - Bloquea acceso y devuelve error 401 SI el token es inválido
 *
 * ¿Cómo se usa?
 * router.get('/protected-route', auth, controllerFunction);
 * router.post('/users', auth, createUserController);
 *
 * Flujo típico:
 * Request → auth middleware → verifyToken → controller → response
 *
 * @param {Object} req - Request object de Express
 * @param {Object} req.headers - Headers HTTP del request
 * @param {string} req.headers.authorization - Header con formato "Bearer token"
 * @param {Object} res - Response object de Express
 * @param {Function} next - Función para continuar al siguiente middleware/controller
 */
export default function auth(req, res, next) {

    // ==========================================
    // 📦 EXTRACCIÓN DEL TOKEN
    // ==========================================

    // 🔍 EXTRAER TOKEN DEL HEADER AUTHORIZATION
    // Formato esperado: "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    // - split(' ') divide "Bearer token" en ["Bearer", "token"]
    // - [1] toma la segunda parte (el token real)
    // - ?. es optional chaining por si authorization no existe
    const token = req.headers.authorization?.split(' ')[1];

    // ✅ VALIDAR PRESENCIA DEL TOKEN
    if (!token) {
        // 🚨 NO HAY TOKEN - REQUEST NO AUTORIZADO
        // Casos comunes:
        // - Header Authorization faltante
        // - Header mal formateado (sin "Bearer ")
        // - Frontend no envió token (bug o usuario no logueado)
        return res.status(401).json('No autorizado. Token requerido.');
    }

    // ==========================================
    // 🔍 VERIFICACIÓN DEL TOKEN
    // ==========================================

    // 🔐 VERIFICAR TOKEN CON TOKENMANAGER
    // verifyToken() maneja internamente:
    // - Verificación de firma digital
    // - Validación de expiración
    // - Decodificación del payload
    // - Manejo de errores (retorna null si algo falla)
    const decoded = verifyToken(token, process.env.JWT_SECRET);

    // 🔍 VALIDAR RESULTADO DE VERIFICACIÓN
    if (!decoded) {
        // 🚨 TOKEN INVÁLIDO - ACCESO DENEGADO
        // Razones posibles para decoded = null:
        // - Token expirado (más de 15 minutos)
        // - Token alterado/corrupto
        // - Token firmado con secret diferente
        // - Token malformado (no es JWT válido)
        // - Error en el proceso de verificación
        return res.status(401).json('La sesion se ha expirado.');
    }

    // ==========================================
    // ✅ TOKEN VÁLIDO - PERMITIR ACCESO
    // ==========================================

    // 👤 AGREGAR INFORMACIÓN DEL USUARIO AL REQUEST
    // El payload decodificado contiene: { id, username, role, iat, exp }
    // Esto permite que los controllers accedan a información del usuario autenticado
    // sin necesidad de volver a verificar el token
    req.user = decoded;

    // 📝 INFORMACIÓN DISPONIBLE EN CONTROLLERS:
    // req.user.id       → ID del usuario (para queries a BD)
    // req.user.username → Nombre de usuario (para logs)
    // req.user.role     → Rol del usuario (para autorización)
    // req.user.iat      → Timestamp de emisión del token
    // req.user.exp      → Timestamp de expiración del token

    // ➡️ CONTINUAR AL SIGUIENTE MIDDLEWARE O CONTROLLER
    // next() le dice a Express que continúe con el siguiente middleware
    // o que ejecute el controller si este es el último middleware
    next();
}

/*
==========================================
🎯 EJEMPLOS DE USO EN RUTAS:
==========================================

🔓 RUTAS PÚBLICAS (sin auth):
router.post('/auth/login', AuthController.login);
router.post('/auth/register', AuthController.register);
router.get('/health', healthCheckController);

🔒 RUTAS PROTEGIDAS (con auth):
router.get('/users', auth, UserController.getAllUsers);
router.post('/orders', auth, OrderController.createOrder);
router.delete('/admin/users/:id', auth, role(['admin']), UserController.deleteUser);

==========================================
💡 FLUJO COMPLETO DE AUTENTICACIÓN:
==========================================

📱 FRONTEND (Angular):
1. Usuario hace login → recibe access token
2. Interceptor añade token a TODOS los requests:
   headers: { Authorization: `Bearer ${token}` }

🛡️ BACKEND (Este middleware):
1. Recibe request con header Authorization
2. Extrae token del header
3. Verifica token con JWT
4. Si válido: agrega req.user y continúa
5. Si inválido: retorna error 401

🎮 CONTROLLER:
1. Recibe request con req.user ya poblado
2. Puede usar req.user.id para consultas
3. Puede usar req.user.role para permisos
4. No necesita verificar token nuevamente

==========================================
🚨 CASOS DE ERROR Y RESPUESTAS:
==========================================

❌ NO HAY HEADER AUTHORIZATION:
Request: GET /api/users
Headers: {} (sin Authorization)
Response: 401 "No autorizado. Token requerido."

❌ HEADER MAL FORMATEADO:
Request: GET /api/users
Headers: { Authorization: "mi-token-sin-bearer" }
Response: 401 "No autorizado. Token requerido."

❌ TOKEN EXPIRADO:
Request: GET /api/users
Headers: { Authorization: "Bearer token-de-hace-20-minutos" }
Response: 401 "Token inválido o expirado."

❌ TOKEN ALTERADO:
Request: GET /api/users
Headers: { Authorization: "Bearer token-modificado-maliciosamente" }
Response: 401 "Token inválido o expirado."

✅ TOKEN VÁLIDO:
Request: GET /api/users
Headers: { Authorization: "Bearer token-valido-y-actual" }
Response: 200 + datos de usuarios
req.user: { id: 123, username: "juan", role: "admin" }

==========================================
🔧 PERSONALIZACIONES OPCIONALES:
==========================================

📊 AGREGAR LOGS DE AUDITORÍA:
console.log(`🔍 Token verificado para usuario: ${decoded.username}`);
console.log(`📅 Token expira en: ${new Date(decoded.exp * 1000)}`);

⚠️  VALIDACIONES ADICIONALES:
// Verificar que el usuario aún existe en BD:
const user = await getUserById(decoded.id);
if (!user) {
  return res.status(401).json('Usuario no encontrado');
}

// Verificar estado del usuario:
if (user.status === 'banned') {
  return res.status(403).json('Usuario suspendido');
}

🎯 AUTORIZACIÓN POR ROLES:
// Combinar con middleware de roles:
router.delete('/admin/*', auth, requireRole(['admin']), controller);

📈 MÉTRICAS Y MONITOREO:
// Trackear uso de tokens:
metrics.increment('auth.token.verified');
metrics.increment('auth.token.invalid');

🔄 REFRESH AUTOMÁTICO:
// Detectar tokens próximos a expirar:
const timeUntilExpiry = decoded.exp - (Date.now() / 1000);
if (timeUntilExpiry < 300) { // menos de 5 minutos
  res.setHeader('X-Token-Refresh-Required', 'true');
}
*/