/**
 * 🔐 MIDDLEWARE DE AUTORIZACIÓN POR ROLES
 *
 * ¿Qué es la autorización?
 * - Autenticación: "¿Quién eres?" (ya manejada por auth.js)
 * - Autorización: "¿Qué puedes hacer?" (manejada por este middleware)
 *
 * ¿Cómo funciona?
 * - Recibe lista de roles permitidos para una ruta
 * - Verifica que el usuario autenticado tenga uno de esos roles
 * - Permite acceso si el rol coincide
 * - Bloquea acceso con error 403 si no tiene permisos
 *
 * Diferencia con auth.js:
 * - auth.js: Verifica que el usuario esté logueado (token válido)
 * - role.js: Verifica que el usuario tenga permisos específicos
 *
 * Orden de ejecución:
 * Request → auth middleware → role middleware → controller
 *
 * ¿Cuándo se usa?
 * - Rutas administrativas (solo admin)
 * - Funciones específicas por rol (moderador, editor, etc.)
 * - APIs con diferentes niveles de acceso
 *
 * @param {Array<string>} roles - Lista de roles permitidos para la ruta
 * @returns {Function} Middleware function para Express
 *
 * @example
 * // Solo administradores:
 * router.delete('/users/:id', auth, role(['admin']), deleteUserController);
 *
 * // Admin o moderador:
 * router.post('/moderate', auth, role(['admin', 'moderator']), moderateController);
 *
 * // Múltiples roles:
 * router.get('/reports', auth, role(['admin', 'manager', 'analyst']), getReportsController);
 */
export default function role(roles = []) {

    // ==========================================
    // 🏭 FACTORY FUNCTION - GENERA MIDDLEWARE
    // ==========================================

    // 🔧 RETORNAR FUNCIÓN MIDDLEWARE PERSONALIZADA
    // Este patrón se llama "middleware factory" o "higher-order function"
    // - role() es la factory que configura qué roles están permitidos
    // - La función retornada es el middleware real que Express ejecuta
    // 
    // ¿Por qué este patrón?
    // - Permite parametrizar el middleware (diferentes roles por ruta)
    // - Reutilizable para múltiples rutas con diferentes permisos
    // - Mantiene configuración (roles) encapsulada en closure
    return (req, res, next) => {

        // ==========================================
        // 👤 VERIFICACIÓN DE USUARIO AUTENTICADO
        // ==========================================

        // 🔍 VERIFICAR QUE EL USUARIO ESTÉ AUTENTICADO
        // req.user es poblado por el middleware auth.js que debe ejecutarse ANTES
        // Si req.user no existe, significa que:
        // - El middleware auth.js no se ejecutó (configuración incorrecta)
        // - El token JWT era inválido/expirado
        // - El usuario no está logueado
        if (!req.user || !roles.includes(req.user.role)) {

            // 🚨 ERROR 403 - FORBIDDEN (ACCESO DENEGADO)
            // Diferencias importantes entre códigos HTTP:
            // - 401 Unauthorized: "No estás autenticado" (no hay token válido)
            // - 403 Forbidden: "Estás autenticado pero no tienes permisos"
            // 
            // Casos que llegan aquí:
            // 1. req.user no existe (auth.js no ejecutado o falló)
            // 2. req.user.role no está en la lista de roles permitidos
            // 3. req.user.role es null/undefined
            return res.status(403).json('No tienes permisos para realizar esta acción.');
        }

        // ==========================================
        // ✅ AUTORIZACIÓN EXITOSA
        // ==========================================

        // ➡️ CONTINUAR AL SIGUIENTE MIDDLEWARE O CONTROLLER
        // Solo se ejecuta si:
        // - req.user existe (usuario autenticado)
        // - req.user.role está incluido en la lista de roles permitidos
        // El controller puede ejecutarse sabiendo que el usuario tiene permisos
        next();
    }
}

