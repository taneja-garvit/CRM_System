const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { mongoConnect } = require('./config/db');
const swaggerOptions = require('./config/swagger');
const configurePassport = require('./config/passport'); // Load Passport config
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const orderRoutes = require('./routes/orders');
const campaignRoutes = require('./routes/campaigns');
const deliveryRoutes = require('./routes/delivery');
const errorHandler = require('./utils/errorHandler');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());
//adding axios
configurePassport(); // Initialize Google strategy

// Swagger Setup
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/delivery', deliveryRoutes);

// Error Handling
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
mongoConnect().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});