// Variables de entorno requeridas para el entorno de tests.
// No usar valores reales — estas claves son solo para tests unitarios.
process.env.JWT_SECRET = 'test-jwt-secret-only-not-for-production';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-only-not-for-production';
process.env.NODE_ENV = 'test';