/*
==========================================
🎯 EJEMPLOS DE USO PRÁCTICOS:
==========================================

🔧 CONFIGURACIÓN EN RUTAS:

// 👑 SOLO ADMINISTRADORES:
router.delete('/users/:id', 
  auth,                    // 1. Verificar que esté logueado
  role(['admin']),         // 2. Verificar que sea admin
  deleteUserController     // 3. Ejecutar si pasa ambas verificaciones
);

// 🛡️ ADMIN O MODERADOR:
router.post('/ban-user',
  auth,
  role(['admin', 'moderator']),
  banUserController
);

// 👥 MÚLTIPLES ROLES CON ACCESO:
router.get('/analytics',
  auth,
  role(['admin', 'manager', 'analyst']),
  getAnalyticsController
);

// 🔓 RUTA PÚBLICA (sin role):
router.get('/public-info', publicInfoController);

// 🔒 RUTA AUTENTICADA PERO SIN RESTRICCIÓN DE ROL:
router.get('/profile', auth, getProfileController);

==========================================
🎭 CASOS DE RESPUESTA:
==========================================

✅ ACCESO PERMITIDO:
Usuario: { id: 123, username: "juan", role: "admin" }
Ruta: role(['admin', 'moderator'])
→ "admin" está en ['admin', 'moderator']
→ next() → Controller ejecuta

❌ ROL INSUFICIENTE:
Usuario: { id: 456, username: "pedro", role: "user" }
Ruta: role(['admin'])
→ "user" NO está en ['admin']
→ Response: 403 "No tienes permisos para realizar esta acción."

❌ USUARIO NO AUTENTICADO:
req.user: undefined (auth.js falló o no se ejecutó)
Ruta: role(['admin'])
→ !req.user es true
→ Response: 403 "No tienes permisos para realizar esta acción."

❌ ROL UNDEFINED:
Usuario: { id: 789, username: "ana", role: null }
Ruta: role(['admin'])
→ null NO está en ['admin']
→ Response: 403 "No tienes permisos para realizar esta acción."

==========================================
🏗️ ARQUITECTURA DE PERMISOS TÍPICA:
==========================================

📊 JERARQUÍA DE ROLES COMÚN:
- admin: Acceso total (crear, leer, actualizar, eliminar todo)
- manager: Gestión de usuarios y contenido
- moderator: Moderar contenido, ban usuarios
- editor: Crear y editar contenido
- user: Acceso básico, solo sus propios datos

🎯 EJEMPLO DE SISTEMA COMPLETO:
// Gestión de usuarios (solo admin):
router.post('/users', auth, role(['admin']), createUser);
router.delete('/users/:id', auth, role(['admin']), deleteUser);

// Moderación (admin o moderator):
router.post('/ban/:id', auth, role(['admin', 'moderator']), banUser);
router.delete('/posts/:id', auth, role(['admin', 'moderator']), deletePost);

// Contenido (admin, manager o editor):
router.post('/articles', auth, role(['admin', 'manager', 'editor']), createArticle);
router.put('/articles/:id', auth, role(['admin', 'manager', 'editor']), updateArticle);

// Datos personales (cualquier usuario autenticado):
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

// Información pública (sin restricciones):
router.get('/articles', getPublicArticles);

==========================================
🔧 EXTENSIONES Y MEJORAS OPCIONALES:
==========================================

📊 LOGGING Y AUDITORÍA:
return (req, res, next) => {
  console.log(`🔐 Verificando permisos para ${req.user?.username}: ${req.user?.role} en roles permitidos: ${roles}`);
  
  if (!req.user || !roles.includes(req.user.role)) {
    console.warn(`⚠️  Acceso denegado para ${req.user?.username || 'usuario no autenticado'} a ${req.originalUrl}`);
    return res.status(403).json('No tienes permisos para realizar esta acción.');
  }
  
  console.log(`✅ Acceso permitido para ${req.user.username}`);
  next();
};

🎯 AUTORIZACIÓN GRANULAR:
// Verificar propiedad de recursos:
const requireOwnership = (req, res, next) => {
  const resourceUserId = req.params.userId;
  const currentUserId = req.user.id;
  
  if (req.user.role === 'admin' || resourceUserId == currentUserId) {
    return next();
  }
  
  return res.status(403).json('Solo puedes acceder a tus propios recursos');
};

🔒 PERMISOS DINÁMICOS:
// Basado en base de datos:
const requirePermission = (permission) => {
  return async (req, res, next) => {
    const userPermissions = await getUserPermissions(req.user.id);
    
    if (userPermissions.includes(permission)) {
      return next();
    }
    
    return res.status(403).json(`Permiso requerido: ${permission}`);
  };
};

📈 MÉTRICAS DE ACCESO:
return (req, res, next) => {
  metrics.increment('authorization.check', {
    role: req.user?.role,
    endpoint: req.route?.path,
    allowed_roles: roles.join(',')
  });
  
  if (!req.user || !roles.includes(req.user.role)) {
    metrics.increment('authorization.denied');
    return res.status(403).json('No tienes permisos para realizar esta acción.');
  }
  
  metrics.increment('authorization.granted');
  next();
};

==========================================
🛡️ CONSIDERACIONES DE SEGURIDAD:
==========================================

⚠️  ORDEN DE MIDDLEWARES CRÍTICO:
// ✅ CORRECTO:
router.delete('/admin-action', auth, role(['admin']), controller);

// ❌ INCORRECTO:
router.delete('/admin-action', role(['admin']), auth, controller);
// role() se ejecutaría antes que auth(), req.user no existiría

🔐 PRINCIPIO DE MENOR PRIVILEGIO:
// Dar solo los permisos mínimos necesarios:
// ❌ Demasiado permisivo:
router.get('/user-data', auth, role(['admin', 'manager', 'editor', 'user']), controller);

// ✅ Apropiado:
router.get('/user-data', auth, controller); // Cualquier usuario autenticado

🎯 FAIL SECURE:
// Denegar por defecto si hay dudas:
if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
  return res.status(403).json('Acceso denegado');
}

📊 AUDITORÍA DE ACCESOS:
// Registrar intentos de acceso denegado para detectar ataques:
console.log(`🚨 Acceso denegado: Usuario ${req.user?.username} intentó acceder a ${req.originalUrl} sin permisos`);
*/