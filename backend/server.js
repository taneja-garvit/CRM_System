import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { mongoConnect } from './config/db.js';
import swaggerOptions from './config/swagger.js';
import configurePassport from './config/passport.js'; // Load Passport config
import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customers.js';
import orderRoutes from './routes/orders.js';
import campaignRoutes from './routes/campaigns.js';
import deliveryRoutes from './routes/delivery.js';
import errorHandler from './utils/errorHandler.js';
import dotenv from 'dotenv';
dotenv.config();


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
