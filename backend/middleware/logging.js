const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const { MAIN_DIR } = require('../config/config');

// Ensure logs directory exists
const logsDir = path.join(MAIN_DIR, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Create a write stream for logging (in append mode)
const accessLogStream = fs.createWriteStream(
    path.join(logsDir, 'access.log'),
    { flags: 'a' }
);

// Custom token for ISO timestamp
morgan.token('date', () => new Date().toISOString());

// Common format for both streams
const format = ':date - :method :url :status :response-time ms - :res[content-length]';

// Morgan middleware for console
const consoleLogger = morgan(format);

// Morgan middleware for file
const fileLogger = morgan(format, { stream: accessLogStream });

module.exports = { consoleLogger, fileLogger };