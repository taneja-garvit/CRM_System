const backend = process.env.BACKEND_URL;
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Xeno CRM API',
      version: '1.0.0',
      description: 'API for Xeno SDE Internship Mini CRM Platform',
    },
    servers: [{ url: `${backend}/api` }],
  },
  apis: ['./routes/*.js'],
};

export default swaggerOptions;
