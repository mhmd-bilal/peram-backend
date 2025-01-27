import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API for second-hand product seller site',
    },
    servers: [
      {
        url: 'https://peram-backend.onrender.com/',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '64f1a2b3c8e9f7a1b2c3d4e5',
            },
            email: {
              type: 'string',
              example: 'user@example.com',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-09-01T12:34:56.789Z',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [], // Explicitly typing this array will resolve the issue
      } as Record<string, any[]>,
    ], // Apply globally
  },
  apis: ['./src/routes/*.ts'], // Ensure this matches your file structure
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export { swaggerDocs, swaggerUi };
