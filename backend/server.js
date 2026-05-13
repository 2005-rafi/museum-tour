const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const museumRoutes = require('./routes/museumRoutes');
const artifactRoutes = require('./routes/artifactRoutes');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: function(origin, callback){
        // Allow requests with no origin (like mobile apps or curl requests)
        if(!origin) return callback(null, true);
        
        // In development, allow all origins
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Preflight request handler for all routes
app.options('*', cors());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Request Headers:', req.headers);
    console.log('Request Body:', req.body);
    next();
});

// Routes
app.use('/', museumRoutes);
app.use('/', artifactRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Detailed Error:', err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ 
        success: false,
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Default route
app.get('/', (req, res) => {
    res.json({ 
        success: true,
        message: 'Welcome to Museum API',
        version: '1.0.0',
        endpoints: {
            museums: '/api/museums',
            artifacts: '/api/artifacts'
        },
        documentation: '/api-docs'
    });
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        suggestedEndpoints: {
            museums: '/api/museums',
            artifacts: '/api/artifacts'
        }
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
