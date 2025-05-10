const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Xeno CRM API',
      version: '1.0.0',
      description: 'API for Xeno SDE Internship Mini CRM Platform',
    },
    servers: [{ url: 'http://localhost:5000/api' }],
  },
  apis: ['./routes/*.js'],
};

export default swaggerOptions;
