import UserService from "../services/usersServices.js";

/**
 * 🔐 CONTROLADOR DE AUTENTICACIÓN
 *
 * Arquitectura: Controller → Service → Repository Pattern
 * - Controller: Maneja HTTP requests/responses y validaciones básicas
 * - Service: Contiene la lógica de negocio (UserService)
 * - Repository: Interactúa con la base de datos
 *
 * Responsabilidades del Controller:
 * - Validar datos de entrada (request body)
 * - Manejar códigos de estado HTTP
 * - Delegar lógica compleja al Service
 * - Formatear respuestas para el frontend
 *
 * Endpoints implementados:
 * - POST /auth/login → Autenticación de usuarios
 * - POST /auth/refresh-token → Renovación automática de tokens
 */
export default class AuthController {

    // ==========================================
    // 🔑 AUTENTICACIÓN DE USUARIOS
    // ==========================================

    /**
     * 🚪 Maneja el login de usuarios
     *
     * Flujo del proceso:
     * 1. Extrae credenciales del request body
     * 2. Valida que username y password estén presentes
     * 3. Delega autenticación al UserService
     * 4. Formatea y envía respuesta al frontend
     *
     * @route POST /auth/login
     * @access Public
     * @middleware authLimiter (20 intentos por hora)
     *
     * @param {Object} req - Request object de Express
     * @param {Object} req.body - Cuerpo de la petición
     * @param {string} req.body.username - Nombre de usuario
     * @param {string} req.body.password - Contraseña en texto plano
     * @param {Object} res - Response object de Express
     *
     * @returns {Object} 200 - Login exitoso con tokens y datos de usuario
     * @returns {Object} 400 - Datos faltantes (username o password)
     * @returns {Object} 401 - Credenciales inválidas
     * @returns {Object} 429 - Demasiados intentos (rate limiting)
     * @returns {Object} 500 - Error interno (manejado en UserService)
     */
    static async login(req, res) {
        // 📦 EXTRAER CREDENCIALES DEL REQUEST BODY
        // Desestructuración para obtener username y password del JSON enviado
        const { username, password } = req.body;

        // ✅ VALIDACIÓN BÁSICA DE CAMPOS REQUERIDOS
        // Verificar que ambos campos estén presentes y no sean strings vacíos
        if (!username || !password) {
            // 🚨 BAD REQUEST - Faltan datos obligatorios
            // Respuesta inmediata sin procesar en el service
            return res.status(400).json("Usuario y contraseña requeridos");
        }

        // 🔄 DELEGAR AUTENTICACIÓN AL SERVICE
        // UserService.login() maneja:
        // - Búsqueda del usuario en BD
        // - Verificación de contraseña con bcrypt
        // - Generación de access token (15min) y refresh token (7 días)
        // - Retorna objeto con user + tokens o null si falla
        const result = await UserService.login(username, password);

        // 🔍 VERIFICAR RESULTADO DE LA AUTENTICACIÓN
        if (!result) {
            // 🚨 UNAUTHORIZED - Credenciales incorrectas
            // UserService devuelve null cuando:
            // - Usuario no existe
            // - Contraseña incorrecta
            // - Usuario inactivo/bloqueado
            return res.status(401).json("Credenciales inválidas");
        }

        // ✅ LOGIN EXITOSO - FORMATEAR RESPUESTA
        // Estructura estándar que espera el frontend Angular:
        // - user: datos del usuario (sin password)
        // - accessToken: JWT para autorización (expira en 15min)
        // - refreshToken: JWT para renovación (expira en 7 días)
        return res.status(200).json({
            user: result.user,           // 👤 Datos del usuario (id, username, email, role)
            accessToken: result.accessToken,    // 🎫 Token de acceso inmediato
            refreshToken: result.refreshToken   // 🔄 Token para renovaciones futuras
        });
    }

    // ==========================================
    // 🔄 RENOVACIÓN AUTOMÁTICA DE TOKENS
    // ==========================================

