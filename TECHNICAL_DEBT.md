# Deuda técnica

## swagger-jsdoc — url.parse() deprecation warning

**Problema**: Node.js muestra DEP0169 al arrancar porque swagger-jsdoc@6.2.8
usa internamente @apidevtools/json-schema-ref-parser que llama a url.parse().

**Impacto**: Solo un warning en consola. No afecta funcionalidad ni seguridad.

**Solución pendiente**: Actualizar a swagger-jsdoc@7.x cuando salga versión
estable y verificar compatibilidad con la configuración actual de Swagger.

**Fecha detectado**: Marzo 2026
