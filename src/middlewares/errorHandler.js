import {validationResult} from "express-validator";

/**
 * 🚨 MIDDLEWARE DE MANEJO DE ERRORES DE VALIDACIÓN
 *
 * ¿Qué hace este middleware?
 * - Intercepta errores de validación de express-validator
 * - Convierte errores técnicos en mensajes user-friendly
 * - Devuelve códigos HTTP específicos según el tipo de error
 * - Centraliza el manejo de errores para consistencia
 *
 * ¿Cuándo se ejecuta?
 * - Después de middlewares de validación (ej: validateOwners, validateClients)
 * - Antes de llegar al controller
 * - Solo si hay errores de validación
 *
 * Flujo típico:
 * Request → Validation Middleware → Error Handler → Controller (si no hay errores)
 *                                       ↓
 *                                   Error Response (si hay errores)
 *
 * Ejemplo de uso:
 * router.post('/users', validateUser, errorHandler, createUserController);
 */

// ==========================================
// 🗺️ MAPEOS DE ERRORES PERSONALIZADOS
// ==========================================

/**
 * 📝 Diccionario de mensajes de error específicos por campo
 *
 * ¿Por qué usar mapeos?
 * - Mensajes consistentes en toda la aplicación
 * - Fácil localización/traducción en el futuro
 * - Mensajes user-friendly vs errores técnicos
 * - Centralización de mensajes para mantenimiento
 *
 * Estructura: { nombreCampo: 'Mensaje para el usuario' }
 *
 * ¿Cómo agregar nuevos campos?
 * 1. Agregar entrada en ParamErrorMessages
 * 2. Agregar código HTTP correspondiente en ParamHttpCodes
 * 3. El errorHandler automáticamente los usará
 */
const ParamErrorMessages = {
    // 📧 VALIDACIONES DE CONTACTO
    'email': 'Email inválido',                    // Formato de email incorrecto
    'phone': 'Teléfono inválido',                // Formato de teléfono incorrecto

    // 👤 VALIDACIONES DE USUARIO
    'username': 'Nombre de usuario duplicado',    // Username ya existe en BD

    // 🆔 VALIDACIONES DE IDENTIFICACIÓN
    'nif': 'Identificación requerida',           // NIF/NIE/Pasaporte faltante o inválido

    // 🏢 VALIDACIONES DE CLIENTE
    'clientName': 'Nombre de cliente requerido', // Campo obligatorio faltante


    // 🏠 VALIDACIONES DE PROPIEDAD
    'referenceCadastral': 'Referencia catastral requerida',  // Campo específico inmobiliario
    'cadastral_reference': 'La referencia catastral no es válida según el algoritmo oficial español',
};

/**
 * 🔢 Diccionario de códigos HTTP específicos por tipo de error
 *
 * ¿Por qué códigos específicos?
 * - 400 (Bad Request): Datos mal formateados o faltantes
 * - 409 (Conflict): Recursos duplicados (username, email existente)
 * - 422 (Unprocessable Entity): Datos válidos pero lógicamente incorrectos
 * - Estándar HTTP para que frontend maneje errores apropiadamente
 *
 * Códigos comunes:
 * - 400: Validación general (formato, requeridos)
 * - 409: Duplicados/conflictos
 * - 422: Reglas de negocio violadas
 */
const ParamHttpCodes = {
    // 📧 ERRORES DE FORMATO (400 - Bad Request)
    'email': 400,                    // Email malformateado
    'phone': 400,                    // Teléfono malformateado
    'nif': 400,                      // NIF con formato incorrecto
    'clientName': 400,               // Campo requerido faltante
    'referenceCadastral': 400,       // Campo requerido faltante
    'cadastral_reference': 400,     // Campo requerido faltante

    // 🔄 ERRORES DE CONFLICTO (409 - Conflict)
    'username': 409                  // Username ya existe (conflicto con BD)
};

// ==========================================
// 🎛️ MIDDLEWARE PRINCIPAL
// ==========================================

/**
 * 🚨 Procesa errores de validación y devuelve respuestas consistentes
 *
 * Proceso de manejo:
 * 1. Obtiene errores de express-validator
 * 2. Si no hay errores: continúa al controller
 * 3. Si hay errores: busca mensajes personalizados
 * 4. Devuelve error específico o genérico al frontend
 *
 * @param {Object} req - Request object de Express
 * @param {Object} res - Response object de Express
 * @param {Function} next - Función para continuar al siguiente middleware
 *
 * @returns {Object} Error response con código HTTP y mensaje, o continúa con next()
 *
 * @example
 * // En rutas:
 * router.post('/users',
 *   validateUser,      // 1. Ejecuta validaciones
 *   errorHandler,      // 2. Maneja errores si los hay
 *   createController   // 3. Solo ejecuta si no hay errores
 * );
 */