    /**
     * 🔄 Renueva access token usando refresh token
     *
     * ¿Cuándo se ejecuta?
     * - Automáticamente cada 13 minutos por el timer del frontend
     * - Cuando el interceptor detecta error 401 (token expirado)
     * - El usuario NUNCA llama esto manualmente
     *
     * Flujo del proceso:
     * 1. Extrae refresh token del request body
     * 2. Valida que el refresh token esté presente
     * 3. Delega renovación al UserService
     * 4. Devuelve nuevo access token al frontend
     *
     * @route POST /auth/refresh-token
     * @access Private (requiere refresh token válido)
     * @middleware generalLimiter (100 requests por 15 min)
     *
     * @param {Object} req - Request object de Express
     * @param {Object} req.body - Cuerpo de la petición
     * @param {string} req.body.refreshToken - Refresh token válido (dura 7 días)
     * @param {Object} res - Response object de Express
     *
     * @returns {Object} 200 - Nuevo access token generado exitosamente
     * @returns {Object} 400 - Refresh token faltante
     * @returns {Object} 401 - Refresh token inválido, expirado o usuario no existe
     * @returns {Object} 500 - Error interno (manejado en UserService)
     */
    static async refreshToken(req, res) {
        // 📦 EXTRAER REFRESH TOKEN DEL REQUEST BODY
        // El frontend Angular envía: { refreshToken: "eyJhbGciOiJIUzI1NiIs..." }
        const { refreshToken } = req.body;

        // ✅ VALIDACIÓN BÁSICA DEL REFRESH TOKEN
        // Verificar que el refresh token esté presente en el request
        if (!refreshToken) {
            // 🚨 BAD REQUEST - Falta el refresh token
            // Esto no debería pasar si el frontend está bien implementado
            return res.status(400).json("Token de actualización requerido");
        }

        // 🔄 DELEGAR RENOVACIÓN AL SERVICE
        // UserService.refreshToken() maneja:
        // - Verificación del refresh token con JWT
        // - Validación de expiración (7 días)
        // - Búsqueda del usuario en BD por ID del token
        // - Generación de nuevo access token
        // - Retorna objeto con tokens o null si falla
        const tokens = await UserService.refreshToken(refreshToken);

        // 🔍 VERIFICAR RESULTADO DE LA RENOVACIÓN
        if (!tokens) {
            // 🚨 UNAUTHORIZED - Renovación fallida
            // UserService devuelve null cuando:
            // - Refresh token expirado (después de 7 días)
            // - Refresh token inválido/corrupto
            // - Usuario asociado no existe (cuenta eliminada)
            // - Error de verificación JWT
            return res.status(401).json("Token expirado o inválido");
        }

        // ✅ RENOVACIÓN EXITOSA - DEVOLVER NUEVOS TOKENS
        // Estructura que espera el frontend Angular:
        // - accessToken: nuevo JWT de acceso (expira en 15min)
        // - refreshToken: puede ser el mismo o uno nuevo (según implementación)
        return res.status(200).json({
            accessToken: tokens.accessToken,    // 🆕 Nuevo token de acceso
            refreshToken: tokens.refreshToken   // 🔄 Token de renovación (igual o nuevo)
        });
    }
}

/*
==========================================
🎯 PATRONES DE DISEÑO IMPLEMENTADOS:
==========================================

📋 CONTROLLER-SERVICE-REPOSITORY PATTERN:
- AuthController: Maneja HTTP, validaciones básicas, formateo de respuestas
- UserService: Lógica de negocio, autenticación, generación de tokens
- Repository: Acceso a datos (BD), queries, persistencia

✅ VENTAJAS DE ESTA ARQUITECTURA:
- Separación clara de responsabilidades
- Controller simple y enfocado en HTTP
- Service reutilizable (puede usarse desde otros controllers)
- Fácil testing unitario de cada capa
- Fácil mantenimiento y escalabilidad

🔄 FLUJO TÍPICO DE UNA PETICIÓN:
1. Frontend → AuthController.login()
2. AuthController → UserService.login()
3. UserService → UserRepository.findByUsername()
4. UserRepository → Base de datos
5. Base de datos → UserRepository (resultados)
6. UserRepository → UserService (datos)
7. UserService → AuthController (result + tokens)
8. AuthController → Frontend (formatted response)

==========================================
🚨 PUNTOS DE MEJORA OPCIONALES:
==========================================

📝 LOGS DE AUDITORÍA:
// Agregar en cada método exitoso:
console.log(`✅ Login exitoso para: ${username}`);
console.log(`🔄 Token renovado para usuario ID: ${userId}`);

⚠️  VALIDACIONES ADICIONALES:
// En login():
if (typeof username !== 'string' || username.length < 3) {
  return res.status(400).json("Username debe tener al menos 3 caracteres");
}

🔧 MANEJO DE ERRORES MÁS ESPECÍFICO:
// Diferenciar entre tipos de error del service:
if (result.error === 'USER_NOT_FOUND') {
  return res.status(401).json("Usuario no encontrado");
} else if (result.error === 'INVALID_PASSWORD') {
  return res.status(401).json("Contraseña incorrecta");
}

📊 MÉTRICAS Y MONITOREO:
// Agregar tracking de intentos de login:
metrics.increment('auth.login.attempts');
metrics.increment('auth.login.success');
metrics.increment('auth.refresh.requests');
*/