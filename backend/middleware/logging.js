const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const { MAIN_DIR } = require('../config/config');
const { createLogger, transports, format } = require('winston');

// Ensure logs directory exists
const logsDir = path.join(MAIN_DIR, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Morgan for HTTP request logging
const accessLogStream = fs.createWriteStream(
    path.join(logsDir, 'access.log'),
    { flags: 'a' }
);
morgan.token('date', () => new Date().toISOString());
const morganFormat = ':date - :method :url :status :response-time ms - :res[content-length]';
const consoleLogger = morgan(morganFormat);
const fileLogger = morgan(morganFormat, { stream: accessLogStream });

// Winston for general-purpose logging
const appLogger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new transports.File({ filename: path.join(logsDir, 'app.log') }),
        new transports.Console()
    ]
});

module.exports = { consoleLogger, fileLogger, appLogger };