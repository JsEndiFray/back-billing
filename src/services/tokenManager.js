import jwt from 'jsonwebtoken';

/**
 * 🎫 GESTOR DE TOKENS JWT
 *
 * ¿Qué son los JWT (JSON Web Tokens)?
 * - Tokens estándar de la industria para autenticación/autorización
 * - Contienen información codificada y firmada digitalmente
 * - Stateless: el servidor no necesita almacenar sesiones
 * - Estructura: header.payload.signature (3 partes separadas por puntos)
 *
 * ¿Por qué usar dos tipos de tokens?
 * - Access Token: corta duración (15min) para requests normales
 * - Refresh Token: larga duración (7 días) solo para renovar access tokens
 * - Principio de seguridad: minimizar ventana de exposición
 *
 * Beneficios de esta implementación:
 * - Seguridad: tokens comprometidos expiran rápido
 * - UX: usuario no necesita reloguear cada 15 minutos
 * - Escalabilidad: sin estado en servidor
 * - Estándar: JWT es industria estándar
 */

// ==========================================
// 🎫 GENERACIÓN DE ACCESS TOKENS
// ==========================================

/**
 * 🔑 Genera un token de acceso de corta duración
 *
 * ¿Qué es un Access Token?
 * - Token principal para autorizar requests a la API
 * - Contiene información del usuario (id, username, role)
 * - Duración corta (15 minutos) por seguridad
 * - Se incluye en header Authorization de cada request
 *
 * ¿Cuándo se genera?
 * - Durante el login inicial
 * - Al renovar con refresh token (cada 13 minutos automáticamente)
 *
 * Estructura del payload:
 * {
 *   "id": 123,
 *   "username": "juan",
 *   "role": "admin",
 *   "iat": 1234567890,  // issued at (timestamp)
 *   "exp": 1234568790   // expires at (timestamp)
 * }
 *
 * @param {Object} user - Datos del usuario autenticado
 * @param {number|string} user.id - ID único del usuario en la base de datos
 * @param {string} user.username - Nombre de usuario único
 * @param {string} user.role - Rol del usuario (admin, user, moderator, etc.)
 *
 * @returns {string} Token JWT firmado válido por 15 minutos
 *
 * @example
 * const user = { id: 123, username: "juan", role: "admin" };
 * const token = generateAccessToken(user);
 * // Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIz..."
 */
export const generateAccessToken = (user) => {
    return jwt.sign(
        // 📦 PAYLOAD - Información que va dentro del token
        {
            id: user.id,           // 🆔 ID único del usuario (para queries a BD)
            username: user.username,  // 👤 Nombre de usuario (para logs/audit)
            role: user.role        // 🏷️ Rol/permisos (para autorización)
        },

        // 🔐 SECRET KEY - Clave secreta para firmar el token
        // CRÍTICO: Debe ser una clave fuerte y secreta en .env
        // Ejemplo: JWT_SECRET=mi-super-secreto-de-al-menos-32-caracteres
        process.env.JWT_SECRET,

        // ⚙️ OPCIONES DE CONFIGURACIÓN
        {
            // ⏰ TIEMPO DE EXPIRACIÓN
            // 15 minutos = Balance entre seguridad y usabilidad
            // - Muy corto: UX molesta (relogin frecuente)
            // - Muy largo: riesgo de seguridad si token es comprometido
            expiresIn: '15m'
        }
    );
};

// ==========================================
// 🔄 GENERACIÓN DE REFRESH TOKENS
// ==========================================

/**
 * 🔄 Genera un token de renovación de larga duración
 *
 * ¿Qué es un Refresh Token?
 * - Token especial SOLO para renovar access tokens
 * - Duración larga (7 días) para evitar relogins frecuentes
 * - Contiene mínima información (solo ID) por seguridad
 * - NUNCA se usa para autorizar requests normales
 *
 * ¿Cuándo se usa?
 * - El frontend lo envía automáticamente cuando access token expira
 * - Solo al endpoint /auth/refresh-token
 * - Usuario nunca lo ve ni lo maneja manualmente
 *
 * ¿Por qué menos información?
 * - Principio de menor privilegio
 * - Si es comprometido, menos información expuesta
 * - Solo necesita ID para buscar usuario actual en BD
 *
 * Estructura del payload:
 * {
 *   "id": 123,
 *   "iat": 1234567890,  // issued at
 *   "exp": 1235172690   // expires at (+7 días)
 * }
 *
 * @param {Object} user - Datos del usuario autenticado
 * @param {number|string} user.id - ID único del usuario (único campo requerido)
 *
 * @returns {string} Refresh token JWT válido por 7 días
 *
 * @example
 * const user = { id: 123, username: "juan", role: "admin" };
 * const refreshToken = generateRefreshToken(user);
 * // Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIz..."
 */
export const generateRefreshToken = (user) => {
    return jwt.sign(
        // 📦 PAYLOAD MÍNIMO - Solo información esencial
        {
            id: user.id  // 🆔 Solo ID del usuario por seguridad
            // ❌ NO incluir username, role, email por seguridad
            // ❌ Si refresh token es comprometido, mínima info expuesta
        },

        // 🔐 SECRET KEY ESPECÍFICO PARA REFRESH
        process.env.JWT_REFRESH_SECRET,

        // ⚙️ OPCIONES DE CONFIGURACIÓN
        {
            // ⏰ TIEMPO DE EXPIRACIÓN EXTENDIDO
            // 7 días = Balance entre seguridad y UX
            // - Usuario no necesita reloguear por una semana
            // - Ventana de compromiso limitada vs sesiones permanentes
            // - Después de 7 días, login requerido (normal)
            expiresIn: '7d'
        }
    );
};

