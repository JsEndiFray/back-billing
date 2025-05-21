import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API de Facturación',
    version: '1.0.0',
    description: 'API para gestión de clientes, inmuebles, propietarios y facturas',
    contact: {
      name: 'Endi',
      email: 'endifraymv@hotmail.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3600/api',
      description: 'Servidor de desarrollo'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js'], //Rutas donde buscar anotaciones de swagger
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;