const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const database = require('./config/database');
const errorMiddleware = require('./middleware/error.middleware');
const notFoundMiddleware = require('./middleware/notFound.middleware');

// Route imports
const categoryRoutes = require('./routes/category.routes');
const subcategoryRoutes = require('./routes/subcategory.routes');
const familyRoutes = require('./routes/family.routes');
const productRoutes = require('./routes/product.routes');
const filterRoutes = require('./routes/filter.routes');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Rate Limiting (Capped at 100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// Request Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', async (req, res, next) => {
  try {
    const isDbConnected = await database.checkConnection();
    if (!isDbConnected) {
      return res.status(500).json({
        success: false,
        message: 'eFocus API is running but the database is unavailable.'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'eFocus API is running and database is connected successfully.'
    });
  } catch (error) {
    next(error);
  }
});

// Mount Resource Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/products', productRoutes);
app.use('/api/filters', filterRoutes);

// Unmatched Route (404) Handler
app.use(notFoundMiddleware);

// Centralized Error Handling Middleware
app.use(errorMiddleware);

module.exports = app;