// ==========================================
// 🔍 VERIFICACIÓN DE TOKENS
// ==========================================

/**
 * 🔍 Verifica la validez y decodifica un token JWT
 *
 * ¿Qué verifica?
 * - Firma digital: que el token no haya sido alterado
 * - Expiración: que el token no haya vencido
 * - Formato: que sea un JWT válido
 * - Secret: que haya sido firmado con la clave correcta
 *
 * ¿Cuándo se usa?
 * - En middleware de autenticación (auth.js)
 * - Al renovar tokens (refresh endpoint)
 * - En cualquier endpoint que requiera autorización
 *
 * ¿Qué retorna?
 * - Si válido: objeto con datos decodificados del payload
 * - Si inválido: null (por cualquier razón)
 *
 * Casos de invalidez:
 * - Token expirado (exp < now)
 * - Token alterado (firma no coincide)
 * - Token malformado (no es JWT válido)
 * - Secret incorrecto (no firmado con nuestra clave)
 *
 * @param {string} token - Token JWT a verificar
 * @param {string} secret - Clave secreta para verificar la firma
 *
 * @returns {Object|null} Payload decodificado si válido, null si inválido
 *
 * @example
 * // Token válido:
 * const decoded = verifyToken(accessToken, process.env.JWT_SECRET);
 * console.log(decoded);
 * // { id: 123, username: "juan", role: "admin", iat: 1234567890, exp: 1234568790 }
 *
 * // Token inválido:
 * const invalid = verifyToken(expiredToken, process.env.JWT_SECRET);
 * console.log(invalid); // null
 */
export const verifyToken = (token, secret) => {
    try {
        // 🔍 VERIFICACIÓN COMPLETA CON JWT
        // jwt.verify() realiza todas las validaciones automáticamente:
        // - Estructura del token (3 partes separadas por puntos)
        // - Decodificación del header y payload
        // - Verificación de la firma con la clave secreta
        // - Verificación de expiración automática
        // - Validación de timestamps (iat, exp)
        return jwt.verify(token, secret);

    } catch (error) {
        // 🚨 MANEJO DE ERRORES DE VERIFICACIÓN
        // Diferentes tipos de errores posibles:
        // - TokenExpiredError: token expirado
        // - JsonWebTokenError: token malformado o firma inválida
        // - NotBeforeError: token usado antes de tiempo (nbf claim)

        // 📝 LOG PARA DEBUGGING Y AUDITORÍA
        // En producción, estos logs ayudan a detectar:
        // - Intentos de uso de tokens alterados (ataques)
        // - Problemas de sincronización de tiempo
        // - Configuración incorrecta de secrets
        console.error("Error al verificar token:", error.message);

        // 🔒 RETORNO SEGURO
        // Independientemente del tipo de error, siempre retornar null
        // Esto evita filtrar información sobre por qué falló la verificación
        // (principio de fail-secure)
        return null;
    }
};

/*
==========================================
🔐 CONSIDERACIONES DE SEGURIDAD:
==========================================

🔑 SECRETOS JWT:
- JWT_SECRET: Mínimo 256 bits (32 caracteres) de entropía alta
- JWT_REFRESH_SECRET: Diferente a JWT_SECRET para seguridad por capas
- Rotar secretos periódicamente en producción
- Nunca commitear secretos en código fuente

⏰ TIEMPOS DE EXPIRACIÓN:
- Access Token (15min): Balance seguridad/UX
- Refresh Token (7 días): Después requiere relogin
- Considera contexto: apps bancarias más corto, apps sociales más largo

📊 INFORMACIÓN EN TOKENS:
- Access Token: información necesaria para autorización
- Refresh Token: mínima información posible
- NUNCA incluir: passwords, información sensible, PII innecesaria

🛡️ VALIDACIÓN ROBUSTA:
- Siempre verificar expiración
- Validar firma en cada uso
- Manejar errores gracefully
- Logs para detectar ataques

==========================================
⚙️ FLUJO COMPLETO DE TOKENS:
==========================================

🔑 GENERACIÓN (LOGIN):
1. Usuario hace login con credenciales
2. Backend valida credenciales
3. generateAccessToken(user) → token 15min
4. generateRefreshToken(user) → token 7 días
5. Frontend guarda ambos tokens

🎫 USO NORMAL (REQUESTS):
1. Frontend envía access token en header
2. Backend usa verifyToken(accessToken, JWT_SECRET)
3. Si válido: procesar request
4. Si inválido: error 401

🔄 RENOVACIÓN (AUTOMÁTICA):
1. Access token expira (15min)
2. Frontend detecta error 401
3. Frontend envía refresh token automáticamente
4. Backend usa verifyToken(refreshToken, JWT_REFRESH_SECRET)
5. Si válido: generateAccessToken() nuevo
6. Frontend recibe nuevo access token
7. Frontend reintenta request original

🚪 EXPIRACIÓN COMPLETA (7 DÍAS):
1. Refresh token expira
2. Backend rechaza renovación
3. Frontend ejecuta logout automático
4. Usuario debe hacer login nuevamente
*/