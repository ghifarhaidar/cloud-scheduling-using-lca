require('dotenv').config();
const express = require("express");
const cors = require('cors');


const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorHandler');
const corsOptions = require('./config/corsOptions');

const app = express();




const PORT = process.env.PORT || 3000;

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
	console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
	next();
});


// API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
	res.json({
		success: true,
		message: 'Server is running',
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV
	});
});

const hostname = process.env.HOST_NAME

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
	console.log(`🚀 Server running on http://${hostname}:${PORT}`);
	console.log(`📊 Environment: ${process.env.NODE_ENV}`);
	console.log(`📁 Working directory: ${process.env.WEB_DIR}`);
});