const errorHandler = (req, res, next) => {

    // ==========================================
    // 📋 OBTENER RESULTADOS DE VALIDACIÓN
    // ==========================================

    // 🔍 EXTRAER ERRORES DE EXPRESS-VALIDATOR
    // validationResult() obtiene todos los errores acumulados por los
    // middlewares de validación ejecutados anteriormente en la cadena
    // Ejemplo: body('email').isEmail(), body('name').notEmpty(), etc.
    const errors = validationResult(req);

    // ✅ VERIFICAR SI HAY ERRORES
    if (!errors.isEmpty()) {

        // 📝 LOG PARA DEBUGGING Y AUDITORÍA
        // En development: ayuda al programador a ver qué validaciones fallaron
        // En production: logs para detectar patrones de errores de usuarios
        // 📦 OBTENER LISTA DE ERRORES EN FORMATO ARRAY
        // Cada error tiene estructura: { path, msg, value, location }
        // - path: nombre del campo que falló (ej: 'email', 'username')
        // - msg: mensaje de error del validador
        // - value: valor que envió el usuario
        // - location: dónde se encontró (body, query, params)
        const errorList = errors.array();

        // ==========================================
        // 🔍 BUSCAR ERRORES ESPECÍFICOS MAPEADOS
        // ==========================================

        // 🔄 ITERAR SOBRE TODOS LOS ERRORES ENCONTRADOS
        // Buscar si algún error corresponde a un campo que tenemos mapeado
        // con mensaje personalizado y código HTTP específico
        for (const error of errorList) {

            // 🎯 OBTENER NOMBRE DEL CAMPO QUE FALLÓ
            // error.path es la forma moderna, error.param es legacy
            // Ejemplo: si validamos body('email'), path será 'email'
            const paramName = error.path || error.param;

            // 🗺️ VERIFICAR SI TENEMOS MAPEO PERSONALIZADO
            if (ParamErrorMessages[paramName]) {

                // 📊 OBTENER CÓDIGO HTTP ESPECÍFICO
                // Si no está mapeado, usar 400 (Bad Request) como default
                const statusCode = ParamHttpCodes[paramName] || 400;

                // 📤 DEVOLVER ERROR PERSONALIZADO INMEDIATAMENTE
                // Primera coincidencia gana - no procesar más errores
                // Esto evita mensajes confusos con múltiples errores
                return res.status(statusCode).json(ParamErrorMessages[paramName]);
            }
        }

        // ✅ USAR MENSAJE ORIGINAL DEL VALIDATOR
        // Si no hay mapeo específico, usar el mensaje que creó express-validator
        const firstError = errorList[0];
        return res.status(400).json(firstError.msg);
    }

    // ==========================================
    // ✅ NO HAY ERRORES - CONTINUAR
    // ==========================================

    // ➡️ CONTINUAR AL SIGUIENTE MIDDLEWARE O CONTROLLER
    // Solo se ejecuta si validationResult() no encontró errores
    // El request llega "limpio" al controller
    next();
};

export default errorHandler;

/*
==========================================
💡 EJEMPLOS DE USO EN RUTAS:
==========================================

🔧 CONFIGURACIÓN BÁSICA:
import { body } from 'express-validator';
import errorHandler from './middleware/errorHandler.js';

router.post('/users',
  [
    body('email').isEmail(),           // 1. Validar email
    body('username').notEmpty(),       // 2. Validar username
    body('phone').isMobilePhone()      // 3. Validar teléfono
  ],
  errorHandler,                        // 4. Manejar errores
  createUserController                 // 5. Solo ejecuta si no hay errores
);

🎯 CASOS DE RESPUESTA:

✅ SIN ERRORES:
Request: { email: "juan@email.com", username: "juan123", phone: "666777888" }
→ Continúa al controller
→ Controller ejecuta normalmente

❌ EMAIL INVÁLIDO:
Request: { email: "email-malformateado", username: "juan123", phone: "666777888" }
→ Error en validación de email
→ errorHandler busca 'email' en ParamErrorMessages
→ Response: 400 "Email inválido"

❌ USERNAME DUPLICADO:
Request: { email: "juan@email.com", username: "admin", phone: "666777888" }
→ Error en validación de username (ya existe)
→ errorHandler busca 'username' en ParamErrorMessages
→ Response: 409 "Nombre de usuario duplicado"

❌ CAMPO NO MAPEADO:
Request: { email: "juan@email.com", age: "texto-en-lugar-de-numero" }
→ Error en validación de age (no está en mapeos)
→ Response: 400 "Error de validación"

==========================================
🔧 CÓMO EXTENDER PARA NUEVOS CAMPOS:
==========================================

📝 AGREGAR NUEVO CAMPO:
// 1. Agregar mensaje personalizado:
const ParamErrorMessages = {
  // ... campos existentes
  'password': 'La contraseña debe tener al menos 8 caracteres',
  'birthDate': 'Fecha de nacimiento inválida'
};

// 2. Agregar código HTTP:
const ParamHttpCodes = {
  // ... códigos existentes
  'password': 400,        // Bad Request para formato
  'birthDate': 422        // Unprocessable Entity para lógica
};

// 3. El errorHandler automáticamente los usará

🎨 PERSONALIZACIÓN DE RESPUESTAS:
// Para respuestas más complejas:
if (paramName === 'email') {
  return res.status(400).json({
    error: 'EMAIL_INVALID',
    message: 'Email inválido',
    suggestion: 'Usar formato: usuario@dominio.com'
  });
}

==========================================
🛡️ BENEFICIOS DE ESTE PATRÓN:
==========================================

✅ CONSISTENCIA:
- Todos los errores de validación usan el mismo formato
- Mensajes uniformes en toda la aplicación
- Códigos HTTP estándar y predecibles

✅ MANTENIBILIDAD:
- Un solo lugar para cambiar mensajes de error
- Fácil agregar nuevos campos validados
- Separación entre validación y presentación

✅ UX MEJORADA:
- Mensajes user-friendly vs errores técnicos
- Códigos HTTP que permiten manejo específico en frontend
- Un error a la vez (no abrumar al usuario)

✅ DEBUGGING:
- Logs detallados para desarrollo
- Información técnica separada de mensajes de usuario
- Trazabilidad completa de errores de validación
*/