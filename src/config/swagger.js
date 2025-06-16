import swaggerJSDoc from 'swagger-jsdoc';

/**
 * Configuración de Swagger/OpenAPI para documentación automática de la API
 */

// Definición base de la documentación OpenAPI
const swaggerDefinition = {
  openapi: '3.0.0',  // Versión de OpenAPI Specification

  // Información general de la API
  info: {
    title: 'API de Facturación',
    version: '1.0.0',
    description: 'API para gestión de clientes, inmuebles, propietarios y facturas',
    contact: {
      name: 'Endi',
      email: 'endifraymv@hotmail.com'
    }
  },

  // Configuración de servidores donde corre la API
  servers: [
    {
      url: 'http://localhost:3600/api',    // URL base de desarrollo
      description: 'Servidor de desarrollo'
    }
    // Aquí podrías agregar más servidores (staging, production)
  ],

  // Componentes reutilizables (esquemas de autenticación, modelos, etc.)
  components: {
    securitySchemes: {
      bearerAuth: {             // Esquema de autenticación JWT
        type: 'http',
        scheme: 'bearer',       // Authorization: Bearer <token>
        bearerFormat: 'JWT'     // Especifica que el token es JWT
      }
    }
    // Aquí podrías definir schemas, responses, parameters reutilizables
  },

  // Seguridad global aplicada a todos los endpoints (a menos que se sobrescriba)
  security: [
    {
      bearerAuth: []           // Todos los endpoints requieren JWT por defecto
    }
  ]
};

// Opciones para swagger-jsdoc
const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js'],   // Archivos donde buscar anotaciones @swagger
};

// Generar la especificación Swagger completa
const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;

/**
 * USO:
 * 1. En app.js: import swaggerSpec from './swagger.js'
 * 2. Con swagger-ui-express: app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
 * 3. En routes/*.js: agregar comentarios JSDoc con @swagger para documentar endpoints
 *
 * EJEMPLO DE ANOTACIÓN EN RUTA:
 * /**
 *  * @swagger
 *  * /bills:
 *  *   get:
 *  *     summary: Obtener todas las facturas
 *  *     tags: [Bills]
 *  *     responses:
 *  *       200:
 *  *         description: Lista de facturas
 *  * /
 */