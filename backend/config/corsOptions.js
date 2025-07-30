const allowedOrigins = {
    development: ['http://localhost:5173', 'http://172.25.1.141:5173'],
    production: ['http://localhost:5173', 'http://172.25.1.141:5173']
};

const corsOptions = {
    origin: (origin, callback) => {
        const env = process.env.NODE_ENV || 'development';
        const whitelist = allowedOrigins[env];
        if (!origin || whitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};

module.exports = corsOptions;
